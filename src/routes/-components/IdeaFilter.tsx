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
  searchResultCount?: number;
}

export function IdeaFilter({
  searchTerm,
  onSearchChange,
  selectedTags,
  onRemoveTag,
  onClearAllTags,
  searchResultCount,
}: IdeaFilterProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search ideas by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-12 h-12 text-base rounded-xl border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 transition-all duration-200"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>

      {searchTerm.trim() && searchResultCount !== undefined && (
        <div className="mt-3 px-2">
          <span className="text-sm text-muted-foreground">
            {searchResultCount} {searchResultCount === 1 ? 'idea' : 'ideas'} matching your search
          </span>
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">
              Active filters ({selectedTags.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllTags}
              className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
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
