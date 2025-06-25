import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced events table with MongoDB-style structure
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  category: text("category").notNull().default("Science"),
  region: text("region").notNull().default("Global"),
  difficulty: text("difficulty").notNull().default("medium"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  usedInPuzzlesCount: integer("used_in_puzzles_count").notNull().default(0),
});

// Simplified daily puzzles table - stores both scheduled and random puzzles
export const dailyPuzzles = pgTable("daily_puzzles", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  event1Name: text("event1_name").notNull(),
  event1Year: integer("event1_year").notNull(),
  event2Name: text("event2_name").notNull(),
  event2Year: integer("event2_year").notNull(),
  event3Name: text("event3_name").notNull(),
  event3Year: integer("event3_year").notNull(),
  event4Name: text("event4_name").notNull(),
  event4Year: integer("event4_year").notNull(),
  event5Name: text("event5_name").notNull(),
  event5Year: integer("event5_year").notNull(),
  event6Name: text("event6_name").notNull(),
  event6Year: integer("event6_year").notNull(),
  isScheduled: boolean("is_scheduled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events);
export const insertDailyPuzzleSchema = createInsertSchema(dailyPuzzles);

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertDailyPuzzle = z.infer<typeof insertDailyPuzzleSchema>;
export type DailyPuzzle = typeof dailyPuzzles.$inferSelect;

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
  date: z.string(),
  subtitle: z.string().optional()
});

export type DailyEventsResponse = z.infer<typeof dailyEventsResponseSchema>;
