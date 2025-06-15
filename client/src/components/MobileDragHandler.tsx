import React, { useState, useEffect } from 'react';
import { GameEvent } from '@/types/game';

interface MobileDragHandlerProps {
  events: GameEvent[];
  onReorder: (newOrder: GameEvent[]) => void;
  children: (props: { 
    onTouchStart: (index: number) => (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    draggedIndex: number | null;
  }) => React.ReactNode;
}

export function MobileDragHandler({ events, onReorder, children }: MobileDragHandlerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [initialY, setInitialY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (index: number) => (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDraggedIndex(index);
    setInitialY(touch.clientY);
    setCurrentY(touch.clientY);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return;
    
    const touch = e.touches[0];
    setCurrentY(touch.clientY);
    
    const deltaY = Math.abs(touch.clientY - initialY);
    if (deltaY > 10 && !isDragging) {
      setIsDragging(true);
      e.preventDefault();
    }
    
    if (isDragging) {
      e.preventDefault();
      
      // Calculate which position to move to
      const itemHeight = 80; // Approximate height of each event card
      const displacement = touch.clientY - initialY;
      const positions = Math.round(displacement / itemHeight);
      
      if (positions !== 0) {
        const newIndex = Math.max(0, Math.min(events.length - 1, draggedIndex + positions));
        
        if (newIndex !== draggedIndex) {
          const newEvents = [...events];
          const draggedItem = newEvents[draggedIndex];
          newEvents.splice(draggedIndex, 1);
          newEvents.splice(newIndex, 0, draggedItem);
          
          onReorder(newEvents);
          setDraggedIndex(newIndex);
          setInitialY(touch.clientY);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setDraggedIndex(null);
    setIsDragging(false);
    setInitialY(0);
    setCurrentY(0);
  };

  return (
    <>
      {children({
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        draggedIndex
      })}
    </>
  );
}