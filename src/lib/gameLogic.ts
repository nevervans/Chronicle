import { GameEvent } from "@/types/game";

export function checkTimelineCorrect(timeline: (GameEvent | null)[]): boolean {
  const validEvents = timeline.filter((event): event is GameEvent => event !== null);
  
  if (validEvents.length !== timeline.length) {
    return false;
  }
  
  // Check if events are in chronological order
  for (let i = 1; i < validEvents.length; i++) {
    if (validEvents[i].year < validEvents[i - 1].year) {
      return false;
    }
  }
  
  return true;
}

export function getCorrectOrder(events: GameEvent[]): GameEvent[] {
  return [...events].sort((a, b) => a.year - b.year);
}

export function formatShareText(won: boolean, attempts: number): string {
  const result = won ? `✅ ${attempts}/5` : '❌ X/5';
  return `Chronicle Daily Timeline\n${result}\n\nPlay at: ${window.location.href}`;
}

export function isTimelineFull(timeline: (GameEvent | null)[]): boolean {
  return timeline.every(slot => slot !== null);
}
