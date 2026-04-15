import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

const mockUseRates = vi.fn();

vi.mock('../context/RateContext', () => ({
  useRates: () => mockUseRates(),
}));

describe('Navigation', () => {
  it('shows music toggle on home page and triggers callback', () => {
    const toggleMusic = vi.fn();
    mockUseRates.mockReturnValue({
      rates: {},
      isMusicEnabled: false,
      toggleMusic,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    );

    const btn = screen.getByTitle('Turn On Music');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(toggleMusic).toHaveBeenCalledTimes(1);
  });

  it('hides music toggle on videos page', () => {
    mockUseRates.mockReturnValue({
      rates: {},
      isMusicEnabled: false,
      toggleMusic: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/videos']}>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.queryByTitle('Turn On Music')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Turn Off Music')).not.toBeInTheDocument();
  });
});
