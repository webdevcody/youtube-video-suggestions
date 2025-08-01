import { EventEmitter } from "events";

export const serverEvents = new EventEmitter();

export type TagsGeneratedEvent = {
  type: "tags-generated";
  ideaId: string;
  userId: string;
  tags: Array<{ id: string; name: string }>;
};

export type IdeaCreatedEvent = {
  type: "idea-created";
  ideaId: string;
  userId: string;
  sessionId: string;
};

export type IdeaDeletedEvent = {
  type: "idea-deleted";
  ideaId: string;
  userId: string;
  sessionId: string;
};

export type ServerEvent = TagsGeneratedEvent | IdeaCreatedEvent | IdeaDeletedEvent;
