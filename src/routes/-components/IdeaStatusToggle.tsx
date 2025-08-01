import { Button } from "~/components/ui/button";

interface IdeaStatusToggleProps {
  showPublished: boolean;
  onToggle: (showPublished: boolean) => void;
  freshCount?: number;
  publishedCount?: number;
}

export function IdeaStatusToggle({
  showPublished,
  onToggle,
  freshCount,
  publishedCount,
}: IdeaStatusToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-xl w-fit">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(false)}
        className={`${
          !showPublished ? "toggle-button-active" : "toggle-button-inactive"
        } px-4 py-2 rounded-lg`}
      >
        New Ideas
        {freshCount !== undefined && (
          <span
            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              !showPublished
                ? "bg-white/20 text-white"
                : "bg-background/50 text-muted-foreground"
            }`}
          >
            {freshCount}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(true)}
        className={`${
          showPublished ? "toggle-button-active" : "toggle-button-inactive"
        } px-4 py-2 rounded-lg`}
      >
        Published
        {publishedCount !== undefined && (
          <span
            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              showPublished
                ? "bg-white/20 text-white"
                : "bg-background/50 text-muted-foreground"
            }`}
          >
            {publishedCount}
          </span>
        )}
      </Button>
    </div>
  );
}
