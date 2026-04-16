export const normalizeRatesPageSettings = (savedRatesPage = {}) => {
  const legacyGold = savedRatesPage.gold || { mode: 'amount', value: 0 };
  const legacySilver = savedRatesPage.silver || { mode: 'amount', value: 0 };

  return {
    goldTable: savedRatesPage.goldTable || legacyGold,
    navarsuTable: savedRatesPage.navarsuTable || legacyGold,
    silverTable: savedRatesPage.silverTable || legacySilver,
    showModified: savedRatesPage.showModified || false,
  };
};

export const computeNavarsu8gBase = (gold999Sell) => {
  const live999Sell = Number(gold999Sell) || 0;
  if (!live999Sell) return 0;
  return Math.round(Math.round(live999Sell * 0.916) * 0.8);
};

export const computeGoldTableSell = (gold999Sell, factor, isModified, modifier) => {
  const live = Number(gold999Sell) || 0;
  if (!live) return '-';

  const base = Math.round(live * factor);
  if (!isModified) return base;

  return Math.round(base + (modifier?.value || 0));
};

export const computeSilver10gSell = (silverSell, isModified, modifier) => {
  const live1kg = Number(silverSell) || 0;
  if (!live1kg) return '-';
  
  // Convert 1kg rate to 10g rate (divide by 100)
  const live = live1kg / 100;
  
  if (!isModified) return Math.round(live);
  return Math.round(live + (modifier?.value || 0));
};

export const computeNavarsu8gSell = (gold999Sell, isModified, modifier) => {
  const base = computeNavarsu8gBase(gold999Sell);
  if (!base) return '-';
  if (!isModified) return base;
  return Math.round(base + (modifier?.value || 0));
};
