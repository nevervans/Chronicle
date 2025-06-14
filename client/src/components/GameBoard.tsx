import { useState, useEffect } from "react";
import { GameState, GameEvent, DragItem, GameStats } from "@/types/game";
import { EventTile } from "./EventTile";
import { AttemptsIndicator } from "./AttemptsIndicator";
import { StatsModal } from "./StatsModal";
import { ResultModal } from "./ResultModal";
import { checkTimelineCorrect, getCorrectOrder, isTimelineFull } from "@/lib/gameLogic";
import { updateStats, loadStats } from "@/lib/storage";
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

  // Fetch daily events
  const { data: dailyEvents, isLoading } = useQuery({
    queryKey: ['/api/events/daily'],
    select: (data: any) => data.events as GameEvent[]
  });

  useEffect(() => {
    if (dailyEvents) {
      setGameState(prev => ({
        ...prev,
        currentEvents: dailyEvents,
        gameDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }));
    }
  }, [dailyEvents]);

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
      <header className="border-b border-gray-700 py-4">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Chronicle</h1>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <span className="text-xl">📊</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Game Info */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-2">{gameState.gameDate}</p>
          <p className="text-gray-300 text-sm mb-6">
            Arrange 6 historical events in chronological order
          </p>
          
          {/* Attempts Indicator */}
          <AttemptsIndicator 
            currentAttempts={gameState.attempts} 
            maxAttempts={gameState.maxAttempts} 
          />
        </div>

        {/* Event Timeline - Vertical Layout */}
        <div className={`space-y-3 mb-8 ${isShaking ? 'animate-shake' : ''}`}>
          {gameState.timelineOrder.map((event, index) => (
            <div
              key={index}
              className={`drop-zone min-h-[60px] rounded p-1 ${
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
                <div className="h-[60px] flex items-center justify-center border-2 border-dashed border-gray-700 rounded text-gray-500 text-sm">
                  Drop event here
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleSubmit}
            disabled={gameState.gameComplete}
            className="w-full bg-green-400 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold py-3 rounded transition-colors"
          >
            {gameState.gameComplete ? 'Game Complete' : 'Submit'}
          </button>
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
