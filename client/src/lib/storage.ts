import { GameStats } from "@/types/game";

const STORAGE_KEY = 'chronicleStats';

export function loadStats(): GameStats {
  try {
    const stats = localStorage.getItem(STORAGE_KEY);
    if (!stats) {
      return getDefaultStats();
    }
    return JSON.parse(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
    return getDefaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

export function updateStats(won: boolean, attempts: number): GameStats {
  const stats = loadStats();
  const today = new Date().toDateString();
  
  // Check if already played today
  if (stats.lastPlayedDate === today) {
    return stats;
  }
  
  stats.gamesPlayed++;
  stats.totalAttempts += attempts;
  stats.lastPlayedDate = today;
  
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }
  
  saveStats(stats);
  return stats;
}

function getDefaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalAttempts: 0,
    lastPlayedDate: null
  };
}
