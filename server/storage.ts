import { Event, type InsertEvent } from "@shared/schema";
import eventsData from "./data/events.json";

export interface IStorage {
  getAllEvents(): Promise<Event[]>;
  getDailyEvents(date: string): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private events: Event[];

  constructor() {
    // Load events from JSON file and add IDs
    this.events = eventsData.map((event, index) => ({
      id: index + 1,
      name: event.name,
      year: event.year
    }));
  }

  async getAllEvents(): Promise<Event[]> {
    return this.events;
  }

  async getDailyEvents(date: string): Promise<Event[]> {
    // Generate deterministic daily events based on date
    const seed = this.dateToSeed(date);
    const shuffledEvents = this.shuffleArray([...this.events], seed);
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

export const storage = new MemStorage();
