DROP INDEX "idx_idea_tag_idea_id";--> statement-breakpoint
DROP INDEX "idx_upvote_idea_id";--> statement-breakpoint
CREATE INDEX "idx_idea_tag_composite" ON "idea_tag" USING btree ("idea_id","tag_id");--> statement-breakpoint
CREATE INDEX "idx_upvote_idea_user_composite" ON "upvote" USING btree ("idea_id","user_id");