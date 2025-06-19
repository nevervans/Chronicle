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

// Daily puzzles table for caching
export const dailyPuzzles = pgTable("daily_puzzles", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  eventIds: jsonb("event_ids").$type<number[]>().notNull(),
  correctOrder: jsonb("correct_order").$type<number[]>().notNull(),
  puzzleId: integer("puzzle_id").notNull(),
});

// Scheduled puzzles table for pre-planned events
export const scheduledPuzzles = pgTable("scheduled_puzzles", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  eventIds: jsonb("event_ids").$type<number[]>().notNull(),
  title: text("title"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events);
export const insertDailyPuzzleSchema = createInsertSchema(dailyPuzzles);
export const insertScheduledPuzzleSchema = createInsertSchema(scheduledPuzzles);

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertDailyPuzzle = z.infer<typeof insertDailyPuzzleSchema>;
export type DailyPuzzle = typeof dailyPuzzles.$inferSelect;
export type InsertScheduledPuzzle = z.infer<typeof insertScheduledPuzzleSchema>;
export type ScheduledPuzzle = typeof scheduledPuzzles.$inferSelect;

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
