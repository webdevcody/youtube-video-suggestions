ALTER TABLE "idea_tag" DROP CONSTRAINT "idea_tag_idea_id_idea_id_fk";
--> statement-breakpoint
ALTER TABLE "upvote" DROP CONSTRAINT "upvote_idea_id_idea_id_fk";
--> statement-breakpoint
ALTER TABLE "idea_tag" ADD CONSTRAINT "idea_tag_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvote" ADD CONSTRAINT "upvote_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE cascade ON UPDATE no action;