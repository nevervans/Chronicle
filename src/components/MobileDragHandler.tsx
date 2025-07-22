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
    e.preventDefault(); // Prevent scrolling immediately
    const touch = e.touches[0];
    setDraggedIndex(index);
    setInitialY(touch.clientY);
    setCurrentY(touch.clientY);
    setIsDragging(false);
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return;
    
    e.preventDefault(); // Always prevent default to stop scrolling
    e.stopPropagation();
    
    const touch = e.touches[0];
    setCurrentY(touch.clientY);
    
    const deltaY = Math.abs(touch.clientY - initialY);
    if (deltaY > 5 && !isDragging) { // Reduced threshold for better responsiveness
      setIsDragging(true);
    }
    
    if (isDragging || deltaY > 5) {
      // Calculate which position to move to with smoother detection
      const itemHeight = 70; // More accurate height
      const displacement = touch.clientY - initialY;
      const positions = Math.round(displacement / itemHeight);
      
      if (Math.abs(positions) >= 1) {
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
    e.preventDefault();
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
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