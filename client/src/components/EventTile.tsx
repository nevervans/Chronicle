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
  const handleTouchStart = (e: React.TouchEvent) => {
    // Enable mobile drag
    const touch = e.touches[0];
    const dragStartEvent = new Event('dragstart') as any;
    dragStartEvent.dataTransfer = {
      setData: () => {},
      effectAllowed: 'move'
    };
    onDragStart(dragStartEvent, event, index);
  };

  const handleTouchEnd = () => {
    onDragEnd();
  };

  return (
    <div
      className={`event-card w-full cursor-grab font-medium touch-manipulation ${
        isDragging ? 'dragging' : ''
      } ${
        isPositioned ? 'positioned' : ''
      } ${className}`}
      draggable
      onDragStart={(e) => onDragStart(e, event, index)}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Icon on Left */}
      <div className="drag-handle mr-3 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="12" r="1"/>
          <circle cx="9" cy="5" r="1"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <circle cx="15" cy="5" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
      </div>
      
      {/* Event Text */}
      <div className="flex-1 text-left">
        <div className="font-body leading-tight" style={{ color: 'var(--text-primary)' }}>
          {event.name}
        </div>
      </div>
    </div>
  );
}