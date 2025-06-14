import { GameEvent } from "@/types/game";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  attempts: number;
  correctOrder: GameEvent[];
}

export function ResultModal({ 
  isOpen, 
  onClose, 
  won, 
  attempts, 
  correctOrder 
}: ResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            won ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className={`text-2xl ${won ? 'text-green-500' : 'text-red-500'}`}>
              {won ? '🏆' : '❌'}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {won ? 'Congratulations!' : 'Game Over'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {won 
              ? `You solved today's Chronicle in ${attempts} attempt${attempts === 1 ? '' : 's'}!`
              : "You've used all 5 attempts. Here's the correct timeline:"
            }
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">Correct Timeline:</h4>
            <div className="space-y-2 text-sm">
              {correctOrder.map((event, index) => (
                <div key={event.name} className="flex justify-between items-center">
                  <span className="text-left flex-1">{event.name}</span>
                  <span className="font-medium text-primary-600 ml-2">{event.year}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            View Stats
          </button>
        </div>
      </div>
    </div>
  );
}
