import { createFileRoute } from "@tanstack/react-router";
import { IdeaCard } from "./-components/IdeaCard";
import { Skeleton } from "@/components/ui/skeleton";

import React, { useCallback } from "react";
import { IdeaFilter } from "./-components/IdeaFilter";
import { TagBrowser } from "./-components/TagBrowser";
import SubmitIdeaButton from "./-components/SubmitIdeaButton";
import IdeaHeader from "./-components/IdeaHeader";
import {
  useServerEvents,
  subscribeToNewIdeas,
  getNewIdeasAvailable,
  clearNewIdeasAvailable,
} from "~/hooks/useServerEvents";
import { useGetIdeas } from "./-hooks/useGetIdeas";
import { IdeaStatusToggle } from "./-components/IdeaStatusToggle";
import { useGetIdeaCounts } from "./-hooks/useGetIdeaCounts";
import { Button } from "@/components/ui/button";
import { ArrowDown, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

// Custom hook to manage new ideas notification state
function useNewIdeasNotification() {
  const [hasNewIdeas, setHasNewIdeas] = React.useState(false);

  React.useEffect(() => {
    // Check initial state
    setHasNewIdeas(getNewIdeasAvailable());

    // Subscribe to new ideas events
    const unsubscribe = subscribeToNewIdeas(() => {
      setHasNewIdeas(true);
    });

    return unsubscribe;
  }, []);

  const clearNotification = React.useCallback(() => {
    clearNewIdeasAvailable();
    setHasNewIdeas(false);
  }, []);

  return { hasNewIdeas, clearNotification };
}

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
  // Set up SSE connection for real-time tag updates
  useServerEvents();

  const [showPublished, setShowPublished] = React.useState(false);
  const { data: ideas, isLoading, refetch } = useGetIdeas(showPublished);
  const { freshCount, publishedCount } = useGetIdeaCounts();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const { hasNewIdeas, clearNotification } = useNewIdeasNotification();

  const sortedIdeas = React.useMemo(() => {
    return ideas?.slice().sort((a, b) => {
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      // If upvoteCount is the same, order by title (case-insensitive)
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    });
  }, [ideas]);

  // Function to toggle tag selection - memoized to prevent re-renders
  const toggleTag = useCallback((tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  }, []);

  // Function to remove a specific tag - memoized
  const removeTag = useCallback((tagName: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagName));
  }, []);

  // Function to clear all selected tags - memoized
  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Function to manually refresh ideas
  const handleRefreshIdeas = React.useCallback(async () => {
    clearNotification();
    await refetch();
  }, [clearNotification, refetch]);

  // Filter ideas based on search term and selected tags
  const filteredIdeas = React.useMemo(() => {
    if (!sortedIdeas) {
      return [];
    }

    let filtered = sortedIdeas;

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
          idea.tags?.some(
            (tag: { id: string; name: string }) => tag.name === selectedTag
          )
        )
      );
    }

    return filtered;
  }, [sortedIdeas, searchTerm, selectedTags]);

  return (
    <div className="p-4 md:p-6 container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Header Section - Responsive Layout */}
          <div className="my-4 md:my-6 mb-6">
            <IdeaHeader />
          </div>

          <div className="mb-6 space-y-4">
            <IdeaStatusToggle
              showPublished={showPublished}
              onToggle={setShowPublished}
              freshCount={freshCount}
              publishedCount={publishedCount}
            />

            {hasNewIdeas && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gradient-primary-subtle/10 to-gradient-secondary-subtle/10 border border-gradient-secondary/20 dark:border-gradient-secondary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-full animate-pulse" />
                  <p className="text-sm font-medium gradient-text">
                    More ideas are available!
                  </p>
                </div>
                <Button onClick={handleRefreshIdeas} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load More
                </Button>
              </div>
            )}

            <IdeaFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTags={selectedTags}
              onRemoveTag={removeTag}
              onClearAllTags={clearAllTags}
              searchResultCount={filteredIdeas.length}
            />
          </div>

          {isLoading && <IdeasSkeleton />}

          {/* Ideas Container - Responsive Scrolling */}
          <div className="lg:h-[calc(100vh-280px)] lg:overflow-y-auto lg:pr-2">
            {!isLoading && (!filteredIdeas || filteredIdeas.length === 0) ? (
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
                  <SubmitIdeaButton text="Create First Idea" />
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

        {/* Tag Browser Sidebar - Hidden on mobile, stacked on tablet */}
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <TagBrowser selectedTags={selectedTags} onTagClick={toggleTag} />
          </div>
        </div>
      </div>
    </div>
  );
}
