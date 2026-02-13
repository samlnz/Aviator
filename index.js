require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: { origin: "*" }
});
const db = require("./database.js");

const HTTP_PORT = process.env.PORT || 3000;

// Unity decompression headers middleware
app.use("/unity", (req, res, next) => {
    if (req.url.endsWith(".unityweb")) {
        res.set("Content-Encoding", "gzip");
        if (req.url.endsWith(".wasm.unityweb")) res.set("Content-Type", "application/wasm");
        if (req.url.endsWith(".data.unityweb")) res.set("Content-Type", "application/octet-stream");
        if (req.url.endsWith(".framework.js.unityweb")) res.set("Content-Type", "application/javascript");
    }
    next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, "dist")));

// Game State Variables
let gameState = "BET"; 
let currentNum = 1.0;
let timeRemaining = 5000; 
let history = [1.54, 2.31, 1.05, 12.42, 1.22, 2.10, 3.50];
let lastUpdateTime = Date.now();
let flightTime = 0;

// Game Loop
setInterval(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;

    if (gameState === "BET") {
        timeRemaining -= deltaTime;
        if (timeRemaining <= 0) {
            gameState = "PLAYING";
            currentNum = 1.0;
            flightTime = 0;
            io.emit("gameState", { currentNum: 1.0, GameState: "PLAYING", time: 0 });
        }
    } else if (gameState === "PLAYING") {
        flightTime += deltaTime;
        let seconds = flightTime / 1000;
        currentNum = 1 + 0.06 * seconds + Math.pow((0.06 * seconds), 2);
        
        if (Math.random() < 0.005 + (currentNum * 0.001)) {
            gameState = "GAMEEND";
            history.unshift(Number(currentNum.toFixed(2)));
            if (history.length > 20) history.pop();
            
            io.emit("gameState", { currentNum, GameState: "GAMEEND", time: flightTime });
            io.emit("history", history);
            
            setTimeout(() => {
                gameState = "BET";
                timeRemaining = 8000;
                currentNum = 1.0;
                lastUpdateTime = Date.now();
            }, 4000);
        }
    }

    io.emit("gameState", {
        currentNum: Number(currentNum.toFixed(2)),
        GameState: gameState,
        time: gameState === "BET" ? Math.max(0, timeRemaining) : flightTime
    });
}, 100);

io.on("connection", (socket) => {
    socket.on("enterRoom", () => {
        socket.emit("myInfo", {
            balance: 5000.00,
            userName: "Guest_" + socket.id.substring(0, 4),
            userType: false,
            f: { betted: false, auto: false },
            s: { betted: false, auto: false }
        });
        socket.emit("gameState", { currentNum, GameState: gameState, time: gameState === "BET" ? timeRemaining : flightTime });
        socket.emit("history", history);
    });

    socket.on("playBet", (data) => {
        socket.emit("success", "Bet Accepted");
    });
});

app.get("/api/users", (req, res) => {
    db.all("select * from user", [], (err, rows) => {
        res.json({ message: "success", data: rows });
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

http.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});
