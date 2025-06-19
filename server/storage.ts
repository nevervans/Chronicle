import { events, dailyPuzzles, type Event, type InsertEvent, type DailyPuzzle } from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray } from "drizzle-orm";
import eventsData from "./data/events.json";

export interface IStorage {
  getAllEvents(): Promise<Event[]>;
  getDailyEvents(date: string): Promise<Event[]>;
  initializeEvents(): Promise<void>;
  generateDailyPuzzle(date: string): Promise<Event[]>;
  getScheduledPuzzle(date: string): Promise<ScheduledPuzzle | null>;
  createScheduledPuzzle(date: string, eventIds: number[], title?: string, description?: string): Promise<ScheduledPuzzle>;
  updateScheduledPuzzle(id: number, eventIds: number[], title?: string, description?: string): Promise<ScheduledPuzzle>;
  deleteScheduledPuzzle(id: number): Promise<void>;
  getUpcomingScheduledPuzzles(fromDate?: string): Promise<ScheduledPuzzle[]>;
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

  private selectDiverseEvents(allEvents: Event[], date: string): Event[] {
    const seed = this.dateToSeed(date);
    let selectedEvents: Event[] = [];
    
    // Seeded random number generator
    let random = seed;
    function seededRandom(): number {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    }
    
    // Distribute across different centuries for diversity
    const centuries = this.getDistributedCenturies(6);
    
    for (let i = 0; i < 6; i++) {
      const targetCentury = centuries[i];
      const centuryEvents = allEvents.filter(e => 
        Math.floor(e.year / 100) === targetCentury &&
        !selectedEvents.includes(e)
      );
      
      if (centuryEvents.length > 0) {
        // Prefer less used events for better variety
        const sortedEvents = centuryEvents.sort((a, b) => 
          a.usedInPuzzlesCount - b.usedInPuzzlesCount
        );
        
        const randomIndex = Math.floor(seededRandom() * Math.min(3, sortedEvents.length));
        selectedEvents.push(sortedEvents[randomIndex]);
      }
    }
    
    // Fill remaining slots if needed
    while (selectedEvents.length < 6) {
      const availableEvents = allEvents.filter(e => !selectedEvents.includes(e));
      if (availableEvents.length === 0) break;
      
      const randomIndex = Math.floor(seededRandom() * availableEvents.length);
      selectedEvents.push(availableEvents[randomIndex]);
    }
    
    return selectedEvents;
  }

  private getDistributedCenturies(count: number): number[] {
    // Distribute across different centuries (10th to 21st century)
    const centuries = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor((i / count) * centuries.length);
      selected.push(centuries[index]);
    }
    
    return selected;
  }

  private categorizeEvent(eventName: string): string {
    const name = eventName.toLowerCase();
    if (name.includes('war') || name.includes('battle') || name.includes('invasion')) return 'War';
    if (name.includes('discover') || name.includes('invent') || name.includes('first')) return 'Discovery';
    if (name.includes('empire') || name.includes('king') || name.includes('independence')) return 'Politics';
    if (name.includes('art') || name.includes('music') || name.includes('literature')) return 'Culture';
    if (name.includes('engine') || name.includes('computer') || name.includes('internet')) return 'Technology';
    return 'Science';
  }

  private regionizeEvent(eventName: string): string {
    const name = eventName.toLowerCase();
    if (name.includes('europe') || name.includes('france') || name.includes('england') || name.includes('germany')) return 'Europe';
    if (name.includes('china') || name.includes('japan') || name.includes('asia') || name.includes('india')) return 'Asia';
    if (name.includes('america') || name.includes('usa') || name.includes('mexico') || name.includes('brazil')) return 'Americas';
    if (name.includes('africa') || name.includes('egypt') || name.includes('south africa')) return 'Africa';
    return 'Global';
  }

  private determineDifficulty(year: number): string {
    if (year < 1000) return 'hard';
    if (year < 1500) return 'medium';
    if (year < 1800) return 'medium';
    return 'easy';
  }

  private generateTags(eventName: string): string[] {
    const tags = [];
    const name = eventName.toLowerCase();
    
    if (name.includes('war')) tags.push('war', 'conflict');
    if (name.includes('discover')) tags.push('discovery', 'exploration');
    if (name.includes('invent')) tags.push('invention', 'technology');
    if (name.includes('first')) tags.push('first', 'milestone');
    if (name.includes('revolution')) tags.push('revolution', 'change');
    
    return tags.length > 0 ? tags : ['history'];
  }
}

export const storage = new DatabaseStorage();
