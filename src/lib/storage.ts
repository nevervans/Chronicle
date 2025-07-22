import { GameStats } from "@/types/game";

const STORAGE_KEY = 'chronicleStats';
const COMPLETED_KEY = 'chronicleCompleted';

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

export function hasPlayedToday(): boolean {
  try {
    const completed = localStorage.getItem(COMPLETED_KEY);
    if (!completed) return false;
    
    const completedData = JSON.parse(completed);
    const today = new Date().toISOString().split('T')[0];
    return completedData[today] !== undefined;
  } catch (error) {
    return false;
  }
}

export function getTodaysResult(): { won: boolean; attempts: number } | null {
  try {
    const completed = localStorage.getItem(COMPLETED_KEY);
    if (!completed) return null;
    
    const completedData = JSON.parse(completed);
    const today = new Date().toISOString().split('T')[0];
    return completedData[today] || null;
  } catch (error) {
    return null;
  }
}

export function markGameCompleted(won: boolean, attempts: number): void {
  try {
    const completed = localStorage.getItem(COMPLETED_KEY);
    const completedData = completed ? JSON.parse(completed) : {};
    
    const today = new Date().toISOString().split('T')[0];
    completedData[today] = { won, attempts, date: today };
    
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedData));
  } catch (error) {
    console.error('Error marking game completed:', error);
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
  
  // Mark game as completed
  markGameCompleted(won, attempts);
  
  saveStats(stats);
  return stats;
}

export function generateShareText(won: boolean, attempts: number): string {
  const gameNumber = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));
  const result = won ? `${attempts}/5` : 'X/5';
  
  let squares = '';
  for (let i = 1; i <= 5; i++) {
    if (won && i <= attempts) {
      squares += i === attempts ? '🟩' : '🟨';
    } else if (!won && i <= attempts) {
      squares += '🟨';
    } else {
      squares += '⬜';
    }
  }
  
  return `Chronicle #${gameNumber} ${result}\n\n${squares}\n\nchronicle.game`;
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
