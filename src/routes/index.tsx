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
    <div className="grid gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg bg-card">
          <div className="flex flex-row items-center justify-between p-4 border-b">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-5 w-5 ml-2" />
          </div>
          <div className="p-4 flex gap-2 items-center">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
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
    <div className="p-4 container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="my-4 flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Video Suggestions</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="h-4 w-4" /> Submit Idea
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit a new idea</DialogTitle>
                </DialogHeader>
                <IdeaFormHooked onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <IdeaFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onRemoveTag={removeTag}
            onClearAllTags={clearAllTags}
          />

          {isLoading && <IdeasSkeleton />}
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            {!filteredIdeas || filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2">
                    {searchTerm.trim() || selectedTags.length > 0
                      ? "No matching ideas found"
                      : "No ideas yet"}
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm.trim() || selectedTags.length > 0
                      ? "Try adjusting your search terms or filters, or create a new idea."
                      : "Create or upload your first idea suggestion below!"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 mb-8 pr-2">
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
          <div className="sticky top-4">
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
