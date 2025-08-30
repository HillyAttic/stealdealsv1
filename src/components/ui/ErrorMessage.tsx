import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, className = '', onRetry }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded ${className}`}>
      <div className="flex">
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-700 hover:text-red-900 text-sm underline ml-4"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}