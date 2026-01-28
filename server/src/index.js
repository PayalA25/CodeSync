import dotenv from "dotenv" 
dotenv.config({ path: './.env'});


import connectDB from "./db/index.js";
import {app , server} from "./app.js"




connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 8000} this is the src(index.js)`);
    });
  })
  .catch((e) => {
    console.log("❌ Mongo connection failed", e);
  });