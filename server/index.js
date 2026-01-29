import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import ACTIONS from "./Action.js"; 

dotenv.config();

const app = express();
const server = http.createServer(app);

const languageConfig = {
  python3: { versionIndex: "3" },
  java: { versionIndex: "3" },
  cpp: { versionIndex: "4" },
  nodejs: { versionIndex: "3" },
  c: { versionIndex: "4" },
  ruby: { versionIndex: "3" },
  go: { versionIndex: "3" },
  scala: { versionIndex: "3" },
  bash: { versionIndex: "3" },
  sql: { versionIndex: "3" },
  pascal: { versionIndex: "2" },
  csharp: { versionIndex: "3" },
  php: { versionIndex: "3" },
  swift: { versionIndex: "3" },
  rust: { versionIndex: "3" },
  r: { versionIndex: "3" },
};

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- Global state ---
const userSocketMap = {};       // socketId -> username
const roomCode = new Map();     // roomId -> latest code

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

io.on("connection", (socket) => {

  // --- User joins a room ---
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);


    // Send list of clients to everyone in room
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
 


    // Send existing code to new user
    const existingCode = roomCode.get(roomId);
    if (existingCode) {
    socket.emit(ACTIONS.CODE_CHANGE, { code: existingCode });
  }
  });

  // sync the code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
  //  store latest code
  roomCode.set(roomId, code);
  //  send code to everyone else in the room
  socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code }); 
  });
});


  // leave room (disconnect)
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    const username = userSocketMap[socket.id];

    rooms.forEach((roomId) => {
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username,
      });
    });

    delete userSocketMap[socket.id];
    //socket.leave();
  });

   });
app.post("/compile", async (req, res) => {
  const { code, language } = req.body;
  
  // 1️⃣ validate inputs
  if (!code || !language) {
    return res.status(400).json({
      error: "Code or language missing",
    });
  }

  // 2️⃣ validate language
  const config = languageConfig[language];
  if (!config) {
    return res.status(400).json({
      error: `Unsupported language: ${language}`,
    });
  }
  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      script: code,
      language,
      versionIndex: config.versionIndex,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    }
  );

     return res.status(200).json({
      statusCode: 200,
      data: {
        output: response.data.output,
        error: response.data.error,
      },
      message: "Code executed successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      data: {
        output: "",
        error: "Failed to compile code",
      },
      message: "Internal server error",
      success: false,
    });
  }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT} this is main index.js`));