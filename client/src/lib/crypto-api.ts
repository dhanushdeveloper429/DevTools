interface CryptoConversionResponse {
  from: string;
  to: string;
  amount: number;
  rate: number;
  convertedAmount: number;
  marketData?: {
    marketCap?: number;
    change24h?: number;
    volume24h?: number;
  };
  lastUpdated: string;
}

interface CryptoApiError {
  message: string;
  code?: string;
}

export const convertCrypto = async (
  from: string,
  to: string,
  amount: number
): Promise<CryptoConversionResponse> => {
  try {
    const response = await fetch(
      `/api/crypto/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amount}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during crypto conversion');
  }
};

export const getSupportedCryptoCurrencies = () => {
  return [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
    { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  ];
};

export const getSupportedFiatCurrencies = () => {
  return [
    { id: 'usd', name: 'US Dollar', symbol: 'USD' },
    { id: 'eur', name: 'Euro', symbol: 'EUR' },
    { id: 'gbp', name: 'British Pound', symbol: 'GBP' },
    { id: 'jpy', name: 'Japanese Yen', symbol: 'JPY' },
    { id: 'cad', name: 'Canadian Dollar', symbol: 'CAD' },
    { id: 'aud', name: 'Australian Dollar', symbol: 'AUD' },
    { id: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
    { id: 'cny', name: 'Chinese Yuan', symbol: 'CNY' },
  ];
};

export const formatCryptoAmount = (amount: number, decimals: number = 8): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const formatFiatAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

export const formatVolume = (volume: number): string => {
  return formatMarketCap(volume); // Same formatting logic
};

export const isValidCryptoAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0 && isFinite(numAmount);
};

export const getCryptoDisplayName = (currencyId: string): string => {
  const crypto = getSupportedCryptoCurrencies().find(c => c.id === currencyId);
  return crypto ? `${crypto.name} (${crypto.symbol})` : currencyId.toUpperCase();
};

export const getFiatDisplayName = (currencyId: string): string => {
  const fiat = getSupportedFiatCurrencies().find(c => c.id === currencyId);
  return fiat ? `${fiat.name} (${fiat.symbol})` : currencyId.toUpperCase();
};
