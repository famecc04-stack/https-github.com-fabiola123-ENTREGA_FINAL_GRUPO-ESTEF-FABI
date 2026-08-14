import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import { ReservationProvider } from './context/ReservationContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white' }}>
          <h2>Algo salió mal en el render:</h2>
          <pre>{this.state.error.toString()}</pre>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Add global error handler
window.addEventListener('error', (event) => {
  document.body.innerHTML = `<div style="padding: 20px; background: red; color: white;">
    <h2>Error Global:</h2>
    <pre>${event.error?.toString()}</pre>
    <pre>${event.error?.stack}</pre>
  </div>`;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ReservationProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </ReservationProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </StrictMode>,
)
