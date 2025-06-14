import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
});

export const insertEventSchema = createInsertSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Game-related schemas
export const gameResultSchema = z.object({
  events: z.array(z.object({
    name: z.string(),
    year: z.number()
  })),
  playerOrder: z.array(z.object({
    name: z.string(),
    year: z.number()
  })),
  attempts: z.number(),
  won: z.boolean()
});

export type GameResult = z.infer<typeof gameResultSchema>;

export const dailyEventsResponseSchema = z.object({
  events: z.array(z.object({
    name: z.string(),
    year: z.number()
  })),
  date: z.string()
});

export type DailyEventsResponse = z.infer<typeof dailyEventsResponseSchema>;
