import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { asteroidId } = await req.json();
    const api_key = process.env.NEXT_PUBLIC_NASA_API_KEY;

    if (!api_key) {
      return NextResponse.json(
        { error: "NASA API Key missing" },
        { status: 500 }
      );
    }

    const url = `https://api.nasa.gov/neo/rest/v1/neo/${asteroidId}?api_key=${api_key}`;
    const response = await axios.get(url);

    if (!response.data?.close_approach_data) {
      throw new Error("Invalid NASA NEO response");
    }

    // ✅ LIMIT TO 6 (LATEST 6 APPROACHES)
    const asteroid = {
      ...response.data,
      close_approach_data: response.data.close_approach_data.slice(-6),
    };

    return NextResponse.json({ asteroid });

  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error_message ||
      error.message ||
      "Internal Server Error";

    return NextResponse.json(
      { error: "Planetary Intelligence Sync Failed", details: message },
      { status }
    );
  }
}