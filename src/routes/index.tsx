import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "~/utils/auth";
import { getWebRequest } from "@tanstack/react-start/server";

export const Route = createFileRoute("/")({
  component: Home,
});

export const doStuff = createServerFn()
  .validator(
    z.object({
      name: z.string(),
    })
  )
  .handler(async ({ data, context }) => {
    const request = getWebRequest();
    if (!request?.headers) {
      return null;
    }
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      throw new Error("Unauthorized");
    }

    return {
      message: `Hello ${data.name}`,
    };
  });

function Home() {
  const { mutate } = useMutation({
    mutationFn: doStuff,
  });

  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>

      <button onClick={() => mutate({ data: { name: "John" } })}>
        Do Stuff
      </button>
    </div>
  );
}
