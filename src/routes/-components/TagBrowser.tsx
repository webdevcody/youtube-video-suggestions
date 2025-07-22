import React from "react";
import { IdeaTag } from "./IdeaTag";

type Idea = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  userImage: string | null;
  userName: string | null;
  upvoteId: string | null;
  upvoteCount: number;
  tags: { id: string; name: string }[];
};

interface TagBrowserProps {
  ideas: Idea[] | undefined;
  selectedTags: string[];
  onTagClick: (tagName: string) => void;
}

export function TagBrowser({
  ideas,
  selectedTags,
  onTagClick,
}: TagBrowserProps) {
  // Extract all unique tags from all ideas
  const allTags = React.useMemo(() => {
    if (!ideas) return [];

    const tagMap = new Map<
      string,
      { id: string; name: string; count: number }
    >();

    ideas.forEach((idea) => {
      idea.tags.forEach((tag) => {
        if (tagMap.has(tag.name)) {
          const existing = tagMap.get(tag.name)!;
          existing.count += 1;
        } else {
          tagMap.set(tag.name, { ...tag, count: 1 });
        }
      });
    });

    // Sort tags by count (most used first), then alphabetically
    return Array.from(tagMap.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
  }, [ideas]);

  if (!ideas || allTags.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mt-4">Browse Tags</h2>
        <p className="text-sm text-muted-foreground">
          No tags available yet. Tags will appear here when ideas are created
          with tags.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mt-4">Browse Tags</h2>
      <p className="text-sm text-muted-foreground">
        Click on tags to filter ideas. Selected tags will be combined.
      </p>
      <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/30">
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 my-1">
              <IdeaTag
                name={`${tag.name} (${tag.count})`}
                isSelected={selectedTags.includes(tag.name)}
                onClick={() => onTagClick(tag.name)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
