import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const compiler = asyncHandler(async (req, res) => {
    const { code, language ,roomId } = req.body;

    // Language configuration for JDoodle API
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

    if (!languageConfig[language]) {
        throw new ApiError(400, "Unsupported programming language");
    }   
    if (roomId && language) {
      await RoomCode.updateOne(
        { roomId },
        { $set: { language } },
        { upsert: true }
      );
    }

     const response = await axios.post(
        "https://api.jdoodle.com/v1/execute", 
        {
      script: code,
      language: language,
      versionIndex: languageConfig[language].versionIndex,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
  },
   );
    
  return res
  .status(200)
  .json(
    new ApiResponse(200,
      {
      output: response.data.output,
      error: response.data.error,
    }, 
    "Code executed successfully"
  )
  );
});

export {
    compiler
    }
    

