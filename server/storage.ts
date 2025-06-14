import { events, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import eventsData from "./data/events.json";

export interface IStorage {
  getAllEvents(): Promise<Event[]>;
  getDailyEvents(date: string): Promise<Event[]>;
  initializeEvents(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeEvents(): Promise<void> {
    // Check if events table is empty
    const existingEvents = await db.select().from(events).limit(1);
    
    if (existingEvents.length === 0) {
      // Populate the database with events from JSON
      const eventsToInsert = eventsData.map((event) => ({
        name: event.name,
        year: event.year
      }));
      
      await db.insert(events).values(eventsToInsert);
      console.log(`Initialized database with ${eventsToInsert.length} historical events`);
    }
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getDailyEvents(date: string): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    
    // Generate deterministic daily events based on date
    const seed = this.dateToSeed(date);
    const shuffledEvents = this.shuffleArray([...allEvents], seed);
    return shuffledEvents.slice(0, 6);
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
