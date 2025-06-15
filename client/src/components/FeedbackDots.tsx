import { GameEvent } from "@/types/game";

interface FeedbackDotsProps {
  currentEvents: GameEvent[];
  correctOrder: GameEvent[];
}

export function FeedbackDots({ currentEvents, correctOrder }: FeedbackDotsProps) {
  const correctlyPositioned = currentEvents.filter((event, index) => 
    correctOrder[index] && event.name === correctOrder[index].name
  ).length;

  return (
    <div className="flex justify-center space-x-2 mb-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full transition-all duration-200"
          style={{
            backgroundColor: index < correctlyPositioned 
              ? 'var(--accent-gold)' 
              : 'var(--bg-tertiary)',
            border: `1px solid ${index < correctlyPositioned 
              ? 'var(--accent-gold)' 
              : 'var(--bg-secondary)'}`
          }}
        />
      ))}
    </div>
  );
}