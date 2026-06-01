import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';

const mockUseRates = vi.fn();

vi.mock('../context/RateContext', () => ({
  useRates: () => mockUseRates(),
}));

describe('AdminPage', () => {
  const defaultMockValue = {
    rates: { rtgs: [] },
    rawRates: {
      rtgs: [
        { id: '945', name: 'Gold 999 (100 grams)', buy: '1,59,734', sell: '1,61,000' },
        { id: '2987', name: 'Silver 999 (5 KGS)', buy: '2,69,267', sell: '2,72,000' },
      ],
    },
    trueRawRates: {
      rtgs: [
        { id: '945', name: 'Gold 999 (100 grams)', buy: '1,59,734', sell: '1,61,000' },
        { id: '2987', name: 'Silver 999 (5 KGS)', buy: '2,69,267', sell: '2,72,000' },
      ],
    },
    adj: {
      gold: { mode: 'amount', value: -11300, isPaused: false, pausedBuy: 0, pausedSell: 0 },
      silver: { mode: 'amount', value: -17000, isPaused: false, pausedBuy: 0, pausedSell: 0 },
      baseModifications: {
        gold999: { mode: 'amount', value: -8400, isPaused: false, pausedBuy: 0, pausedSell: 0 },
        silver999: { mode: 'amount', value: -12000, isPaused: false, pausedBuy: 0, pausedSell: 0 },
      },
      stockOverrides: {},
      ratesPage: {
        goldTable: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0 },
        navarsuTable: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0 },
        silverTable: { mode: 'amount', value: 0, isPaused: false, pausedBuy: 0, pausedSell: 0 },
        showModified: false,
      },
    },
    showModified: true,
    settingsLoaded: true,
    videosLoaded: true,
    updateSettings: vi.fn(),
    updateVideos: vi.fn(),
    refreshRates: vi.fn(),
    loading: false,
    error: null,
    ticker: 'Welcome ticker message',
    videos: [],
    musicSettings: null,
    syncMusicWithMongoDB: vi.fn(),
  };

  it('renders login screen and logs in with valid credentials', async () => {
    mockUseRates.mockReturnValue(defaultMockValue);

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Verify login page is rendered
    expect(screen.getByText('Admin Login')).toBeInTheDocument();

    // Fill in credentials
    const usernameInput = screen.getByPlaceholderText('Enter username');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /Access Dashboard/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(loginButton);

    // Verify it transitioned to Admin Panel
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Gold Buy Modification')).toBeInTheDocument();
  });

  it('renders Pause Rate buttons and clicks them to trigger pausing settings', () => {
    const updateSettingsSpy = vi.fn();
    mockUseRates.mockReturnValue({
      ...defaultMockValue,
      updateSettings: updateSettingsSpy,
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Bypass login by entering admin/admin123
    fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Access Dashboard/i }));

    // Find and verify all "Pause Rate" buttons (4 base rate ones + 3 rates page ones = 7 total)
    const pauseButtons = screen.getAllByRole('button', { name: /Pause Rate/i });
    expect(pauseButtons.length).toBe(7);

    // Click the first pause button (Gold Buy Modification)
    fireEvent.click(pauseButtons[0]);

    // Check that updateSettings was called with the paused values
    expect(updateSettingsSpy).toHaveBeenCalled();
    const callArgs = updateSettingsSpy.mock.calls[0][0];
    expect(callArgs.adj.gold.isPaused).toBe(true);
    expect(callArgs.adj.gold.pausedBuy).toBe(159734); // Verifies comma stripping is 100% correct!
    expect(callArgs.adj.gold.pausedSell).toBe(161000);

    // Now click a rates page pause button (e.g. Rates Gold Table Modification is the 5th pause button, index 4)
    fireEvent.click(pauseButtons[4]);
    expect(updateSettingsSpy).toHaveBeenCalledTimes(2);
    // Verified the rates page setting callback gets invoked
  });
});
