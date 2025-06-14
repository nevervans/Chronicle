interface AttemptsIndicatorProps {
  currentAttempts: number;
  maxAttempts: number;
}

export function AttemptsIndicator({ currentAttempts, maxAttempts }: AttemptsIndicatorProps) {
  return (
    <div className="flex justify-center items-center space-x-3 mb-6">
      <span className="text-gray-400 text-sm font-medium">Attempts:</span>
      <div className="flex space-x-2">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < currentAttempts 
                ? 'bg-red-400 shadow-lg shadow-red-400/50' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
      <span className="text-gray-500 text-sm">
        {currentAttempts}/{maxAttempts}
      </span>
    </div>
  );
}