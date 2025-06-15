import { useState, useEffect } from "react";
import { GameState, GameEvent, DragItem, GameStats } from "@/types/game";
import { EventTile } from "./EventTile";
import { AttemptsIndicator } from "./AttemptsIndicator";
import { StatsModal } from "./StatsModal";
import { ResultModal } from "./ResultModal";
import { SuccessMessage } from "./SuccessMessage";
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
    <div className="min-h-screen text-gray-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b py-6 backdrop-blur-sm" style={{ borderColor: 'var(--bg-tertiary)' }}>
        <div className="max-w-[600px] mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="font-title text-4xl" style={{ color: 'var(--text-primary)' }}>
              CHRONICLE
            </h1>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-3 rounded-xl transition-all duration-200 hover:scale-105 group"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
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
      <main className="max-w-[600px] mx-auto px-6 py-8 pb-32">
        {/* Game Info */}
        <div className="text-center mb-8">
          <p className="font-heading text-xl mb-6" style={{ color: 'var(--text-primary)' }}>
            Arrange 6 historical events in chronological order
          </p>
          
          {/* Attempts Indicator */}
          <AttemptsIndicator 
            currentAttempts={gameState.attempts} 
            maxAttempts={gameState.maxAttempts} 
          />
        </div>

        {/* Event Timeline - Vertical Layout */}
        <div className={`mb-8 ${isShaking ? 'animate-shake' : ''}`}>
          {gameState.timelineOrder.map((event, index) => (
            <div
              key={index}
              className={`drop-zone rounded-xl transition-all duration-300 ${
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
                <div className="min-h-[72px] flex items-center justify-center border-2 border-dashed rounded-xl font-body text-sm transition-all duration-300 mx-0 mb-6" style={{ 
                  borderColor: 'var(--bg-tertiary)', 
                  backgroundColor: 'rgba(42, 42, 45, 0.3)',
                  color: 'var(--text-secondary)'
                }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
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
            <div className="text-center space-y-4">
              <div className="rounded-2xl p-6 border backdrop-blur-sm" style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--bg-tertiary)' 
              }}>
                <p className="font-heading mb-2" style={{ color: 'var(--text-primary)' }}>You've already played today!</p>
                <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Result: {todaysResult?.won ? `Solved in ${todaysResult.attempts} attempts` : 'Not solved'}
                </p>
              </div>
              <button
                onClick={() => setShowResultModal(true)}
                className="font-button w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-3"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  color: 'var(--text-primary)' 
                }}
              >
                View Today's Result
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={gameState.gameComplete}
              className="font-button w-full py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl text-lg disabled:cursor-not-allowed"
              style={{ 
                background: gameState.gameComplete ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
                color: gameState.gameComplete ? 'var(--text-secondary)' : '#1A1A1D',
                boxShadow: gameState.gameComplete ? 'none' : '0 8px 32px rgba(212, 175, 55, 0.3)'
              }}
            >
              {gameState.gameComplete ? 'Game Complete' : 'Submit Timeline'}
            </button>
          )}
        </div>
      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm" style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderColor: 'var(--bg-tertiary)' 
      }}>
        <div className="max-w-[600px] mx-auto px-6 py-4">
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setShowResultModal(true)}
              className="font-button flex-1 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)' 
              }}
            >
              Share Result
            </button>
            <button 
              className="font-button flex-1 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)' 
              }}
            >
              Learn More
            </button>
            <button 
              onClick={() => setShowStatsModal(true)}
              className="font-button flex-1 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)' 
              }}
            >
              View Stats
            </button>
          </div>
        </div>
      </div>

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
