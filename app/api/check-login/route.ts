
import { NextResponse } from "next/server";
import getUserEmail from "@/utils/getUserEmail";

export async function POST() {
  try {
    const email = await getUserEmail();
    
    if (email) {
      return NextResponse.json({ email: email }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Check-login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
