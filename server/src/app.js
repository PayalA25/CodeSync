import express from "express" ; 
import cors from 'cors'
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";


import ACTIONS from "../Action.js";
import RoomCode from "./models/rootCode.model.js";
import User from "./models/user.model.js";

dotenv.config();

const app = express() ;
const server = http.createServer(app);


// middleware
app.use(cors()) ;
app.use(express.json()); 

// app.use(express.json({limit: "10kb"}))
// app.use(express.urlencoded({extended: true , limit:"16kb"}))
// app.use(express.static("public"))
// app.use(cookieParser());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  //console.log("🔌 Connected:", socket.id);

  // JOIN ROOM
  socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
    try {
      socket.join(roomId);

      // save/update user
      await User.findOneAndUpdate(
       { roomId, username },          //  stable identity
      { 
        $set: { socketId: socket.id } // update socketId if reconnect
      },
      { upsert: true, new: true }
    );

      // get or create room safely
      const room = await RoomCode.findOneAndUpdate(
        { roomId },
        { $setOnInsert: { roomId, code: "" , language: "java"} }, // default empty code
        { upsert: true, new: true }
      );

      // send latest code to new user
      socket.emit(ACTIONS.CODE_CHANGE, {
        
        code: room.code || "" , language: room.language || "java"});

      // notify all users in room
      const users = await User.find({ roomId });
      io.to(roomId).emit(ACTIONS.JOINED, {
        clients: users,
        username,
        socketId: socket.id,
      });
    } catch (error) {
      console.error("JOIN ROOM ERROR:", error.message);
    }
  });
  socket.on(ACTIONS.LANGUAGE_CHANGE, async ({ roomId, language }) => {
  console.log("🔥 LANGUAGE RECEIVED:", language);

  await RoomCode.updateOne(
    { roomId },
    { $set: { language } }
  );

  socket.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, {
    language,
  });
});


  // CODE CHANGE
  socket.on(ACTIONS.CODE_CHANGE, async ({ roomId, code  }) => {
      //console.log("🔥 LANGUAGE RECEIVED:", language);
    try {
      await RoomCode.updateOne(
        { roomId },
        { 
          code  
        }
        );
      socket.to(roomId).emit(ACTIONS.CODE_CHANGE, {
         code 
         
        });
    } catch (error) {
      console.error("CODE CHANGE ERROR:", error.message);
    }
  });

  // DISCONNECT
  socket.on("disconnecting", async () => {
    try {
      const rooms = [...socket.rooms];

      for (const roomId of rooms) {
        if (roomId === socket.id) continue; // skip default personal room

        const user = await User.findOneAndDelete({
          socketId: socket.id,
          roomId,
        });

        socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: user?.username,
        });
      }
    } catch (error) {
      console.error("DISCONNECT ERROR:", error.message);
    }
  });
});

// routes
import compilerRoute from "./routes/compiler.routes.js";
app.use("/", compilerRoute);

export { app, server };