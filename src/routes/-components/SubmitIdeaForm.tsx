import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
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
import { createIdeaFn } from "../-actions/createIdeaFn";
import { Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
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
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Idea"
            )}
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
