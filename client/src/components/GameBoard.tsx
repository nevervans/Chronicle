import { useState, useEffect } from "react";
import { GameState, GameEvent, DragItem, GameStats } from "@/types/game";
import { EventTile } from "./EventTile";
import { AttemptsIndicator } from "./AttemptsIndicator";
import { StatsModal } from "./StatsModal";
import { ResultModal } from "./ResultModal";
import { checkTimelineCorrect, getCorrectOrder, isTimelineFull } from "@/lib/gameLogic";
import { updateStats, loadStats, hasPlayedToday, getTodaysResult, generateShareText } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";

export function GameBoard() {
  const [gameState, setGameState] = useState<GameState>({
    currentEvents: [],
    timelineOrder: new Array(6).fill(null),
    attempts: 0,
    maxAttempts: 5,
    gameComplete: false,
    gameWon: false,
    gameDate: new Date().toDateString()
  });

  const [draggedItem, setDraggedItem] = useState<{ event: GameEvent; sourceIndex: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [isShaking, setIsShaking] = useState(false);
  const [gameAlreadyCompleted, setGameAlreadyCompleted] = useState(false);
  const [todaysResult, setTodaysResult] = useState<{ won: boolean; attempts: number } | null>(null);

  // Fetch daily events
  const { data: dailyEvents, isLoading } = useQuery({
    queryKey: ['/api/events/daily'],
    select: (data: any) => data.events as GameEvent[]
  });



  const handleDragStart = (e: React.DragEvent, event: GameEvent, sourceIndex: number) => {
    setDraggedItem({ event, sourceIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(targetIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem || draggedItem.sourceIndex === targetIndex) return;

    setGameState(prev => {
      const newTimelineOrder = [...prev.timelineOrder];
      const [movedEvent] = newTimelineOrder.splice(draggedItem.sourceIndex, 1);
      newTimelineOrder.splice(targetIndex, 0, movedEvent);
      
      return {
        ...prev,
        timelineOrder: newTimelineOrder
      };
    });
  };

  useEffect(() => {
    // Check if game was already completed today
    if (hasPlayedToday()) {
      const result = getTodaysResult();
      setGameAlreadyCompleted(true);
      setTodaysResult(result);
      setGameState(prev => ({
        ...prev,
        gameComplete: true,
        gameWon: result?.won || false,
        attempts: result?.attempts || 0
      }));
    }

    if (dailyEvents && dailyEvents.length === 6) {
      // Initialize timeline with shuffled events
      const shuffled = [...dailyEvents].sort(() => Math.random() - 0.5);
      setGameState(prev => ({
        ...prev,
        currentEvents: dailyEvents,
        timelineOrder: shuffled,
        gameDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }));
    }
  }, [dailyEvents]);

  const handleSubmit = () => {
    if (gameState.gameComplete) return;

    const newAttempts = gameState.attempts + 1;
    const isCorrect = checkTimelineCorrect(gameState.timelineOrder);

    if (isCorrect) {
      // Win condition
      const newStats = updateStats(true, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        gameWon: true,
        gameComplete: true
      }));
      setTimeout(() => setShowResultModal(true), 600);
    } else if (newAttempts >= gameState.maxAttempts) {
      // Game over condition
      const newStats = updateStats(false, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        gameComplete: true
      }));
      setTimeout(() => setShowResultModal(true), 400);
    } else {
      // Wrong answer - shake animation
      setGameState(prev => ({ ...prev, attempts: newAttempts }));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const correctOrder = getCorrectOrder(gameState.currentEvents);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading today's timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-700/50 py-6 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              CHRONICLE
            </h1>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-3 hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105 group"
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400 group-hover:text-green-400 transition-colors">
                <rect x="2" y="12" width="3" height="6" rx="1"/>
                <rect x="6" y="8" width="3" height="10" rx="1"/>
                <rect x="10" y="5" width="3" height="13" rx="1"/>
                <rect x="14" y="9" width="3" height="9" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game */}
      <main className="max-w-lg mx-auto px-6 py-8">
        {/* Game Info */}
        <div className="text-center mb-10">
          <p className="text-gray-300 text-lg mb-8 font-medium">
            Arrange 6 historical events in chronological order
          </p>
          
          {/* Attempts Indicator */}
          <AttemptsIndicator 
            currentAttempts={gameState.attempts} 
            maxAttempts={gameState.maxAttempts} 
          />
        </div>

        {/* Event Timeline - Vertical Layout */}
        <div className={`space-y-4 mb-10 ${isShaking ? 'animate-shake' : ''}`}>
          {gameState.timelineOrder.map((event, index) => (
            <div
              key={index}
              className={`drop-zone min-h-[70px] rounded-2xl p-2 transition-all duration-300 ${
                dragOverIndex === index ? 'drag-over' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {event ? (
                <EventTile
                  event={event}
                  index={index}
                  isDragging={draggedItem?.sourceIndex === index}
                  isPositioned={true}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ) : (
                <div className="h-[70px] flex items-center justify-center bg-gray-800/50 border-2 border-gray-700/50 rounded-2xl text-gray-500 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    <span>Position {index + 1}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mb-8">
          {gameAlreadyCompleted ? (
            <div className="text-center">
              <p className="text-gray-400 mb-4">You've already played today!</p>
              <p className="text-sm text-gray-500 mb-4">
                Result: {todaysResult?.won ? `Solved in ${todaysResult.attempts} attempts` : 'Not solved'}
              </p>
              <button
                onClick={() => setShowResultModal(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-3 rounded transition-colors mb-3"
              >
                View Today's Result
              </button>
              <button
                onClick={() => setShowStatsModal(true)}
                className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-3 rounded transition-colors"
              >
                View Statistics
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={gameState.gameComplete}
              className="w-full bg-green-400 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold py-3 rounded transition-colors"
            >
              {gameState.gameComplete ? 'Game Complete' : 'Submit'}
            </button>
          )}
        </div>
      </main>

      {/* Modals */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
        lastGameWon={gameState.gameWon}
        lastGameAttempts={gameState.attempts}
      />

      <ResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setShowStatsModal(true);
        }}
        won={gameState.gameWon}
        attempts={gameState.attempts}
        correctOrder={correctOrder}
      />
    </div>
  );
}
