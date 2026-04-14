import { SignJWT, jwtVerify } from "jose";

const getSecret = (): Uint8Array => {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET or JWT_SECRET is required");
  return new TextEncoder().encode(secret);
};

export async function signJwt(payload: Record<string, unknown>, expiresIn = "7d"): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyJwt<T extends Record<string, unknown>>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as T;
}
