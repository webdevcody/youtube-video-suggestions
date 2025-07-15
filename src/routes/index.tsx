import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { idea, user } from "~/db/schema";
import { database } from "~/db";
import { isAuthenticated } from "~/utils/middleware";
import { SubmitIdeaForm } from "./-submit-idea-form";
import { IdeaCard } from "./-idea-card";

export const Route = createFileRoute("/")({
  component: Home,
});

export const fetchIdeasFn = createServerFn()
  .middleware([isAuthenticated])
  .handler(async ({ context }) => {
    return await database
      .select({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
        userId: idea.userId,
        userImage: user.image,
        userName: user.name,
      })
      .from(idea)
      .leftJoin(user, eq(idea.userId, user.id));
  });

function Home() {
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: fetchIdeasFn,
  });

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-12">
      <div>
        <h3 className="text-2xl font-bold mb-4">Ideas</h3>
        {isLoading && <div>Loading...</div>}
        {!ideas || ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">No ideas yet</h4>
              <p className="text-muted-foreground mb-4">
                Create or upload your first idea suggestion below!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>

      <hr />

      <SubmitIdeaForm />
    </div>
  );
}
