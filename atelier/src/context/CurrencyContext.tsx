import React, { createContext, useContext, useState } from 'react';

export type Currency = 'RUB' | 'KGS';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInRub: number, customKgs?: number) => string;
  formatNumber: (val: number) => string;
  currencySymbol: string;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'RUB',
  setCurrency: () => {},
  formatPrice: (val) => `${val} сом`,
  formatNumber: (val) => val.toString(),
  currencySymbol: 'сом'
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('atelier_currency');
    if (saved === 'RUB' || saved === 'KGS') return saved;
    return 'KGS';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('atelier_currency', c);
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatPrice = (amountInRub: number, customKgs?: number): string => {
    if (currency === 'KGS') {
      const kgsVal = customKgs !== undefined ? customKgs : Math.round(amountInRub * 0.975);
      return `${formatNumber(kgsVal)} сом`;
    }
    return `${formatNumber(amountInRub)} ₽`;
  };

  const currencySymbol = currency === 'KGS' ? 'сом' : '₽';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatNumber, currencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
