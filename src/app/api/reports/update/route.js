import { NextResponse } from "next/server";
import { updateReports } from "@/lib/updateReports";

export async function GET(req) {
  try {
    // const secret = req.headers.get("x-api-key");
    // if (secret !== process.env.REPORTS_CRON_KEY) {
    //   return NextResponse.json(
    //     { success: false, error: "Acesso negado" },
    //     { status: 403 }
    //   );
    // }

    const data = await updateReports();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
