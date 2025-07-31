import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { IdeaTag } from "./IdeaTag";
import { IdeaWithDetails } from "../-fn/getIdeaFn";
import { isAdminEmail } from "~/lib/config";
import { DeleteIdeaButton } from "./DeleteIdeaButton";
import { useIdea } from "../-hooks/useIdea";
import { UpvoteButton } from "./UpvoteButton";

interface IdeaCardProps {
  idea: IdeaWithDetails;
  onTagClick: (tagName: string) => void;
  selectedTags: string[];
}

export function IdeaCard({ idea, onTagClick, selectedTags }: IdeaCardProps) {
  const [ideaData, setIdeaData] = useState<IdeaWithDetails>(idea);

  const { data: ideaQueryData } = useIdea({ ideaData });

  useEffect(() => {
    if (ideaQueryData) {
      setIdeaData(ideaQueryData);
    }
  }, [ideaQueryData]);

  useEffect(() => {
    setIdeaData(idea);
  }, [idea]);

  // Get current user id from session
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const isAdmin = isAdminEmail(session?.user?.email);

  // Track which idea is being deleted and modal open state
  const [deleteTarget, setDeleteTarget] = useState<null | {
    id: string;
    title: string;
  }>(null);

  return (
    <>
      <DeleteIdeaButton
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
      />
      <div className="relative modern-card group">
        {/* Absolutely positioned action buttons in top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <UpvoteButton ideaData={ideaData} currentUserId={currentUserId} />

          {(ideaData.userId === currentUserId || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete idea"
              onClick={() =>
                setDeleteTarget({ id: ideaData.id, title: ideaData.title })
              }
              className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="pr-24">
          <div className="font-bold leading-tight tracking-tight mb-4 text-2xl gradient-text transition-all duration-300">
            {ideaData.title}
          </div>
          {ideaData.description && (
            <div className="text-muted-foreground mb-6 leading-relaxed">
              {ideaData.description}
            </div>
          )}
          {ideaData.tags && ideaData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {ideaData.tags.map((tag: { id: string; name: string }) => (
                <IdeaTag
                  key={tag.id}
                  name={tag.name}
                  isSelected={selectedTags.includes(tag.name)}
                  onClick={onTagClick}
                />
              ))}
            </div>
          )}
          {ideaData.tags && ideaData.tags.length === 0 && (
            <div className="flex items-center gap-2 text-muted-foreground mb-6 leading-relaxed">
              <span className="animate-spin ml-2">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </span>
              Generating tags...
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <Avatar className="size-8 ring-2 ring-border">
            <AvatarImage src={ideaData?.userImage ?? undefined} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
              {ideaData?.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="text-sm font-medium text-foreground">
              {ideaData?.userName || "Anonymous"}
            </div>
            <div className="text-xs text-muted-foreground">
              {ideaData.createdAt
                ? new Date(ideaData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown date"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
