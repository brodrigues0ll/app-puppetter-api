import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  earnings: { type: String },
  expenses: { type: String },
  result: { type: String },
  balance: { type: String },
});

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
