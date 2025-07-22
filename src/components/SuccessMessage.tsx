interface SuccessMessageProps {
  isVisible: boolean;
  attempts: number;
  onViewTimeline: () => void;
}

export function SuccessMessage({ isVisible, attempts, onViewTimeline }: SuccessMessageProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="text-center animate-fade-in-up">
        {/* Checkmark Animation */}
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-checkmark animate-success-pulse"
          style={{ backgroundColor: 'var(--accent-gold)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-black">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>

        {/* Success Message */}
        <div 
          className="rounded-2xl p-8 mb-6 border backdrop-blur-sm max-w-md"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--accent-gold)' 
          }}
        >
          <h2 className="font-title text-3xl mb-4" style={{ color: 'var(--text-primary)' }}>
            🎉 Well done!
          </h2>
          <p className="font-body text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
            You solved today's puzzle in {attempts} attempt{attempts === 1 ? '' : 's'}
          </p>
          
          <button
            onClick={onViewTimeline}
            className="font-button w-full py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
              color: '#1A1A1D',
              boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)'
            }}
          >
            View Timeline
          </button>
        </div>

        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                backgroundColor: i % 2 === 0 ? 'var(--accent-gold)' : 'var(--success-color)',
                left: `${Math.random() * 100}%`,
                top: '50%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}