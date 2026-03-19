import {
  createContext, useContext, useEffect, useState,
  useCallback, useMemo, type ReactNode
} from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

// Major currencies — extended list fetched from API, this is the fallback
const FALLBACK_CURRENCIES: Currency[] = [
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand',  flag: '🇿🇦' },
  { code: 'USD', symbol: '$',   name: 'US Dollar',            flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',   name: 'Euro',                 flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',        flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',           flag: '🇦🇪' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling',      flag: '🇰🇪' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira',       flag: '🇳🇬' },
  { code: 'GHS', symbol: '₵',   name: 'Ghanaian Cedi',        flag: '🇬🇭' },
  { code: 'MUR', symbol: '₨',   name: 'Mauritian Rupee',      flag: '🇲🇺' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',    flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar',      flag: '🇨🇦' },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee',         flag: '🇮🇳' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',         flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan',         flag: '🇨🇳' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real',       flag: '🇧🇷' },
  { code: 'MXN', symbol: '$',   name: 'Mexican Peso',         flag: '🇲🇽' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling',   flag: '🇹🇿' },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah',    flag: '🇮🇩' },
  { code: 'THB', symbol: '฿',   name: 'Thai Baht',            flag: '🇹🇭' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',     flag: '🇸🇬' },
];

interface LocationInfo {
  country: string;
  countryCode: string;
  currency: string;
  city: string;
  timezone: string;
}

interface CurrencyContextType {
  currency: Currency;
  currencies: Currency[];
  setCurrency: (c: Currency) => void;
  location: LocationInfo | null;
  rate: number; // exchange rate to ZAR
  convertToZAR: (amount: number) => number;
  convertFromZAR: (amount: number) => number;
  formatAmount: (amount: number) => string;
  formatZAR: (amount: number) => string;
  isZAR: boolean;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Map country currency codes to our Currency objects
const findCurrency = (code: string): Currency =>
  FALLBACK_CURRENCIES.find(c => c.code === code) || FALLBACK_CURRENCIES[0];

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(FALLBACK_CURRENCIES[0]); // ZAR default
  const [currencies, setCurrencies] = useState<Currency[]>(FALLBACK_CURRENCIES);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [rate, setRate] = useState<number>(1); // 1 ZAR = 1 ZAR default
  const [loading, setLoading] = useState(true);

  // Step 1: Detect location via IP
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const cached = sessionStorage.getItem('jb_location');
        if (cached) {
          const loc: LocationInfo = JSON.parse(cached);
          setLocation(loc);
          const detected = findCurrency(loc.currency);
          setCurrencyState(detected);
          await fetchRate(detected.code);
          return;
        }

        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        const loc: LocationInfo = {
          country: data.country_name || 'South Africa',
          countryCode: data.country_code || 'ZA',
          currency: data.currency || 'ZAR',
          city: data.city || '',
          timezone: data.timezone || 'Africa/Johannesburg',
        };

        sessionStorage.setItem('jb_location', JSON.stringify(loc));
        setLocation(loc);

        const detected = findCurrency(loc.currency);
        setCurrencyState(detected);
        await fetchRate(detected.code);
      } catch {
        // Default to ZAR on failure
        setRate(1);
      } finally {
        setLoading(false);
      }
    };

    void detectLocation();
  }, []);

  // Step 2: Fetch exchange rate from ZAR base
  const fetchRate = async (targetCode: string) => {
    if (targetCode === 'ZAR') { setRate(1); return; }
    try {
      // Free API — no key needed, ZAR base
      const res = await fetch(`https://open.er-api.com/v6/latest/ZAR`);
      const data = await res.json();
      if (data.rates && data.rates[targetCode]) {
        setRate(data.rates[targetCode]);
      }

      // Also build full currency list from API response
      if (data.rates) {
        const apiCurrencies = Object.keys(data.rates)
          .map(code => findCurrency(code))
          .filter(c => c.code !== 'ZAR');
        // Merge with fallback, deduplicate, ZAR first
        const merged = [
          FALLBACK_CURRENCIES[0],
          ...FALLBACK_CURRENCIES.slice(1).filter(c => data.rates[c.code]),
          ...apiCurrencies.filter(c => !FALLBACK_CURRENCIES.find(f => f.code === c.code)),
        ];
        setCurrencies(merged.slice(0, 50)); // cap at 50
      }
    } catch {
      setRate(1);
    }
  };

  const setCurrency = useCallback(async (c: Currency) => {
    setCurrencyState(c);
    setLoading(true);
    await fetchRate(c.code);
    setLoading(false);
  }, []);

  const isZAR = currency.code === 'ZAR';

  // Convert user's currency amount → ZAR
  const convertToZAR = useCallback((amount: number): number => {
    if (isZAR || rate === 0) return amount;
    return Math.round(amount / rate);
  }, [isZAR, rate]);

  // Convert ZAR → user's currency
  const convertFromZAR = useCallback((amount: number): number => {
    if (isZAR || rate === 0) return amount;
    return Math.round(amount * rate * 100) / 100;
  }, [isZAR, rate]);

  // Format in user's currency
  const formatAmount = useCallback((amount: number): string => {
    const converted = convertFromZAR(amount);
    return `${currency.symbol}${converted.toLocaleString()}`;
  }, [currency, convertFromZAR]);

  // Always format as ZAR
  const formatZAR = useCallback((amount: number): string => {
    return `R${Math.round(amount).toLocaleString()}`;
  }, []);

  const value = useMemo(() => ({
    currency, currencies, setCurrency, location,
    rate, convertToZAR, convertFromZAR,
    formatAmount, formatZAR, isZAR, loading,
  }), [currency, currencies, location, rate, loading]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
