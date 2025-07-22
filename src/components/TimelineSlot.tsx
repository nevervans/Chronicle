import { GameEvent } from "@/types/game";
import { EventCard } from "./EventCard";

interface TimelineSlotProps {
  event: GameEvent | null;
  index: number;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, event: GameEvent) => void;
  onDragEnd: () => void;
  isDragOver: boolean;
}

export function TimelineSlot({
  event,
  index,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
  isDragOver
}: TimelineSlotProps) {
  return (
    <div
      className={`timeline-slot min-h-20 border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center transition-all relative ${
        isDragOver ? 'border-primary-500 bg-primary-50' : ''
      } ${
        event ? 'border-solid border-primary-200 bg-primary-25' : ''
      }`}
      onDrop={(e) => onDrop(e, index)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {event ? (
        <EventCard
          event={event}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="w-full bg-primary-50 border-primary-200"
        />
      ) : (
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">+</div>
          <div className="text-sm font-medium">Position {index + 1}</div>
        </div>
      )}
      
      {/* Timeline connector */}
      {index < 5 && (
        <div className="absolute -right-3 top-1/2 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2 hidden lg:block"></div>
      )}
    </div>
  );
}
