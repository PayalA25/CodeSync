import mongoose , {Schema} from "mongoose";

const roomCodeSchema = new Schema(
    {
  roomId: {
     type: String, 
     required: true, 
     unique: true 
    },
  code: {
     type: String,
      default: ""
     },
  language: {
     type: String, 
     default: "java" 
     },
}, { 
    timestamps: true 
});

const RoomCode = mongoose.model("RoomCode", roomCodeSchema);

export default RoomCode;
