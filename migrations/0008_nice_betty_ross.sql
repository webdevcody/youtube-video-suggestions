CREATE INDEX "idx_idea_user_id" ON "idea" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_idea_tag_idea_id" ON "idea_tag" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "idx_idea_tag_tag_id" ON "idea_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_upvote_idea_id" ON "upvote" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "idx_upvote_user_id" ON "upvote" USING btree ("user_id");