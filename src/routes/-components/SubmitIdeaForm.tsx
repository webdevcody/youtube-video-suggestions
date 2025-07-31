import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import {
  createIdeaSchema,
  type CreateIdeaFormData,
  IDEA_LIMITS,
} from "~/lib/schemas";
import { useCreateIdea } from "../-hooks/useCreateIdea";

function IdeaFormHooked({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);

  const form = useForm<CreateIdeaFormData>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: { title: "", description: "" },
  });

  const { mutate: createIdea, isPending: isCreating } = useCreateIdea({
    onSuccess: () => {
      form.reset();
    },
  });

  const onSubmit = (data: CreateIdeaFormData) => {
    if (!session && !sessionLoading) {
      setShowLoginDialog(true);
      return;
    }
    onSuccess?.();
    createIdea({ data });
  };

  return (
    <>
      <Form {...form}>
        <form
          className="w-full mx-auto flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your video idea title..."
                    disabled={isCreating}
                    maxLength={IDEA_LIMITS.title}
                    className="h-12 text-base rounded-xl border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <div className="text-right text-sm text-muted-foreground">
                  {field.value?.length || 0}/{IDEA_LIMITS.title}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your video idea in detail (optional)..."
                    rows={4}
                    disabled={isCreating}
                    maxLength={IDEA_LIMITS.description}
                    className="text-base rounded-xl border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                    {...field}
                  />
                </FormControl>
                <div className="text-right text-sm text-muted-foreground">
                  {field.value?.length || 0}/{IDEA_LIMITS.description}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isCreating}
            className="modern-button h-12 text-base font-semibold"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Idea...
              </>
            ) : (
              "Create Idea"
            )}
          </Button>
        </form>
      </Form>
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Login Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You must be logged in to submit an idea. Please login to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                })
              }
              className="modern-button flex-1"
            >
              Sign In
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Close
              </Button>
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
      <Card className="mb-8 modern-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text">
            Submit a new idea
          </CardTitle>
          <CardDescription className="text-lg">
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
