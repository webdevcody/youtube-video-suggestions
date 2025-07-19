import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { IdeaTag } from "./IdeaTag";

interface IdeaFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onRemoveTag: (tagName: string) => void;
  onClearAllTags: () => void;
}

export function IdeaFilter({
  searchTerm,
  onSearchChange,
  selectedTags,
  onRemoveTag,
  onClearAllTags,
}: IdeaFilterProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search ideas by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Active filters:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllTags}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <IdeaTag
                key={tag}
                name={tag}
                variant="filter"
                onRemove={onRemoveTag}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
