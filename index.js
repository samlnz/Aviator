require('dotenv').config();
const express = require("express");
const app = express();
const db = require("./database.js");
const md5 = require("md5");
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: { origin: "*" }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set correct headers for Unity WebGL compressed files
app.use((req, res, next) => {
    if (req.url.endsWith(".unityweb")) {
        res.set("Content-Encoding", "gzip"); // Unity usually uses gzip or br. AirCrash files are likely gzip.
        if (req.url.endsWith(".wasm.unityweb")) res.set("Content-Type", "application/wasm");
        if (req.url.endsWith(".data.unityweb")) res.set("Content-Type", "application/octet-stream");
        if (req.url.endsWith(".framework.js.unityweb")) res.set("Content-Type", "application/javascript");
    }
    next();
});

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, "dist")));

const HTTP_PORT = process.env.PORT || 3000;

// Game State Variables
let gameState = "BET"; // BET, PLAYING, GAMEEND
let currentNum = 1.0;
let time = 10000; // Countdown time for BET state
let history = [1.54, 2.31, 1.05, 5.42, 1.22];
let lastUpdateTime = Date.now();

// Game Loop
function startGameLoop() {
    setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastUpdateTime;
        lastUpdateTime = now;

        if (gameState === "BET") {
            time -= deltaTime;
            if (time <= 0) {
                gameState = "PLAYING";
                currentNum = 1.0;
                time = 0; // In PLAYING, time represents elapsed flight time
                io.emit("gameState", { currentNum, GameState: gameState, time: 0 });
            }
        } else if (gameState === "PLAYING") {
            time += deltaTime;
            // Aviator formula: currentNum increases over time
            let seconds = time / 1000;
            currentNum = 1 + 0.06 * seconds + Math.pow((0.06 * seconds), 2);
            
            // Random crash logic (simplified)
            if (Math.random() < 0.01) { // Probability to crash
                gameState = "GAMEEND";
                history.unshift(Number(currentNum.toFixed(2)));
                if (history.length > 20) history.pop();
                
                io.emit("gameState", { currentNum, GameState: gameState, time });
                io.emit("history", history);
                
                // Restart after 3 seconds
                setTimeout(() => {
                    gameState = "BET";
                    time = 5000;
                    currentNum = 1.0;
                    lastUpdateTime = Date.now();
                }, 3000);
            }
        }

        // Broadcast state to all players
        io.emit("gameState", {
            currentNum: Number(currentNum.toFixed(2)),
            GameState: gameState,
            time: gameState === "BET" ? Math.max(0, time) : time
        });
    }, 100);
}

startGameLoop();

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);
    
    socket.on("enterRoom", (data) => {
        socket.emit("myInfo", {
            balance: 5000,
            userName: "Player_" + socket.id.substring(0, 4),
            userType: false,
            f: { betted: false, auto: false },
            s: { betted: false, auto: false }
        });
        socket.emit("gameState", { currentNum, GameState: gameState, time });
        socket.emit("history", history);
    });

    socket.on("playBet", (data) => {
        console.log("Bet received:", data);
        // Simulate success
        socket.emit("success", "Bet placed successfully!");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
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
    console.log("Server running on port " + HTTP_PORT);
});
