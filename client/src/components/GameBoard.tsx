import { useState, useEffect } from "react";
import { GameState, GameEvent, DragItem, GameStats } from "@/types/game";
import { TimelineSlot } from "./TimelineSlot";
import { EventCard } from "./EventCard";
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

  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
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

  const handleDragStart = (e: React.DragEvent, event: GameEvent) => {
    const timelineIndex = gameState.timelineOrder.findIndex(item => item?.name === event.name);
    
    setDraggedItem({
      eventName: event.name,
      sourceType: timelineIndex !== -1 ? 'timeline' : 'pool',
      sourceIndex: timelineIndex !== -1 ? timelineIndex : undefined
    });
    
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedItem) return;

    const event = gameState.currentEvents.find(ev => ev.name === draggedItem.eventName);
    if (!event) return;

    setGameState(prev => {
      const newTimelineOrder = [...prev.timelineOrder];
      
      // Remove from previous position if it was in timeline
      if (draggedItem.sourceType === 'timeline' && draggedItem.sourceIndex !== undefined) {
        newTimelineOrder[draggedItem.sourceIndex] = null;
      }
      
      // Place in new position
      newTimelineOrder[slotIndex] = event;
      
      return {
        ...prev,
        timelineOrder: newTimelineOrder
      };
    });
  };

  const handleSlotDragOver = (e: React.DragEvent, slotIndex: number) => {
    handleDragOver(e);
    setDragOverSlot(slotIndex);
  };

  const handleSubmit = () => {
    if (gameState.gameComplete || !isTimelineFull(gameState.timelineOrder)) return;

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
      setTimeout(() => setShowResultModal(true), 800);
    } else if (newAttempts >= gameState.maxAttempts) {
      // Game over condition
      const newStats = updateStats(false, newAttempts);
      setStats(newStats);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        gameComplete: true
      }));
      setTimeout(() => setShowResultModal(true), 500);
    } else {
      // Wrong answer - shake animation
      setGameState(prev => ({ ...prev, attempts: newAttempts }));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const availableEvents = gameState.currentEvents.filter(event => 
    !gameState.timelineOrder.some(item => item?.name === event.name)
  );

  const correctOrder = getCorrectOrder(gameState.currentEvents);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading today's timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⏰</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Chronicle</h1>
            </div>
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-gray-600">📊</span>
              <span className="text-gray-700 font-medium">Stats</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Game Status */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-primary-500">📅</span>
              <span className="text-gray-600 font-medium">{gameState.gameDate}</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span className="text-primary-500">🎯</span>
              <span className="text-gray-600 font-medium">
                Attempts: <span className="text-primary-600 font-semibold">{gameState.attempts}</span>/5
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Arrange these 6 historical events in chronological order from earliest to latest. You have 5 attempts to get it right!
          </p>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-primary-500 mr-2">⏱️</span>
              Historical Timeline
            </h2>
            
            {/* Timeline Slots */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 ${
              isShaking ? 'animate-shake' : ''
            }`}>
              {gameState.timelineOrder.map((event, index) => (
                <TimelineSlot
                  key={index}
                  event={event}
                  index={index}
                  onDrop={handleDrop}
                  onDragOver={(e) => handleSlotDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragOver={dragOverSlot === index}
                />
              ))}
            </div>
          </div>

          {/* Available Events Pool */}
          <div className="border-t pt-6">
            <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
              <span className="text-gray-500 mr-2">📚</span>
              Available Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableEvents.map((event) => (
                <EventCard
                  key={event.name}
                  event={event}
                  isDragging={draggedItem?.eventName === event.name}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={!isTimelineFull(gameState.timelineOrder) || gameState.gameComplete}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {gameState.gameComplete ? (
                <>✅ Game Complete</>
              ) : !isTimelineFull(gameState.timelineOrder) ? (
                <>⚠️ Fill All Positions</>
              ) : (
                <>✓ Submit Timeline</>
              )}
            </button>
          </div>
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © 2024 Chronicle. A daily historical timeline game.
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                ❓
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
