import mongoose , {Schema} from "mongoose";

const userSchema = new Schema({
  socketId:
   { type: String,
     required: true,
      unique: true 
    },
  username: { 
    type: String,
     required: true 
    },
  roomId: {
     type: String, 
     required: true
     },
}, 
{ 
    timestamps: true 
}
);

const User = mongoose.model("User", userSchema);

export default User;
