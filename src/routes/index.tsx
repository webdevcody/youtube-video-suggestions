import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { todo } from "~/db/schema";
import { database } from "~/db";
import { isAuthenticated } from "~/utils/middleware";

export const Route = createFileRoute("/")({
  component: Home,
});

export const addTodoFn = createServerFn()
  .validator(
    z.object({
      title: z.string(),
    })
  )
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    await database.insert(todo).values({
      id: crypto.randomUUID(),
      title: data.title,
      userId: context.userId as string,
    });
  });

function Home() {
  const { mutate: addTodoMutation } = useMutation({
    mutationFn: addTodoFn,
  });

  return (
    <div className="p-2">
      <h3>Todos</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const title = formData.get("title") as string;
          addTodoMutation({ data: { title } });
        }}
      >
        <input type="text" name="title" />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}
