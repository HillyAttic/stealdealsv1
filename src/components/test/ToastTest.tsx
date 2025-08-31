'use client';

import { useToast } from '@/contexts/ToastContext';

export function ToastTest() {
  const { showWarning, showSuccess, showError, showInfo } = useToast();

  const testToasts = () => {
    console.log('[ToastTest] Testing toasts...');
    
    showWarning(
      'Warning Test',
      'This is a warning toast test',
      {
        duration: 5000,
        action: {
          label: 'Click Me',
          onClick: () => alert('Action clicked!')
        }
      }
    );

    setTimeout(() => {
      showSuccess('Success Test', 'This is a success toast');
    }, 1000);

    setTimeout(() => {
      showError('Error Test', 'This is an error toast');
    }, 2000);

    setTimeout(() => {
      showInfo('Info Test', 'This is an info toast');
    }, 3000);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Toast Test Component</h3>
      <button
        onClick={testToasts}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test All Toasts
      </button>
    </div>
  );
}