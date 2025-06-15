import { events, dailyPuzzles, type Event, type InsertEvent, type DailyPuzzle } from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray } from "drizzle-orm";
import eventsData from "./data/events.json";

export interface IStorage {
  getAllEvents(): Promise<Event[]>;
  getDailyEvents(date: string): Promise<Event[]>;
  initializeEvents(): Promise<void>;
  generateDailyPuzzle(date: string): Promise<Event[]>;
}

export class DatabaseStorage implements IStorage {
  async initializeEvents(): Promise<void> {
    // Check if events table is empty
    const existingEvents = await db.select().from(events).limit(1);
    
    if (existingEvents.length === 0) {
      // Populate the database with enhanced events from JSON
      const eventsToInsert = eventsData.map((event: any) => ({
        name: event.name,
        year: event.year,
        category: event.category || this.categorizeEvent(event.name),
        region: event.region || this.regionizeEvent(event.name),
        difficulty: event.difficulty || this.determineDifficulty(event.year),
        tags: event.tags || this.generateTags(event.name),
        usedInPuzzlesCount: 0
      }));
      
      await db.insert(events).values(eventsToInsert);
      console.log(`Initialized database with ${eventsToInsert.length} enhanced historical events`);
    }
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getDailyEvents(date: string): Promise<Event[]> {
    // Check if we already have a cached daily puzzle for this date
    const cachedPuzzle = await db.select().from(dailyPuzzles).where(eq(dailyPuzzles.date, date));
    
    if (cachedPuzzle.length > 0) {
      // Return cached events
      const puzzle = cachedPuzzle[0];
      const puzzleEvents = await db.select().from(events).where(inArray(events.id, puzzle.eventIds));
      return puzzleEvents;
    }
    
    // Generate new daily puzzle with diversity
    return await this.generateDailyPuzzle(date);
  }

  async generateDailyPuzzle(date: string): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    
    // Enhanced selection with diversity requirements
    const selectedEvents = this.selectDiverseEvents(allEvents, date);
    
    // Cache the puzzle
    const eventIds = selectedEvents.map(e => e.id);
    const correctOrder = selectedEvents
      .map((event, index) => ({ event, index }))
      .sort((a, b) => a.event.year - b.event.year)
      .map(item => item.index);
    
    const puzzleId = this.dateToSeed(date);
    
    await db.insert(dailyPuzzles).values({
      date,
      eventIds,
      correctOrder,
      puzzleId
    });
    
    // Update usage counts
    await Promise.all(
      eventIds.map(id => 
        db.update(events)
          .set({ usedInPuzzlesCount: sql`${events.usedInPuzzlesCount} + 1` })
          .where(eq(events.id, id))
      )
    );
    
    return selectedEvents;
  }

  private dateToSeed(dateString: string): number {
    const date = new Date(dateString);
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  }

  private shuffleArray<T>(array: T[], seed: number): T[] {
    // Simple seeded random number generator
    let random = seed;
    function seededRandom(): number {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    }

    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export const storage = new DatabaseStorage();
