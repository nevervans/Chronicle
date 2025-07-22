import { GameEvent } from "@/types/game";

interface EventCardProps {
  event: GameEvent;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, event: GameEvent) => void;
  onDragEnd: () => void;
  className?: string;
}

export function EventCard({ 
  event, 
  isDragging = false, 
  onDragStart, 
  onDragEnd,
  className = ""
}: EventCardProps) {
  return (
    <div
      className={`event-card bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab select-none ${
        isDragging ? 'opacity-70 rotate-1 scale-105' : ''
      } ${className}`}
      draggable
      onDragStart={(e) => onDragStart(e, event)}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-800 text-sm mb-1">{event.name}</div>
          <div className="text-gray-500 text-xs">{event.year}</div>
        </div>
        <div className="ml-3">
          <div className="w-4 h-4 flex flex-col justify-center space-y-0.5">
            <div className="w-full h-0.5 bg-gray-300 rounded"></div>
            <div className="w-full h-0.5 bg-gray-300 rounded"></div>
            <div className="w-full h-0.5 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
