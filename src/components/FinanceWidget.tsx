import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Calculator } from "lucide-react";

interface AssetTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

export default function FinanceWidget() {
  const [tickers, setTickers] = useState<AssetTicker[]>([
    { symbol: "EUR/USD", name: "Euro / US Dollar", price: 1.0895, change: 0.12, history: [1.087, 1.088, 1.086, 1.089, 1.088, 1.0895] },
    { symbol: "BTC/EUR", name: "Bitcoin / Euro", price: 62450, change: 1.84, history: [61200, 61500, 61800, 61400, 62100, 62450] },
    { symbol: "GOLD", name: "Gold Unze (USD)", price: 2345.50, change: -0.45, history: [2360, 2355, 2352, 2348, 2346, 2345.50] },
    { symbol: "EUR/CHF", name: "Euro / Schweizer Franken", price: 0.9812, change: -0.05, history: [0.982, 0.9815, 0.9822, 0.981, 0.9813, 0.9812] }
  ]);

  const [fromAmount, setFromAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [convertedResult, setConvertedResult] = useState<number>(108.95);

  // Live price fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((ticker) => {
          const deltaPercent = (Math.random() - 0.48) * 0.4; // slight upward drift overall
          const oldPrice = ticker.price;
          const priceMultiplier = 1 + deltaPercent / 100;
          const newPrice = Number((oldPrice * priceMultiplier).toFixed(ticker.symbol.includes("EUR/USD") || ticker.symbol.includes("EUR/CHF") ? 4 : 2));
          const change = Number((ticker.change + deltaPercent).toFixed(2));
          const history = [...ticker.history.slice(1), newPrice];

          return {
            ...ticker,
            price: newPrice,
            change,
            history
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Recalculate exchange rate instantly on input change
  useEffect(() => {
    // Basic exchange rates mapped dynamically relative to EUR
    const rates: Record<string, number> = {
      EUR: 1.0,
      USD: 1.09,
      CHF: 0.98,
      GBP: 0.84,
      BTC: 1 / 62450
    };

    const rateInEUR = fromAmount / rates[fromCurrency];
    const converted = rateInEUR * rates[toCurrency];
    setConvertedResult(Number(converted.toFixed(toCurrency === "BTC" ? 6 : 2)));
  }, [fromAmount, fromCurrency, toCurrency, tickers]);

  // SVG Sparkline Chart generator
  const renderSparkline = (data: number[], isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 70;
    const height = 18;
    const points = data
      .map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg className="w-[70px] h-[18px]" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={isPositive ? "#10B981" : "#F43F5E"}
          strokeWidth="1.5"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3.5 justify-between">
      
      {/* Ticker Row Display */}
      <div className="space-y-1.5">
        <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] font-mono">Live Devisen & Commodities</span>
        
        <div className="grid grid-cols-2 gap-2">
          {tickers.map((t) => {
            const isPositive = t.change >= 0;
            return (
              <div key={t.symbol} className="bg-black/40 border border-white/5 p-2 rounded-lg flex flex-col justify-between space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-white text-[10px]">{t.symbol}</span>
                  <div className={`flex items-center text-[8px] font-mono font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPositive ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                    <span>{isPositive ? "+" : ""}{t.change}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <span className="font-mono text-[11px] text-slate-200 font-bold">
                    {t.price.toLocaleString(undefined, { minimumFractionDigits: t.symbol.includes("EUR") ? 4 : 2 })}
                  </span>
                  
                  {/* Micro vector sparkline chart */}
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    {renderSparkline(t.history, isPositive)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculator Widget */}
      <div className="bg-black/20 border border-white/5 p-2.5 rounded-xl space-y-2">
        <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px] font-mono flex items-center space-x-1">
          <Calculator size={11} className="text-gold" />
          <span>Echtzeit-Umrechner</span>
        </span>

        <div className="grid grid-cols-3 gap-2 text-[10px]">
          {/* Input amount */}
          <div className="col-span-1">
            <span className="text-slate-500 block text-[8px] font-mono mb-0.5">Betrag</span>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-white text-right font-mono focus:outline-none focus:border-gold/30"
            />
          </div>

          {/* From Currency dropdown */}
          <div>
            <span className="text-slate-500 block text-[8px] font-mono mb-0.5">Von</span>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BTC">BTC (₿)</option>
            </select>
          </div>

          {/* To Currency dropdown */}
          <div>
            <span className="text-slate-500 block text-[8px] font-mono mb-0.5">Nach</span>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BTC">BTC (₿)</option>
            </select>
          </div>
        </div>

        {/* Calculated Output Result */}
        <div className="bg-black/40 border border-white/5 p-2 rounded-lg text-center font-mono flex items-center justify-between">
          <span className="text-slate-500 text-[9px]">Ergebnis:</span>
          <span className="text-white font-bold text-xs">
            {fromAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {fromCurrency} ={" "}
            <span className="text-gold">{convertedResult.toLocaleString(undefined, { maximumFractionDigits: toCurrency === "BTC" ? 6 : 2 })}</span> {toCurrency}
          </span>
        </div>
      </div>

    </div>
  );
}
