import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { redirect } from "@tanstack/react-router";

export const isAuthenticated = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const request = getWebRequest();

  if (!request?.headers) {
    throw redirect({ to: "/" });
  }
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw redirect({ to: "/" });
  }

  return next({
    context: { userId: session.user.id },
  });
});

export const optionalAuthentication = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const request = getWebRequest();

  const session = await auth.api.getSession({ headers: request.headers });

  return next({
    context: { userId: session?.user.id },
  });
});

/**
 * Middleware that ensures the user is authenticated AND is an admin
 */
export const isAdmin = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const request = getWebRequest();

  if (!request?.headers) {
    throw redirect({ to: "/" });
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw redirect({ to: "/" });
  }

  if (session.user.email !== "webdevcody@gmail.com") {
    throw new Error("Unauthorized: Admin access required");
  }

  return next({
    context: { userId: session.user.id, isAdmin: true },
  });
});
