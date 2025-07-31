import { useQuery } from "@tanstack/react-query";
import { IdeaTag } from "./IdeaTag";
import { getTagsFn } from "../-fn/getTagsFn";

interface TagBrowserProps {
  selectedTags: string[];
  onTagClick: (tagName: string) => void;
}

export function TagBrowser({ selectedTags, onTagClick }: TagBrowserProps) {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsFn,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Browse Tags</h2>
          <p className="text-muted-foreground">Loading tags...</p>
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
        <h2 className="text-2xl font-bold gradient-text mb-2">Browse Tags</h2>
        <p className="text-muted-foreground">
          Click on tags to filter ideas. Selected tags will be combined.
        </p>
      </div>

      <div className="modern-card">
        <div className="max-h-96 overflow-y-auto">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div key={tag.name} className="flex items-center gap-2 my-1">
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
    </div>
  );
}
