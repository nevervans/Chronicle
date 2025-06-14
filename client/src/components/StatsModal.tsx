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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Your Statistics</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-primary-600">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">{avgAttempts}</div>
            <div className="text-sm text-gray-600">Avg Attempts</div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleShare}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            📤 Share Results
          </button>
        </div>
      </div>
    </div>
  );
}
