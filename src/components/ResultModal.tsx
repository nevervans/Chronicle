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
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="text-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${
            won ? 'bg-gradient-to-br' : 'bg-gradient-to-br from-gray-600 to-gray-700'
          }`} style={won ? { background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))' } : {}}>
            <div className={`text-2xl ${won ? 'text-black' : 'text-gray-300'}`}>
              {won ? '✓' : '✗'}
            </div>
          </div>
          
          {won ? (
            <div className="mb-6">
              <div className="animate-checkmark mb-4" style={{ color: 'var(--success-color)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mx-auto">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <h3 className="font-title text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
                👏 You solved it in {attempts} attempt{attempts === 1 ? '' : 's'}!
              </h3>
            </div>
          ) : (
            <h3 className="font-title text-3xl mb-6" style={{ color: 'var(--text-primary)' }}>
              Game Over
            </h3>
          )}
          
          <div className="rounded-2xl p-6 mb-8 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--bg-secondary)' }}>
            <h4 className="font-heading text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Correct Timeline:</h4>
            <div className="space-y-4 relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5" style={{ backgroundColor: 'var(--accent-gold)' }}></div>
              
              {correctOrder.map((event, index) => (
                <div key={event.name} className="flex items-start relative">
                  {/* Timeline dot */}
                  <div className="w-2 h-2 rounded-full mt-2 mr-4 relative z-10" style={{ backgroundColor: 'var(--accent-gold)' }}></div>
                  
                  {/* Event content */}
                  <div className="flex-1 font-body">
                    <div className="font-semibold mb-1" style={{ color: 'var(--accent-gold)' }}>{event.year}</div>
                    <div style={{ color: 'var(--text-primary)' }}>{event.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleShare}
              className="font-button w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl text-black"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)'
              }}
            >
              {won ? 'Share Your Victory 🎉' : 'Share Result'}
            </button>
            
            {won && (
              <button
                onClick={onClose}
                className="font-button w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)' 
                }}
              >
                Play Again Tomorrow
              </button>
            )}
            
            {!won && (
              <button
                onClick={onClose}
                className="font-button w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)' 
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
