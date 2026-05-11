import React from 'react';
import { useUIStore } from '@project/shared/src/store/uiStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';
import clsx from 'clsx';

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
    <div className={clsx(styles.toastContainer, styles[toast.type as keyof typeof styles])}>
      <div className={styles.toastContent}>
        {getIcon()}
        <span className={styles.toastMessage}>{toast.message}</span>
      </div>
      <button className={styles.toastCloseBtn} onClick={clearToast}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
