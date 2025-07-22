import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "./auth";

export async function isUserAdmin(): Promise<boolean> {
  const request = getWebRequest();

  if (!request?.headers) {
    return false;
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.email) {
    return false;
  }

  return session.user.email === "webdevcody@gmail.com";
}
