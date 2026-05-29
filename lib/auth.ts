import { SignJWT, jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "assignment_auth_token";
const oneDayInSeconds = 60 * 60 * 24;

type AuthPayload = {
  userId: string;
  email: string;
  role: "mentor" | "admin";
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET in environment variables.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${oneDayInSeconds}s`)
    .sign(getAuthSecret());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getAuthSecret());
  return payload as AuthPayload;
}

export { AUTH_COOKIE_NAME };
export type { AuthPayload };
