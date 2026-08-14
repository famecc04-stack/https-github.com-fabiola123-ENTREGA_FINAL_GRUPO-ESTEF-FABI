import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

describe('Header Component', () => {
  it('renders the main logo text', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const logo = screen.getByText(/Sazón Dúo Dinámico/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/Reservas/i)).toBeInTheDocument();
    expect(screen.getByText(/Horarios/i)).toBeInTheDocument();
  });

  it('renders the reservation CTA button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const button = screen.getByRole('button', { name: /Reservar ahora/i });
    expect(button).toBeInTheDocument();
  });
});
