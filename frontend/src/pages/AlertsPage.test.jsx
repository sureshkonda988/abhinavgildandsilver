import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AlertsPage from './AlertsPage';

const mockUseRates = vi.fn();

vi.mock('../context/RateContext', () => ({
  useRates: () => mockUseRates(),
}));

describe('AlertsPage', () => {
  it('renders API news when available', () => {
    mockUseRates.mockReturnValue({
      news: [
        {
          id: 'n1',
          title: 'Market jumps',
          msg: 'Gold is up today',
          date: '14 Apr 2026',
          type: 'info',
        },
      ],
    });

    render(
      <MemoryRouter>
        <AlertsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Market jumps')).toBeInTheDocument();
    expect(screen.getByText('Gold is up today')).toBeInTheDocument();
  });

  it('falls back to static alerts when news is empty', () => {
    mockUseRates.mockReturnValue({ news: [] });

    render(
      <MemoryRouter>
        <AlertsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Gold Breaks $5,400 Mark')).toBeInTheDocument();
  });
});
