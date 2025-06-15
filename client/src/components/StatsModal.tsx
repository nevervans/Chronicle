import { GameStats } from "@/types/game";
import { formatShareText } from "@/lib/gameLogic";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  lastGameWon?: boolean;
  lastGameAttempts?: number;
}

export function StatsModal({ 
  isOpen, 
  onClose, 
  stats, 
  lastGameWon = false, 
  lastGameAttempts = 0 
}: StatsModalProps) {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const avgAttempts = stats.gamesWon > 0 ? (stats.totalAttempts / stats.gamesWon).toFixed(1) : '0';

  const handleShare = async () => {
    const shareText = formatShareText(lastGameWon, lastGameAttempts);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chronicle Daily Timeline',
          text: shareText
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-100">Statistics</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-gray-100">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-400">Played</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{winRate}%</div>
            <div className="text-sm text-gray-400">Win %</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{stats.currentStreak}</div>
            <div className="text-sm text-gray-400">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{avgAttempts}</div>
            <div className="text-sm text-gray-400">Avg Attempts</div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleShare}
            className="text-black font-medium px-6 py-2 rounded transition-colors hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--accent-gold)'
            }}
          >
            Share Results
          </button>
        </div>
      </div>
    </div>
  );
}
