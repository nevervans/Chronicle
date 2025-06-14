interface AttemptsIndicatorProps {
  currentAttempts: number;
  maxAttempts: number;
}

export function AttemptsIndicator({ currentAttempts, maxAttempts }: AttemptsIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: maxAttempts }, (_, i) => (
        <div
          key={i}
          className={`attempt-dot ${
            i < currentAttempts ? 'failed' : ''
          }`}
        />
      ))}
    </div>
  );
}