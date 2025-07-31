import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useDeleteIdea } from "../-hooks/useDeleteIdea";

export function DeleteIdeaButton({
  deleteTarget,
  setDeleteTarget,
}: {
  deleteTarget: { id: string; title: string } | null;
  setDeleteTarget: (target: { id: string; title: string } | null) => void;
}) {
  const { mutate: deleteIdea } = useDeleteIdea();

  return (
    <Dialog
      open={!!deleteTarget}
      onOpenChange={(open) => {
        if (!open) setDeleteTarget(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Delete Idea
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete "{deleteTarget?.title}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleteTarget) deleteIdea({ data: { id: deleteTarget.id } });
              setDeleteTarget(null);
            }}
            className="flex-1"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
