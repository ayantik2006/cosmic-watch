import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectMongoDb } from "@/db/connectMongoDb";
import User from "@/models/User";

async function getUserEmail(): Promise<string | null> {
  try {
    const jwtToken = (await cookies()).get("user")?.value;
    if (!jwtToken) return null;

    const decoded = jwt.verify(
      String(jwtToken),
      String(process.env.JWT_SECRET)
    ) as JwtPayload;

    const userEmail = decoded.user;
    if (!userEmail) return null;

    await connectMongoDb();
    const userData = await User.findOne({ email: userEmail }, "email");

    if (userData?.email) return userEmail;
    else return null;
  } catch (error) {
    console.error("Error in getUserEmail:", error);
    return null;
  }
}

export default getUserEmail;