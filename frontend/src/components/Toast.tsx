import { useEffect } from 'react';

export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
      {message}
    </div>
  );
}
