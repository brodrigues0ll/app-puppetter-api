import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET() {
  try {
    await connectDB();
    const reports = await Report.find({}).sort({ date: 1 });
    return NextResponse.json({ success: true, data: reports });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
