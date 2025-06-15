import { useState, useEffect } from "react";
import { GameState, GameEvent, DragItem, GameStats } from "@/types/game";
import { EventTile } from "./EventTile";
import { AttemptsIndicator } from "./AttemptsIndicator";
import { StatsModal } from "./StatsModal";
import { ResultModal } from "./ResultModal";
import { SuccessMessage } from "./SuccessMessage";
import { FeedbackDots } from "./FeedbackDots";
import { MobileDragHandler } from "./MobileDragHandler";
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
  const [attemptHistory, setAttemptHistory] = useState<string[][]>([]); // Track emoji results for each attempt
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

  const generateAttemptEmojis = (userOrder: GameEvent[], correctOrder: GameEvent[]): string[] => {
    return userOrder.map((event, index) => {
      if (correctOrder[index] && event.name === correctOrder[index].name) {
        return '🟩'; // Green for correct position
      } else if (correctOrder.some(correctEvent => correctEvent.name === event.name)) {
        return '🟨'; // Yellow for correct event, wrong position
      } else {
        return '⬜'; // White for not in timeline (shouldn't happen in our case)
      }
    });
  };

  const handleSubmit = () => {
    if (gameState.currentEvents.length === 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const newAttempts = gameState.attempts + 1;
    const isCorrect = checkTimelineCorrect(gameState.currentEvents);
    
    // Generate emoji feedback for this attempt
    const attemptEmojis = generateAttemptEmojis(gameState.currentEvents, correctOrder);
    const newAttemptHistory = [...attemptHistory, attemptEmojis];
    setAttemptHistory(newAttemptHistory);

    if (isCorrect) {
      // Game won! Sort events in correct order
      const sortedEvents = getCorrectOrder(gameState.currentEvents);
      const newStats = updateStats(true, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        currentEvents: sortedEvents,
        attempts: newAttempts,
        gameComplete: true,
        gameWon: true
      }));
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    } else if (newAttempts >= gameState.maxAttempts) {
      // Game lost! Show events in correct order
      const sortedEvents = getCorrectOrder(gameState.currentEvents);
      const newStats = updateStats(false, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        currentEvents: sortedEvents,
        attempts: newAttempts,
        gameComplete: true,
        gameWon: false
      }));
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
            {/* Show correct timeline for completed game */}
            <div className="rounded-2xl p-6 mb-8 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--bg-secondary)' }}>
              <h4 className="font-heading text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Correct Timeline:</h4>
              <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5" style={{ backgroundColor: 'var(--accent-gold)' }}></div>
                
                {correctOrder.map((event, index) => (
                  <div key={event.name} className="flex items-start relative">
                    {/* Timeline dot */}
                    <div className="w-2 h-2 rounded-full mt-2 mr-4 relative z-10" style={{ backgroundColor: 'var(--accent-gold)' }}></div>
                    
                    {/* Event content */}
                    <div className="flex-1 font-body">
                      <div className="font-semibold mb-1" style={{ color: 'var(--accent-gold)' }}>{event.year}</div>
                      <div style={{ color: 'var(--text-primary)' }}>{event.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-24">
            {/* Success Message */}
            <SuccessMessage 
              isVisible={showSuccessMessage}
              attempts={gameState.attempts}
              onViewTimeline={() => {}}
            />

            {/* Attempts Indicator */}
            <AttemptsIndicator 
              currentAttempts={gameState.attempts} 
              maxAttempts={gameState.maxAttempts} 
            />

            {/* Feedback Dots - Show correctly positioned events */}
            {!gameState.gameComplete && (
              <FeedbackDots 
                currentEvents={gameState.currentEvents}
                correctOrder={correctOrder}
              />
            )}

            {gameState.gameComplete ? (
              /* Show completion message and events in correct order */
              <div className="space-y-6">
                <div className="text-center mb-6">
                  {gameState.gameWon ? (
                    <div className="mb-4">
                      <div className="animate-checkmark mb-4" style={{ color: 'var(--accent-gold)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mx-auto">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      </div>
                      <h3 className="font-title text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
                        🎉 You solved it in {gameState.attempts} attempt{gameState.attempts === 1 ? '' : 's'}!
                      </h3>
                    </div>
                  ) : (
                    <h3 className="font-title text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
                      Game Complete
                    </h3>
                  )}
                </div>

                {/* Show events in correct order */}
                <div className="space-y-4">
                  <h2 className="font-heading text-xl text-center mb-6" style={{ color: 'var(--text-primary)' }}>
                    Correct Order
                  </h2>
                  <div className="space-y-3">
                    {gameState.currentEvents.map((event, index) => (
                      <div key={event.name} className="event-card w-full font-medium">
                        <div className="drag-handle mr-3 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="12" r="1"/>
                            <circle cx="9" cy="5" r="1"/>
                            <circle cx="9" cy="19" r="1"/>
                            <circle cx="15" cy="12" r="1"/>
                            <circle cx="15" cy="5" r="1"/>
                            <circle cx="15" cy="19" r="1"/>
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-body leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {event.name}
                          </div>
                          <div className="text-sm mt-1" style={{ color: 'var(--accent-gold)' }}>
                            {event.year}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Show game interface during play */
              <div className="space-y-6">
                {/* Timeline - All events in order */}
                <div className="space-y-4 mb-8">
                  <h2 className="font-heading text-xl text-center mb-6" style={{ color: 'var(--text-primary)' }}>
                    Arrange events in chronological order
                  </h2>
                  <MobileDragHandler
                    events={gameState.currentEvents}
                    onReorder={(newOrder) => {
                      setGameState(prev => ({
                        ...prev,
                        currentEvents: newOrder
                      }));
                    }}
                  >
                    {({ onTouchStart, onTouchMove, onTouchEnd, draggedIndex }) => (
                      <div className="space-y-3">
                        {gameState.currentEvents.map((event, index) => (
                          <div
                            key={event.name}
                            className={`transition-all duration-200 ${isShaking ? 'animate-shake' : ''} ${
                              draggedIndex === index ? 'opacity-70 scale-105' : ''
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverIndex(index);
                            }}
                            onDragLeave={() => setDragOverIndex(null)}
                            onDrop={(e) => handleDrop(e, index)}
                            onTouchStart={onTouchStart(index)}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                          >
                            <EventTile
                              event={event}
                              index={index}
                              isDragging={draggedItem?.event.name === event.name || draggedIndex === index}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              className={dragOverIndex === index ? 'border-2 border-dashed' : ''}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </MobileDragHandler>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="font-button w-full py-4 rounded-xl transition-all duration-200 hover:scale-105 text-black"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
                    boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  Submit Timeline
                </button>
              </div>
            )}
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
                onClick={() => {
                  // Generate emoji grid for sharing
                  const emojiGrid = attemptHistory.map(attempt => attempt.join('')).join('\n');
                  const shareText = `Chronicle Timeline Game\n\n${emojiGrid}\n\n${gameState.gameWon ? `Solved in ${gameState.attempts}/${gameState.maxAttempts} attempts!` : `Failed in ${gameState.maxAttempts}/${gameState.maxAttempts} attempts`}\n\nPlay daily at: ${window.location.origin}`;
                  
                  if (navigator.share) {
                    navigator.share({ title: 'Chronicle Timeline', text: shareText });
                  } else {
                    navigator.clipboard.writeText(shareText);
                  }
                }}
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

      {/* ResultModal removed - timeline now shown inline */}
    </div>
  );
}