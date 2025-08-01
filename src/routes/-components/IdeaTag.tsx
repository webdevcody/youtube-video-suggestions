import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface IdeaTagProps {
  name: string;
  isSelected?: boolean;
  onClick?: (tagName: string) => void;
  onRemove?: (tagName: string) => void;
  variant?: "default" | "filter";
}

// Simple hash function to generate consistent colors from strings
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate a color palette index from hash
function getColorFromHash(str: string): string {
  const hash = hashString(str);

  // Generate HSL values for better control over contrast
  const hue = hash % 360;

  // Use CSS custom properties for light/dark mode support
  // We'll use different saturation and lightness for better contrast
  return `hsl(${hue}, 65%, var(--tag-lightness, 45%))`;
}

export function IdeaTag({
  name,
  isSelected = false,
  onClick,
  onRemove,
  variant = "default",
}: IdeaTagProps) {
  const tagColor = getColorFromHash(name);

  if (variant === "filter") {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border transition-all duration-200 hover:scale-105 hover:shadow-md"
        style={
          {
            backgroundColor: `${tagColor}15`, // 15% opacity
            borderColor: `${tagColor}40`, // 40% opacity
            color: tagColor,
            // CSS custom property for light/dark mode
            "--tag-lightness": "var(--tag-filter-lightness, 45%)",
          } as React.CSSProperties & { "--tag-lightness": string }
        }
      >
        <span className="font-medium">{name}</span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(name)}
            className="h-5 w-5 p-0 rounded-full hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all duration-200"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick?.(name)}
      disabled={!onClick}
      className={`inline-block px-3 py-1.5 rounded-xl text-sm border transition-all duration-200 hover:scale-105 hover:shadow-md ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${isSelected ? "shadow-md ring-2 ring-blue-500/20" : "hover:shadow-md"}`}
      style={
        {
          backgroundColor: isSelected
            ? `${tagColor}25` // 25% opacity for selected
            : `${tagColor}15`, // 15% opacity for default
          borderColor: isSelected
            ? `${tagColor}60` // 60% opacity for selected border
            : `${tagColor}30`, // 30% opacity for default border
          color: tagColor,
          // CSS custom property for responsive lightness
          "--tag-lightness": isSelected
            ? "var(--tag-selected-lightness, 40%)"
            : "var(--tag-default-lightness, 45%)",
        } as React.CSSProperties & { "--tag-lightness": string }
      }
    >
      <span className="font-medium">{name}</span>
    </button>
  );
}
