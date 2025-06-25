import { events, dailyPuzzles, type Event, type InsertEvent, type DailyPuzzle } from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray } from "drizzle-orm";
import eventsData from "./data/events.json";

export interface IStorage {
  getAllEvents(): Promise<Event[]>;
  getDailyEvents(date: string): Promise<Event[]>;
  getDailyEventsWithSubtitle(date: string): Promise<{ events: Event[], title?: string, subtitle?: string, description?: string }>;
  initializeEvents(): Promise<void>;
  generateDailyPuzzle(date: string): Promise<Event[]>;
  createDailyPuzzle(date: string, events: Event[], title?: string, description?: string, subtitle?: string): Promise<DailyPuzzle>;
  getDailyPuzzlesForAdmin(): Promise<DailyPuzzle[]>;
  updateDailyPuzzle(id: number, events: Event[], title?: string, description?: string, subtitle?: string): Promise<DailyPuzzle>;
  deleteDailyPuzzle(id: number): Promise<void>;
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
    return await this.generateDailyPuzzle(date);
  }

  async getDailyEventsWithSubtitle(date: string): Promise<{ events: Event[], subtitle?: string }> {
    // Check if we already have a puzzle for this date
    const [existingPuzzle] = await db
      .select()
      .from(dailyPuzzles)
      .where(eq(dailyPuzzles.date, date));

    if (existingPuzzle) {
      // Return puzzle events from stored names and years along with subtitle
      const events = [
        { id: 1, name: existingPuzzle.event1Name, year: existingPuzzle.event1Year },
        { id: 2, name: existingPuzzle.event2Name, year: existingPuzzle.event2Year },
        { id: 3, name: existingPuzzle.event3Name, year: existingPuzzle.event3Year },
        { id: 4, name: existingPuzzle.event4Name, year: existingPuzzle.event4Year },
        { id: 5, name: existingPuzzle.event5Name, year: existingPuzzle.event5Year },
        { id: 6, name: existingPuzzle.event6Name, year: existingPuzzle.event6Year },
      ] as Event[];
      
      return {
        events,
        title: existingPuzzle.title || undefined,
        subtitle: existingPuzzle.subtitle || undefined,
        description: existingPuzzle.description || undefined
      };
    }

    // Generate new random puzzle - no subtitle for random puzzles
    const events = await this.generateDailyPuzzle(date);
    return { events };
  }

  async generateDailyPuzzle(date: string): Promise<Event[]> {
    // Check if we already have a puzzle for this date
    const [existingPuzzle] = await db
      .select()
      .from(dailyPuzzles)
      .where(eq(dailyPuzzles.date, date));

    if (existingPuzzle) {
      // Return puzzle events from stored names and years
      return [
        { id: 1, name: existingPuzzle.event1Name, year: existingPuzzle.event1Year },
        { id: 2, name: existingPuzzle.event2Name, year: existingPuzzle.event2Year },
        { id: 3, name: existingPuzzle.event3Name, year: existingPuzzle.event3Year },
        { id: 4, name: existingPuzzle.event4Name, year: existingPuzzle.event4Year },
        { id: 5, name: existingPuzzle.event5Name, year: existingPuzzle.event5Year },
        { id: 6, name: existingPuzzle.event6Name, year: existingPuzzle.event6Year },
      ] as Event[];
    }

    // Generate new random puzzle only if no existing puzzle
    const allEvents = await this.getAllEvents();
    const selectedEvents = this.selectDiverseEvents(allEvents, date);
    
    // Store puzzle in new simplified format
    await db.insert(dailyPuzzles).values({
      date,
      event1Name: selectedEvents[0].name,
      event1Year: selectedEvents[0].year,
      event2Name: selectedEvents[1].name,
      event2Year: selectedEvents[1].year,
      event3Name: selectedEvents[2].name,
      event3Year: selectedEvents[2].year,
      event4Name: selectedEvents[3].name,
      event4Year: selectedEvents[3].year,
      event5Name: selectedEvents[4].name,
      event5Year: selectedEvents[4].year,
      event6Name: selectedEvents[5].name,
      event6Year: selectedEvents[5].year,
      isScheduled: false,
    });
    
    return selectedEvents;
  }

  async createDailyPuzzle(date: string, events: Event[], title?: string, description?: string, subtitle?: string): Promise<DailyPuzzle> {
    const [newPuzzle] = await db
      .insert(dailyPuzzles)
      .values({
        date,
        title,
        subtitle,
        description,
        event1Name: events[0].name,
        event1Year: events[0].year,
        event2Name: events[1].name,
        event2Year: events[1].year,
        event3Name: events[2].name,
        event3Year: events[2].year,
        event4Name: events[3].name,
        event4Year: events[3].year,
        event5Name: events[4].name,
        event5Year: events[4].year,
        event6Name: events[5].name,
        event6Year: events[5].year,
        isScheduled: !!title,
      })
      .returning();
    
    return newPuzzle;
  }

  async getDailyPuzzlesForAdmin(): Promise<DailyPuzzle[]> {
    return db
      .select()
      .from(dailyPuzzles)
      .orderBy(dailyPuzzles.date);
  }

  async updateDailyPuzzle(id: number, events: Event[], title?: string, description?: string, subtitle?: string): Promise<DailyPuzzle> {
    const [updatedPuzzle] = await db
      .update(dailyPuzzles)
      .set({
        title,
        subtitle,
        description,
        event1Name: events[0].name,
        event1Year: events[0].year,
        event2Name: events[1].name,
        event2Year: events[1].year,
        event3Name: events[2].name,
        event3Year: events[2].year,
        event4Name: events[3].name,
        event4Year: events[3].year,
        event5Name: events[4].name,
        event5Year: events[4].year,
        event6Name: events[5].name,
        event6Year: events[5].year,
        isScheduled: !!title,
      })
      .where(eq(dailyPuzzles.id, id))
      .returning();
    
    return updatedPuzzle;
  }

  async deleteDailyPuzzle(id: number): Promise<void> {
    await db
      .delete(dailyPuzzles)
      .where(eq(dailyPuzzles.id, id));
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
