import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useUpdateIdeaStatus } from "../-hooks/useUpdateIdeaStatus";

interface PublishIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  currentPublishedState: boolean;
}

export function PublishIdeaDialog({ 
  isOpen, 
  onClose, 
  ideaId, 
  ideaTitle, 
  currentPublishedState 
}: PublishIdeaDialogProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const updateIdeaStatusMutation = useUpdateIdeaStatus();

  const handleConfirm = () => {
    updateIdeaStatusMutation.mutate({
      data: {
        ideaId,
        published: !currentPublishedState,
        youtubeUrl: youtubeUrl.trim() || undefined,
      },
    });
    onClose();
    setYoutubeUrl("");
  };

  const handleCancel = () => {
    onClose();
    setYoutubeUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentPublishedState ? "Unpublish Idea" : "Publish Idea"}
          </DialogTitle>
          <DialogDescription>
            {currentPublishedState 
              ? `Are you sure you want to mark "${ideaTitle}" as unpublished?`
              : `Are you sure you want to mark "${ideaTitle}" as published?`}
          </DialogDescription>
        </DialogHeader>
        
        {!currentPublishedState && (
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube Video URL (Optional)</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={updateIdeaStatusMutation.isPending}
          >
            {updateIdeaStatusMutation.isPending ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}