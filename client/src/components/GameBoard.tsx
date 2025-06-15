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
    timelineOrder: [],
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

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { event, sourceIndex } = draggedItem;
    const newEvents = [...gameState.currentEvents];
    
    // Remove event from source position
    newEvents.splice(sourceIndex, 1);
    
    // Insert event at target position
    newEvents.splice(targetIndex, 0, event);
    
    setGameState(prev => ({
      ...prev,
      currentEvents: newEvents
    }));

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleSubmit = () => {
    if (gameState.currentEvents.length === 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const newAttempts = gameState.attempts + 1;
    const isCorrect = checkTimelineCorrect(gameState.currentEvents);

    if (isCorrect) {
      // Game won!
      const newStats = updateStats(true, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        gameComplete: true,
        gameWon: true
      }));
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowResultModal(true);
      }, 2000);
    } else if (newAttempts >= gameState.maxAttempts) {
      // Game lost!
      const newStats = updateStats(false, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        gameComplete: true,
        gameWon: false
      }));
      setShowResultModal(true);
    } else {
      // Continue playing
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts
      }));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Check if user has already played today
  useEffect(() => {
    if (hasPlayedToday()) {
      setGameAlreadyCompleted(true);
      const result = getTodaysResult();
      if (result) {
        setTodaysResult(result);
        setGameState(prev => ({
          ...prev,
          gameComplete: true,
          gameWon: result.won,
          attempts: result.attempts
        }));
      }
    }
  }, []);

  // Initialize game when events are loaded
  useEffect(() => {
    if (dailyEvents && dailyEvents.length > 0 && !gameAlreadyCompleted) {
      // Shuffle events for initial random order
      const shuffledEvents = [...dailyEvents].sort(() => Math.random() - 0.5);
      setGameState(prev => ({
        ...prev,
        currentEvents: shuffledEvents
      }));
    }
  }, [dailyEvents, gameAlreadyCompleted]);

  const correctOrder = dailyEvents ? getCorrectOrder(dailyEvents) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-gold)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading today's timeline...</p>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:stroke-yellow-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"/>
                <path d="M19 11h-4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"/>
                <path d="M5 11V7a7 7 0 0 1 14 0v4"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-6 py-12">
        {gameAlreadyCompleted && todaysResult ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ 
                backgroundColor: todaysResult.won ? 'var(--accent-gold)' : 'var(--bg-tertiary)' 
              }}>
                <div className={`text-3xl ${todaysResult.won ? 'text-black' : 'text-gray-300'}`}>
                  {todaysResult.won ? '✓' : '✗'}
                </div>
              </div>
              <h2 className="font-title text-3xl mb-4" style={{ color: 'var(--text-primary)' }}>
                {todaysResult.won ? 'Already completed today!' : 'Try again tomorrow!'}
              </h2>
              <p className="font-body text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                {todaysResult.won 
                  ? `You solved today's puzzle in ${todaysResult.attempts} attempt${todaysResult.attempts === 1 ? '' : 's'}`
                  : "You've already attempted today's puzzle"
                }
              </p>
            </div>
            <button
              onClick={() => setShowResultModal(true)}
              className="font-button py-4 px-8 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--accent-gold)',
                color: 'black'
              }}
            >
              View Timeline
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Message */}
            <SuccessMessage 
              isVisible={showSuccessMessage}
              attempts={gameState.attempts}
              onViewTimeline={() => setShowResultModal(true)}
            />

            {/* Attempts Indicator */}
            <AttemptsIndicator 
              currentAttempts={gameState.attempts} 
              maxAttempts={gameState.maxAttempts} 
            />

            {/* Timeline - All events in order */}
            <div className="space-y-4 mb-8">
              <h2 className="font-heading text-xl text-center mb-6" style={{ color: 'var(--text-primary)' }}>
                Arrange events in chronological order
              </h2>
              <div className="space-y-3">
                {gameState.currentEvents.map((event, index) => (
                  <div
                    key={event.name}
                    className={`transition-all duration-200 ${isShaking ? 'animate-shake' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <EventTile
                      event={event}
                      index={index}
                      isDragging={draggedItem?.event.name === event.name}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      className={dragOverIndex === index ? 'border-2 border-dashed' : ''}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={gameState.gameComplete}
              className="font-button w-full py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-black"
              style={{ 
                background: gameState.gameComplete 
                  ? 'var(--bg-tertiary)' 
                  : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
                boxShadow: gameState.gameComplete 
                  ? 'none' 
                  : '0 8px 32px rgba(212, 175, 55, 0.3)'
              }}
            >
              {gameState.gameComplete ? 'Game Complete' : 'Submit Timeline'}
            </button>
          </div>
        )}
      </main>

      {/* Sticky Footer - Only show after game completion */}
      {gameState.gameComplete && (
        <div className="fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm sticky-footer" style={{ 
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
      )}

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