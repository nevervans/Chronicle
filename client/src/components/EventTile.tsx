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
      className={`event-card w-full cursor-grab font-medium flex items-center justify-between ${
        isDragging ? 'dragging' : ''
      } ${
        isPositioned ? 'positioned' : ''
      } ${className}`}
      draggable
      onDragStart={(e) => onDragStart(e, event, index)}
      onDragEnd={onDragEnd}
    >
      <div className="flex-1 text-left">
        <div className="font-body leading-tight" style={{ color: 'var(--text-primary)' }}>
          {event.name}
        </div>
      </div>
      <div className="drag-handle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </div>
    </div>
  );
}