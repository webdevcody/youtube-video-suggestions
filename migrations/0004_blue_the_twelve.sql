CREATE TABLE "upvote" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"idea_id" text NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "upvote_user_id_idea_id_unique" UNIQUE("user_id","idea_id")
);
--> statement-breakpoint
DROP TABLE "todo" CASCADE;--> statement-breakpoint
ALTER TABLE "upvote" ADD CONSTRAINT "upvote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvote" ADD CONSTRAINT "upvote_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE no action ON UPDATE no action;