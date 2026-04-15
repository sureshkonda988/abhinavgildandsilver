import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RatesPage from './RatesPage';

const mockUseRates = vi.fn();

vi.mock('../context/RateContext', () => ({
  useRates: () => mockUseRates(),
}));

describe('RatesPage', () => {
  it('renders all three rates tables', () => {
    mockUseRates.mockReturnValue({
      rates: {
        ratesPagePurities: [
          { name: 'Gold 24 KT', sell: 100000 },
          { name: 'Gold 22 KT', sell: 91600 },
        ],
        navarsuRate: 73280,
        ratesPageSilver: { sell: 1200 },
        rtgs: [{ sell: 1 }],
      },
      rawRates: {},
      loading: false,
      error: null,
      getPriceClass: () => 'gold-default',
      isMusicEnabled: false,
      toggleMusic: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RatesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Live Retail Rates with GST')).toBeInTheDocument();
    expect(screen.getByText('Gold 24 KT')).toBeInTheDocument();
    expect(screen.getByText('8 GRAMS')).toBeInTheDocument();
    expect(screen.getByText('Silver 999')).toBeInTheDocument();
  });

  it('shows loading message when no rates are available', () => {
    mockUseRates.mockReturnValue({
      rates: {
        ratesPagePurities: [],
        navarsuRate: '-',
        ratesPageSilver: { sell: '-' },
        rtgs: [{ sell: '-' }],
      },
      rawRates: {},
      loading: true,
      error: null,
      getPriceClass: () => 'gold-default',
      isMusicEnabled: false,
      toggleMusic: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RatesPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Connecting to live market/i)).toBeInTheDocument();
  });
});
