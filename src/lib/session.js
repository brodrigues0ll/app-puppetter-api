import { getToken } from "next-auth/jwt";

export async function getSessionUser(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) return null;
  return { id: token.userId, email: token.email };
}
