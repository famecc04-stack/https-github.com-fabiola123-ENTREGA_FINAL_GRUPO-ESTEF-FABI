import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toast: {
    isOpen: false,
    message: '',
    type: 'success', // 'success', 'error', 'info'
  },
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, action) {
      state.toast = {
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type || 'success',
      };
    },
    hideToast(state) {
      state.toast.isOpen = false;
      state.toast.message = '';
    },
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    }
  },
});

export const { showToast, hideToast, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;