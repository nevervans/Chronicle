import { GameEvent } from "@/types/game";
import { generateShareText } from "@/lib/storage";

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

  const handleShare = async () => {
    const shareText = generateShareText(won, attempts);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chronicle Daily Timeline',
          text: shareText
        });
      } catch (error) {
        // User cancelled or share failed, fallback to clipboard
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800/95 border border-gray-700/50 rounded-2xl max-w-md w-full p-8 shadow-2xl backdrop-blur-sm animate-fade-in-up">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${
            won ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-gray-600 to-gray-700'
          }`}>
            <div className={`text-2xl ${won ? 'text-black' : 'text-gray-300'}`}>
              {won ? '✓' : '✗'}
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-gray-100 mb-3">
            {won ? 'Solved!' : 'Game Over'}
          </h3>
          
          <p className="text-gray-300 mb-8 text-lg font-medium">
            {won 
              ? `Completed in ${attempts} attempt${attempts === 1 ? '' : 's'}`
              : "Correct timeline:"
            }
          </p>
          
          <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="space-y-3 text-sm">
              {correctOrder.map((event, index) => (
                <div key={event.name} className="flex justify-between items-center text-gray-200 p-2 bg-gray-800/30 rounded-lg">
                  <span className="text-left flex-1 font-medium">{event.name}</span>
                  <span className="font-bold text-green-400 ml-4">{event.year}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Share Result
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
