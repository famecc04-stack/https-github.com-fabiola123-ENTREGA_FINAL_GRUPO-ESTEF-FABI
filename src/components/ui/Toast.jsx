import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../../store/uiSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { isOpen, message, type } = useSelector(state => state.ui.toast);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-bold animate-in slide-in-from-bottom fade-in duration-300 ${bgColors[type] || bgColors.info}`}>
      <span className="material-symbols-outlined">{icons[type] || icons.info}</span>
      {message}
      <button onClick={() => dispatch(hideToast())} className="ml-2 hover:opacity-75 transition-opacity flex items-center">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

export default React.memo(Toast);
