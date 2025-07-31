import { EventEmitter } from "events";

export const serverEvents = new EventEmitter();

export type TagsGeneratedEvent = {
  type: "tags-generated";
  ideaId: string;
  userId: string;
  tags: Array<{ id: string; name: string }>;
};

export type ServerEvent = TagsGeneratedEvent;
