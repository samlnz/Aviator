var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")
var path = require("path")
var http = require("http").Server(app)
var io = require("socket.io")(http, {
    cors: {
        origin: "*",
    }
})

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, "dist")));

var HTTP_PORT = process.env.PORT || 3000

// Socket.io basic setup to prevent frontend from crashing
io.on("connection", (socket) => {
    console.log("A user connected");
    
    socket.on("enterRoom", (data) => {
        console.log("User entered room", data);
        // Emit some initial state if needed
        socket.emit("myInfo", {
            balance: 1000,
            userName: "Guest",
            f: { betted: false, auto: false },
            s: { betted: false, auto: false }
        });
        socket.emit("gameState", {
            currentNum: 1.0,
            GameState: "BET",
            time: 10
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// API Endpoints
app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Fallback to index.html for SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
http.listen(HTTP_PORT, () => {
    console.log("Server running on port " + HTTP_PORT)
});

app.use(function(req, res){
    res.status(404).json({"error": "Not Found"});
});
