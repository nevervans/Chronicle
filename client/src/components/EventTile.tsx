import { GameEvent } from "@/types/game";

interface EventTileProps {
  event: GameEvent;
  index: number;
  isDragging?: boolean;
  isPositioned?: boolean;
  onDragStart: (e: React.DragEvent, event: GameEvent, index: number) => void;
  onDragEnd: () => void;
  className?: string;
}

export function EventTile({ 
  event, 
  index,
  isDragging = false,
  isPositioned = false,
  onDragStart, 
  onDragEnd,
  className = ""
}: EventTileProps) {
  return (
    <div
      className={`event-card w-full p-4 rounded cursor-grab text-center font-medium ${
        isDragging ? 'dragging' : ''
      } ${
        isPositioned ? 'positioned' : ''
      } ${className}`}
      draggable
      onDragStart={(e) => onDragStart(e, event, index)}
      onDragEnd={onDragEnd}
    >
      <div className="text-sm font-semibold text-gray-100">{event.name}</div>
    </div>
  );
}