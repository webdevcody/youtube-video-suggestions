import {
  boolean,
  text,
  timestamp,
  pgTable,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const userRelations = relations(user, ({ one, many }) => ({
  // One-to-many: user has many ideas
  ideas: many(idea),
  // One-to-many: user has many upvotes
  upvotes: many(upvote),
  // One-to-many: user has many sessions
  sessions: many(session),
  // One-to-many: user has many accounts
  accounts: many(account),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const sessionRelations = relations(session, ({ one }) => ({
  // Many-to-one: session belongs to one user
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const accountRelations = relations(account, ({ one }) => ({
  // Many-to-one: account belongs to one user
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const idea = pgTable(
  "idea",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    title: text("title").notNull(),
    description: text("description"),
    published: boolean("published").notNull().default(false),
    youtubeUrl: text("youtube_url"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("idx_idea_user_id").on(table.userId)]
);

export const ideaRelations = relations(idea, ({ one, many }) => ({
  // Many-to-one: idea belongs to one user
  user: one(user, {
    fields: [idea.userId],
    references: [user.id],
  }),
  // One-to-many: idea has many upvotes
  upvotes: many(upvote),
  // One-to-many: idea has many ideaTags (junction table)
  ideaTags: many(ideaTag),
}));

export const upvote = pgTable(
  "upvote",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    ideaId: text("idea_id")
      .notNull()
      .references(() => idea.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    unique().on(table.userId, table.ideaId),
    index("idx_upvote_user_id").on(table.userId),
    index("idx_upvote_idea_user_composite").on(table.ideaId, table.userId),
  ]
);

export const upvoteRelations = relations(upvote, ({ one }) => ({
  // Many-to-one: upvote belongs to one user
  user: one(user, {
    fields: [upvote.userId],
    references: [user.id],
  }),
  // Many-to-one: upvote belongs to one idea
  idea: one(idea, {
    fields: [upvote.ideaId],
    references: [idea.id],
  }),
}));

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const tagRelations = relations(tag, ({ many }) => ({
  // One-to-many: tag has many ideaTags (junction table)
  ideaTags: many(ideaTag),
}));

export const ideaTag = pgTable(
  "idea_tag",
  {
    id: text("id").primaryKey(),
    ideaId: text("idea_id")
      .notNull()
      .references(() => idea.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    unique().on(table.ideaId, table.tagId),
    index("idx_idea_tag_tag_id").on(table.tagId),
    index("idx_idea_tag_composite").on(table.ideaId, table.tagId),
  ]
);

export const ideaTagRelations = relations(ideaTag, ({ one }) => ({
  // Many-to-one: ideaTag belongs to one idea
  idea: one(idea, {
    fields: [ideaTag.ideaId],
    references: [idea.id],
  }),
  // Many-to-one: ideaTag belongs to one tag
  tag: one(tag, {
    fields: [ideaTag.tagId],
    references: [tag.id],
  }),
}));

export const config = pgTable("config", {
  id: text("id").primaryKey(), // always 'singleton' or similar
  openaiTagGenerations: text("openai_tag_generations").notNull(), // store as string for compatibility, parse as int
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export type Idea = typeof idea.$inferSelect;
export type IdeaTag = typeof ideaTag.$inferSelect;
export type Tag = typeof tag.$inferSelect;
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Upvote = typeof upvote.$inferSelect;
export type Config = typeof config.$inferSelect;
