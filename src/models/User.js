import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  organizzeEmail: { type: String, default: "" },
  organizzeToken: { type: String, default: "" },
  dailyLimit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
