import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IdeaCard } from "./-components/IdeaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IdeaFormHooked } from "./-components/SubmitIdeaForm";
import React from "react";
import { Plus } from "lucide-react";
import { getIdeasFn } from "./-actions/getIdeasFn";
import { IdeaFilter } from "./-components/IdeaFilter";
import { TagBrowser } from "./-components/TagBrowser";

export const Route = createFileRoute("/")({
  component: Home,
});

function IdeasSkeleton() {
  return (
    <div className="grid gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="modern-card">
          <div className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <div>
              <Skeleton className="h-7 w-40 mb-3" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-6 ml-2" />
          </div>
          <div className="pt-4 flex gap-3 items-center">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Home() {
  const { data: ideas, isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeasFn,
  });

  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Function to toggle tag selection
  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  };

  // Function to remove a specific tag
  const removeTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagName));
  };

  // Function to clear all selected tags
  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // Filter ideas based on search term and selected tags
  const filteredIdeas = React.useMemo(() => {
    if (!ideas) {
      return [];
    }

    let filtered = ideas;

    // Filter by search term
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(lowercaseSearch) ||
          (idea.description &&
            idea.description.toLowerCase().includes(lowercaseSearch))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((idea) =>
        selectedTags.every((selectedTag) =>
          idea.tags.some(
            (tag: { id: string; name: string }) => tag.name === selectedTag
          )
        )
      );
    }

    return filtered;
  }, [ideas, searchTerm, selectedTags]);

  return (
    <div className="p-6 container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="my-6 flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold gradient-text mb-2">
                Video Suggestions
              </h1>
              <p className="text-muted-foreground text-lg">
                Share and discover amazing video ideas for Web Dev Cody
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="modern-button">
                  <Plus className="h-5 w-5 mr-2" /> Submit Idea
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Submit a new idea
                  </DialogTitle>
                </DialogHeader>
                <IdeaFormHooked onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <IdeaFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTags={selectedTags}
              onRemoveTag={removeTag}
              onClearAllTags={clearAllTags}
            />
          </div>

          {isLoading && <IdeasSkeleton />}
          <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2">
            {!filteredIdeas || filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-8 py-16">
                <div className="text-center">
                  <h4 className="text-2xl font-semibold mb-4 gradient-text">
                    {searchTerm.trim() || selectedTags.length > 0
                      ? "No matching ideas found"
                      : "No ideas yet"}
                  </h4>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md">
                    {searchTerm.trim() || selectedTags.length > 0
                      ? "Try adjusting your search terms or filters, or create a new idea."
                      : "Create or upload your first idea suggestion below!"}
                  </p>
                  <Button
                    className="modern-button"
                    onClick={() => setOpen(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" /> Create First Idea
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 mb-8">
                {filteredIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onTagClick={toggleTag}
                    selectedTags={selectedTags}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag Browser Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TagBrowser
              ideas={ideas}
              selectedTags={selectedTags}
              onTagClick={toggleTag}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
