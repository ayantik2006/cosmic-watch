import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface RiskScoreParams {
  diameter_m: number;
  miss_distance_km: number;
  velocity_km_s: number;
  hazardous: boolean;
}

function calculateRiskScore({
  diameter_m,
  miss_distance_km,
  velocity_km_s,
  hazardous
}: RiskScoreParams) {
  const diameterScore = Math.min(diameter_m / 300, 1) * 30;

  const distanceScore =
    (1 - Math.min(miss_distance_km / 50_000_000, 1)) * 40;

  const velocityScore = Math.min(velocity_km_s / 25, 1) * 20;

  const hazardBonus = hazardous ? 10 : 0;

  const totalScore =
    diameterScore + distanceScore + velocityScore + hazardBonus;

  const riskScore = Math.round(Math.min(totalScore, 100));

  let riskLevel = "LOW";
  if (riskScore > 75) riskLevel = "CRITICAL";
  else if (riskScore > 50) riskLevel = "HIGH";
  else if (riskScore > 25) riskLevel = "MODERATE";

  return { riskScore, riskLevel };
}

function parseNeoFeedData(nasaResponse: any) {
  const result = [];

  const neoByDate = nasaResponse.near_earth_objects;

  for (const date in neoByDate) {
    for (const neo of neoByDate[date]) {
      const approach = neo.close_approach_data.find(
        (d: { orbiting_body: string; }) => d.orbiting_body === "Earth"
      );

      if (!approach) continue;

      const diameter_m =
        neo.estimated_diameter.meters.estimated_diameter_max;

      const velocity_km_s = parseFloat(
        approach.relative_velocity.kilometers_per_second
      );

      const miss_distance_km = parseFloat(
        approach.miss_distance.kilometers
      );

      const hazardous = neo.is_potentially_hazardous_asteroid;

      const { riskScore, riskLevel } = calculateRiskScore({
        diameter_m,
        miss_distance_km,
        velocity_km_s,
        hazardous
      });

      result.push({
        id: neo.id,
        name: neo.name,
        close_approach_date: approach.close_approach_date,
        diameter_m: Number(diameter_m.toFixed(2)),
        velocity_km_s: Number(velocity_km_s.toFixed(2)),
        miss_distance_km: Math.round(miss_distance_km),
        hazardous,
        riskScore,
        riskLevel
      });
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { start_date, end_date } = await req.json();
    const api_key = process.env.NEXT_PUBLIC_NASA_API_KEY;
    
    if (!api_key) {
      console.error("NASA API Key is missing");
      return NextResponse.json({ error: "Configuration Error: NASA API Key is missing" }, { status: 500 });
    }

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${api_key}`;
    console.log(`[API] Fetching NEO data for range: ${start_date} to ${end_date}`);

    const response = await axios.get(url);
    
    if (!response.data || !response.data.near_earth_objects) {
      console.error("Invalid response from NASA:", response.data);
      throw new Error("Invalid data structure received from NASA");
    }

    const asteroids = parseNeoFeedData(response.data);
    
    return NextResponse.json({
      count: asteroids.length,
      asteroids
    });
  } catch (error: any) {
    console.error("Asteroid Data API Error:", error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error_message || error.message || "Internal Server Error";
    
    return NextResponse.json(
      { error: "Planetary Intelligence Sync Failed", details: message },
      { status }
    );
  }
}