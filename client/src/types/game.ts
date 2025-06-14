export interface GameEvent {
  name: string;
  year: number;
}

export interface GameState {
  currentEvents: GameEvent[];
  timelineOrder: (GameEvent | null)[];
  attempts: number;
  maxAttempts: number;
  gameComplete: boolean;
  gameWon: boolean;
  gameDate: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  totalAttempts: number;
  lastPlayedDate: string | null;
}

export interface DragItem {
  eventName: string;
  sourceType: 'pool' | 'timeline';
  sourceIndex?: number;
}
