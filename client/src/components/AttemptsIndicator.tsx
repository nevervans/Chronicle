interface AttemptsIndicatorProps {
  currentAttempts: number;
  maxAttempts: number;
}

export function AttemptsIndicator({ currentAttempts, maxAttempts }: AttemptsIndicatorProps) {
  return (
    <div className="flex justify-center items-center space-x-4 mb-8">
      <span className="font-body text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Attempts:</span>
      <div className="flex space-x-3">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 cursor-pointer relative group ${
              i < currentAttempts 
                ? 'scale-110 shadow-lg' 
                : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: i < currentAttempts ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              boxShadow: i < currentAttempts ? '0 4px 8px rgba(212, 175, 55, 0.3)' : 'none',
              transform: i < currentAttempts ? 'scale(1.2)' : 'scale(1)'
            }}
            title={`Attempt ${i + 1}`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap font-body" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                Attempt {i + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
      <span className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
        {currentAttempts}/{maxAttempts}
      </span>
    </div>
  );
}