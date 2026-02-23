import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
};

const TOAST_ICONS = {
  [TOAST_TYPES.SUCCESS]: '✓',
  [TOAST_TYPES.ERROR]: '!',
  [TOAST_TYPES.INFO]: 'ℹ',
};

const TOAST_DURATION = 3000;

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type, message, duration = TOAST_DURATION }) => {
    const id = generateId();
    
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message) => {
    showToast({ type: TOAST_TYPES.SUCCESS, message });
  }, [showToast]);

  const error = useCallback((message) => {
    showToast({ type: TOAST_TYPES.ERROR, message });
  }, [showToast]);

  const info = useCallback((message) => {
    showToast({ type: TOAST_TYPES.INFO, message });
  }, [showToast]);

  // Listen for global toast events (from API interceptor)
  useEffect(() => {
    const handleGlobalToast = (event) => {
      const { type, message } = event.detail;
      showToast({ type, message });
    };

    window.addEventListener('toast', handleGlobalToast);
    return () => window.removeEventListener('toast', handleGlobalToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ id, type, message, onDismiss }) {
  const handleDismiss = () => {
    onDismiss(id);
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {TOAST_ICONS[type]}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={handleDismiss}>
        <span>✕</span>
      </button>
      <div className="toast-progress" />
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { TOAST_TYPES };
