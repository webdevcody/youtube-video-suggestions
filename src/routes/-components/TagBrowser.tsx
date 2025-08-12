import { useQuery } from "@tanstack/react-query";
import { useState, memo, useCallback } from "react";
import { X, Edit3, Trash2 } from "lucide-react";
import { IdeaTag } from "./IdeaTag";
import { getTagsFn } from "../-fn/getTagsFn";
import { useDeleteTags } from "../-hooks/useDeleteTags";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";
import { isAdminEmail } from "~/lib/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface TagBrowserProps {
  selectedTags: string[];
  onTagClick: (tagName: string) => void;
}

function TagBrowserComponent({ selectedTags, onTagClick }: TagBrowserProps) {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsFn,
  });
  
  const { data: sessionData } = authClient.useSession();
  const isAdmin = isAdminEmail(sessionData?.user?.email);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const deleteTagsMutation = useDeleteTags();
  
  const handleTagClick = useCallback((tagName: string) => {
    if (isEditMode) {
      // In edit mode, toggle selection for deletion
      setSelectedForDeletion(prev => 
        prev.includes(tagName)
          ? prev.filter(t => t !== tagName)
          : [...prev, tagName]
      );
    } else {
      // Normal mode - filter ideas
      onTagClick(tagName);
    }
  }, [isEditMode, onTagClick]);
  
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedForDeletion([]);
  };
  
  const handleDeleteConfirm = () => {
    deleteTagsMutation.mutate(
      { data: { tagNames: selectedForDeletion } },
      {
        onSuccess: () => {
          setIsEditMode(false);
          setSelectedForDeletion([]);
          setShowDeleteDialog(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Browse Tags</h2>
          <p className="text-muted-foreground">
            Click on tags to filter ideas. Selected tags will be combined.
          </p>
        </div>
        
        <div className="modern-card">
          <div className="max-h-96 overflow-y-auto">
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 rounded-full"
                  style={{ width: `${60 + Math.random() * 80}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Browse Tags</h2>
          <p className="text-muted-foreground">
            No tags available yet. Tags will appear here when ideas are created
            with tags.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold gradient-text">Browse Tags</h2>
          {isAdmin && (
            <Button
              variant={isEditMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => isEditMode ? handleCancelEdit() : setIsEditMode(true)}
              className="flex items-center gap-2"
            >
              {isEditMode ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit Tags
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          {isEditMode 
            ? "Select tags to delete. Click on tags to select them for deletion."
            : "Click on tags to filter ideas. Selected tags will be combined."
          }
        </p>
        {isEditMode && selectedForDeletion.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteTagsMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedForDeletion.length} tag{selectedForDeletion.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>

      <div className="modern-card">
        <div className="max-h-96 overflow-y-auto">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              const isSelectedForFilter = selectedTags.includes(tag.name);
              const isSelectedForDeletion = selectedForDeletion.includes(tag.name);
              
              return (
                <div key={tag.name} className="flex items-center gap-2 my-1 relative">
                  <div 
                    className={`transition-all duration-200 ${isEditMode && !isSelectedForDeletion ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <IdeaTag
                      name={`${tag.name} (${tag.count})`}
                      isSelected={isEditMode ? isSelectedForDeletion : isSelectedForFilter}
                      onClick={() => handleTagClick(tag.name)}
                    />
                  </div>
                  {isEditMode && (
                    <div className="absolute -top-1 -right-1 pointer-events-none">
                      <div className="bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tags</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the following tags? This action cannot be undone and will remove these tags from all ideas.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="flex flex-wrap gap-2">
              {selectedForDeletion.map((tagName) => (
                <div key={tagName} className="px-3 py-1 bg-destructive/20 text-destructive rounded-md text-sm font-medium">
                  {tagName}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteTagsMutation.isPending}
            >
              {deleteTagsMutation.isPending ? "Deleting..." : "Delete Tags"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Memoize TagBrowser to prevent unnecessary re-renders
export const TagBrowser = memo(TagBrowserComponent);

TagBrowser.displayName = "TagBrowser";
