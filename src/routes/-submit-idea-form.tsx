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
import { idea, tag, ideaTag } from "~/db/schema";
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "~/utils/env";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export const createIdeaFn = createServerFn()
  .validator(schema)
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

    // --- AI Tagging Logic (Vercel AI SDK, generateObject) ---
    let tags: string[] = [];
    try {
      const prompt = `Extract 3-7 short, relevant tags (single words or short phrases, no # or @) for the following idea. Return a JSON object with a 'tags' array.\n\nTitle: ${data.title}\nDescription: ${data.description ?? ""}`;
      const tagSchema = z.object({
        tags: z.array(z.string().min(1).max(32)).min(3).max(7),
      });
      type TagResult = { tags: string[] };
      const result = await generateObject<TagResult>({
        model: openai("gpt-4o-mini"),
        schema: tagSchema,
        prompt,
      });
      tags =
        result.object && Array.isArray(result.object.tags)
          ? result.object.tags
          : [];
    } catch (err) {
      tags = [];
    }

    // Insert tags and link to idea (bulk upsert)
    if (tags.length > 0) {
      const now = new Date();
      // Prepare tag rows
      const tagRows = tags.map((tagName) => ({
        id: crypto.randomUUID(),
        name: tagName,
        createdAt: now,
        updatedAt: now,
      }));
      // Upsert all tags (ignore if exists)
      await database
        .insert(tag)
        .values(tagRows)
        .onConflictDoNothing({ target: tag.name });

      // Fetch all tag IDs for these names
      const dbTags = await database.query.tag.findMany({
        where: (t, { inArray }) => inArray(t.name, tags),
      });
      // Prepare ideaTag rows
      const ideaTagRows = dbTags.map((t) => ({
        id: crypto.randomUUID(),
        ideaId: newIdea.id,
        tagId: t.id,
        createdAt: now,
        updatedAt: now,
      }));
      // Upsert all ideaTag links (ignore if exists)
      if (ideaTagRows.length > 0) {
        await database
          .insert(ideaTag)
          .values(ideaTagRows)
          .onConflictDoNothing({ target: [ideaTag.ideaId, ideaTag.tagId] });
      }
    }

    return newIdea;
  });

function IdeaFormHooked({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });

  const { mutate: createIdea, isPending: isCreating } = useMutation({
    mutationFn: createIdeaFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea created!", {
        description: "Your idea has been submitted successfully.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!session && !sessionLoading) {
      setShowLoginDialog(true);
      return;
    }
    createIdea({ data });
  };

  return (
    <>
      <Form {...form}>
        <form
          className="w-full mx-auto flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Idea title"
                    disabled={isCreating}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description (optional)"
                    rows={3}
                    disabled={isCreating}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Idea"}
          </Button>
        </form>
      </Form>
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

export { IdeaFormHooked };

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
