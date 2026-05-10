import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast: React.FC = () => {
  const { toast, clearToast } = useUIStore();

  if (!toast.message) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={18} />;
      case 'error': return <AlertCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className={`toast-container ${toast.type}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close-btn" onClick={clearToast}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
