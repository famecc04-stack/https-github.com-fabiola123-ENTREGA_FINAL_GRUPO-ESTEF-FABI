import React from 'react';
import { useSelector } from 'react-redux';

const GlobalLoader = () => {
  const isGlobalLoading = useSelector(state => state.ui.globalLoading);

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-surface/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-bold text-primary">Procesando...</span>
      </div>
    </div>
  );
};

export default React.memo(GlobalLoader);
