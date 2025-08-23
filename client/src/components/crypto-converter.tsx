import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CRYPTO_CURRENCIES = [
  { value: "bitcoin", label: "Bitcoin (BTC)" },
  { value: "ethereum", label: "Ethereum (ETH)" },
  { value: "cardano", label: "Cardano (ADA)" },
  { value: "polkadot", label: "Polkadot (DOT)" },
];

const FIAT_CURRENCIES = [
  { value: "usd", label: "US Dollar (USD)" },
  { value: "eur", label: "Euro (EUR)" },
  { value: "gbp", label: "British Pound (GBP)" },
  { value: "jpy", label: "Japanese Yen (JPY)" },
];

export default function CryptoConverter() {
  const [fromCurrency, setFromCurrency] = useState("bitcoin");
  const [toCurrency, setToCurrency] = useState("usd");
  const [amount, setAmount] = useState("1");
  const [shouldFetch, setShouldFetch] = useState(false);
  const { toast } = useToast();

  const { data: conversionData, isLoading, error } = useQuery({
    queryKey: ["/api/crypto/convert", fromCurrency, toCurrency, amount],
    queryFn: async ({ queryKey }) => {
      const [, , from, to, amt] = queryKey;
      const response = await fetch(`/api/crypto/convert?from=${from}&to=${to}&amount=${amt}`);
      if (!response.ok) {
        throw new Error("Failed to convert crypto currency");
      }
      return response.json();
    },
    enabled: shouldFetch && !!fromCurrency && !!toCurrency && !!amount,
  });

  const handleConvert = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    setShouldFetch(true);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Cryptocurrency Converter</h2>
        {conversionData && (
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {new Date(conversionData.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="from-currency" className="text-sm font-medium text-gray-700">
              From Currency
            </Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger data-testid="select-from-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-amount"
            />
          </div>

          <div>
            <Label htmlFor="to-currency" className="text-sm font-medium text-gray-700">
              To Currency
            </Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger data-testid="select-to-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIAT_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleConvert} 
            className="w-full bg-primary hover:bg-primary-dark" 
            disabled={isLoading}
            data-testid="button-convert"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {isLoading ? "Converting..." : "Convert"}
          </Button>
        </div>

        {/* Results Section */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Result</h3>
            
            {error && (
              <div className="text-center text-red-600">
                <p>Error: {error.message}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Converting...</p>
              </div>
            )}
            
            {conversionData && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" data-testid="text-converted-amount">
                    {formatCurrency(conversionData.convertedAmount, conversionData.to)}
                  </div>
                  <div className="text-gray-500 mt-2">
                    1 {conversionData.from.toUpperCase()} = {formatCurrency(conversionData.rate, conversionData.to)}
                  </div>
                </div>
                
                {conversionData.marketData && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">24h Change:</span>
                        <span className={`font-medium ml-1 ${
                          conversionData.marketData.change24h >= 0 ? 'text-success' : 'text-error'
                        }`}>
                          {conversionData.marketData.change24h?.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <span className="font-medium ml-1">
                          ${formatNumber(conversionData.marketData.volume24h / 1000000000, 1)}B
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Market Cap:</span>
                        <span className="font-medium ml-1">
                          ${formatNumber(conversionData.marketData.marketCap / 1000000000, 0)}B
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rank:</span>
                        <span className="font-medium ml-1">#1</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!conversionData && !isLoading && !error && (
              <div className="text-center text-gray-500">
                <p>Enter amount and click convert to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
