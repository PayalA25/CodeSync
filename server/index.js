const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const cors = require("cors");
const axios = require("axios");
const server = http.createServer(app);
require("dotenv").config();







io.on("connection", (socket) => {
  console.log('Socket connected', socket.id);
  
  });













const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is runnint on port ${PORT}`));