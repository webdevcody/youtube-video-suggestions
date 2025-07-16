import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import z from "zod";
import { database } from "~/db";
import { idea } from "~/db/schema";
import { isAuthenticated } from "~/utils/middleware";
import { authClient } from "~/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import React from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export const createIdeaFn = createServerFn()
  .validator(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
    })
  )
  .middleware([isAuthenticated])
  .handler(async ({ data, context }) => {
    const newIdea = {
      id: crypto.randomUUID(),
      userId: context.userId as string,
      title: data.title,
      description: data.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await database.insert(idea).values(newIdea);
    return newIdea;
  });

function IdeaFormHooked() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);

  const { mutate: createIdea, isPending: isCreating } = useMutation({
    mutationFn: createIdeaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea created!", {
        description: "Your idea has been submitted successfully.",
      });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ title: string; description?: string }>();

  const onSubmit = (data: { title: string; description?: string }) => {
    if (!session && !sessionLoading) {
      setShowLoginDialog(true);
      return;
    }
    createIdea({ data });
    reset();
  };

  return (
    <>
      <form
        className="w-full max-w-md mx-auto flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <input
            {...register("title", { required: "Title is required" })}
            type="text"
            placeholder="Idea title"
            className="border rounded px-3 py-2 w-full"
            disabled={isCreating}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <textarea
            {...register("description")}
            placeholder="Description (optional)"
            className="border rounded px-3 py-2 w-full"
            rows={3}
            disabled={isCreating}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground rounded px-4 py-2 font-semibold"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Idea"}
        </button>
      </form>
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You must be logged in to submit an idea. Please login to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                })
              }
            >
              Sign In
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SubmitIdeaForm() {
  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Submit a new idea</CardTitle>
          <CardDescription>
            Share your suggestion or idea with the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IdeaFormHooked />
        </CardContent>
      </Card>
    </>
  );
}
