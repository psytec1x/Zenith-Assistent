import React, { useState } from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, Compass } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy";
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number; condition: "sunny" | "cloudy" | "rainy" }[];
}

const CITY_WEATHER_DATA: Record<string, WeatherData> = {
  "Berlin": {
    temp: 22,
    condition: "sunny",
    humidity: 45,
    windSpeed: 12,
    forecast: [
      { day: "Morgen", temp: 23, condition: "sunny" },
      { day: "Übermorgen", temp: 21, condition: "cloudy" },
      { day: "Fr.", temp: 19, condition: "rainy" }
    ]
  },
  "München": {
    temp: 18,
    condition: "cloudy",
    humidity: 65,
    windSpeed: 15,
    forecast: [
      { day: "Morgen", temp: 19, condition: "cloudy" },
      { day: "Übermorgen", temp: 22, condition: "sunny" },
      { day: "Fr.", temp: 24, condition: "sunny" }
    ]
  },
  "Zürich": {
    temp: 17,
    condition: "rainy",
    humidity: 80,
    windSpeed: 18,
    forecast: [
      { day: "Morgen", temp: 16, condition: "rainy" },
      { day: "Übermorgen", temp: 18, condition: "cloudy" },
      { day: "Fr.", temp: 20, condition: "sunny" }
    ]
  },
  "Wien": {
    temp: 24,
    condition: "sunny",
    humidity: 40,
    windSpeed: 8,
    forecast: [
      { day: "Morgen", temp: 25, condition: "sunny" },
      { day: "Übermorgen", temp: 26, condition: "sunny" },
      { day: "Fr.", temp: 23, condition: "cloudy" }
    ]
  },
  "Hamburg": {
    temp: 15,
    condition: "stormy",
    humidity: 85,
    windSpeed: 32,
    forecast: [
      { day: "Morgen", temp: 14, condition: "rainy" },
      { day: "Übermorgen", temp: 16, condition: "cloudy" },
      { day: "Fr.", temp: 18, condition: "sunny" }
    ]
  }
};

export default function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState<string>("Berlin");
  const [unit, setUnit] = useState<"C" | "F">("C");

  const weather = CITY_WEATHER_DATA[selectedCity] || CITY_WEATHER_DATA["Berlin"];

  const formatTemp = (celsius: number) => {
    if (unit === "F") {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (cond: string, size = 24) => {
    switch (cond) {
      case "sunny":
        return <Sun size={size} className="text-amber-400 animate-spin-slow" />;
      case "cloudy":
        return <Cloud size={size} className="text-slate-400 animate-pulse" />;
      case "rainy":
        return <CloudRain size={size} className="text-blue-400" />;
      case "stormy":
        return <CloudLightning size={size} className="text-violet-400" />;
      default:
        return <Sun size={size} className="text-amber-400" />;
    }
  };

  const getWeatherLabel = (cond: string) => {
    switch (cond) {
      case "sunny": return "Sonnig";
      case "cloudy": return "Bewölkt";
      case "rainy": return "Regnerisch";
      case "stormy": return "Gewitter";
      default: return "Sonnig";
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-4 justify-between">
      {/* City selector & Metric toggle */}
      <div className="flex items-center justify-between">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-black/40 border border-white/5 rounded px-2 py-1 text-slate-300 font-mono text-[10px] focus:outline-none"
        >
          {Object.keys(CITY_WEATHER_DATA).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* C / F Unit Button */}
        <button
          onClick={() => setUnit(unit === "C" ? "F" : "C")}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-[9px] transition-colors"
        >
          Einheit: {unit === "C" ? "Celsius" : "Fahrenheit"}
        </button>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Aktuelles Wetter</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatTemp(weather.temp)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({getWeatherLabel(weather.condition)})
            </span>
          </div>
        </div>

        <div className="p-2 bg-white/5 rounded-full">
          {getWeatherIcon(weather.condition, 28)}
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/20 border border-white/5 p-1.5 rounded-lg flex flex-col items-center justify-center text-center space-y-1">
          <Droplets size={12} className="text-blue-400" />
          <span className="text-[8px] text-slate-500 font-mono uppercase">Feuchte</span>
          <span className="text-[10px] font-bold font-mono text-slate-200">{weather.humidity}%</span>
        </div>

        <div className="bg-black/20 border border-white/5 p-1.5 rounded-lg flex flex-col items-center justify-center text-center space-y-1">
          <Wind size={12} className="text-teal-400" />
          <span className="text-[8px] text-slate-500 font-mono uppercase">Wind</span>
          <span className="text-[10px] font-bold font-mono text-slate-200">{weather.windSpeed} km/h</span>
        </div>

        <div className="bg-black/20 border border-white/5 p-1.5 rounded-lg flex flex-col items-center justify-center text-center space-y-1">
          <Compass size={12} className="text-gold" />
          <span className="text-[8px] text-slate-500 font-mono uppercase">UV-Index</span>
          <span className="text-[10px] font-bold font-mono text-slate-200">Niedrig</span>
        </div>
      </div>

      {/* 3-Day Forecast Row */}
      <div className="space-y-1.5">
        <span className="font-bold text-slate-500 uppercase tracking-wider block text-[8px] font-mono">3-Tage-Prognose</span>
        <div className="grid grid-cols-3 gap-2">
          {weather.forecast.map((fc, i) => (
            <div key={i} className="bg-black/30 border border-white/5 p-1.5 rounded-lg text-center flex flex-col items-center justify-between space-y-1">
              <span className="text-[8px] font-mono text-slate-400">{fc.day}</span>
              <div>{getWeatherIcon(fc.condition, 14)}</div>
              <span className="text-[9px] font-bold font-mono text-white mt-0.5">{formatTemp(fc.temp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
