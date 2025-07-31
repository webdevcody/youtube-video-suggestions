import SubmitIdeaButton from "./SubmitIdeaButton";

export default function IdeaHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2">
          Video Suggestions
        </h1>
        <p className="text-muted-foreground text-base lg:text-lg">
          Share and discover amazing video ideas for Web Dev Cody
        </p>
      </div>
      <div className="flex-shrink-0">
        <SubmitIdeaButton text="Submit Idea" />
      </div>
    </div>
  );
}
