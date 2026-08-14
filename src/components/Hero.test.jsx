import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from './Hero';

describe('Hero Component', () => {
  it('renders the main heading', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    const heading = screen.getByText(/El auténtico sabor criollo en cada plato/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders the reservation button', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    const button = screen.getByRole('button', { name: /Reservar ahora/i });
    expect(button).toBeInTheDocument();
  });
});
