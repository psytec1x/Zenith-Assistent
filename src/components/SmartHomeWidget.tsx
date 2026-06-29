import React, { useState } from "react";
import { SmartHomeDevice } from "../types";
import { Bluetooth, BluetoothSearching, Lightbulb, Thermometer, Zap, Volume2, Power } from "lucide-react";

interface SmartHomeWidgetProps {
  devices: SmartHomeDevice[];
  onUpdateDevice: (updated: SmartHomeDevice) => void;
  onAddLog: (log: string) => void;
}

export default function SmartHomeWidget({ devices, onUpdateDevice, onAddLog }: SmartHomeWidgetProps) {
  const [scanning, setScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Web Bluetooth API Integration
  const connectBluetoothDevice = async () => {
    if (!(navigator as any).bluetooth) {
      setStatusMessage("Web Bluetooth wird von diesem Browser / Iframe nicht unterstützt. Simuliere Scan...");
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        setStatusMessage("Virtuelles Smart-Home-Gateway verbunden!");
        onAddLog("Smart-Home: Virtuelles Gateway über Bluetooth gekoppelt.");
      }, 1500);
      return;
    }

    try {
      setScanning(true);
      setStatusMessage("Suche Bluetooth Smart-Home-Geräte...");
      
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service"] // standard services
      });

      setStatusMessage(`Verbunden mit: ${device.name || "Unbenanntes Gerät"}`);
      onAddLog(`Smart-Home: Bluetooth-Gerät erfolgreich gekoppelt: ${device.name || "Bluetooth IoT"}`);
    } catch (err: any) {
      console.warn("Bluetooth connection aborted or failed:", err);
      setStatusMessage(`Bluetooth abgebrochen: ${err.message || "Nicht unterstützt im Iframe"}`);
    } finally {
      setScanning(false);
    }
  };

  const togglePower = (device: SmartHomeDevice) => {
    const updated = { ...device, power: !device.power };
    onUpdateDevice(updated);
    onAddLog(`Smart-Home: ${device.name} ${updated.power ? "EINGESCHALTET" : "AUSGESCHALTET"}`);
  };

  const handleSliderChange = (device: SmartHomeDevice, val: number) => {
    const updated = { ...device, value: val };
    onUpdateDevice(updated);
  };

  const getDeviceIcon = (type: SmartHomeDevice["type"]) => {
    switch (type) {
      case "light": return <Lightbulb size={14} className="text-amber-400" />;
      case "thermostat": return <Thermometer size={14} className="text-emerald-400" />;
      case "plug": return <Zap size={14} className="text-cyan-400" />;
      case "speaker": return <Volume2 size={14} className="text-violet-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Bluetooth Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <button
          onClick={connectBluetoothDevice}
          disabled={scanning}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-medium transition-colors ${
            scanning
              ? "bg-rose-950/20 border-rose-900/40 text-rose-400"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          {scanning ? <BluetoothSearching size={12} className="animate-spin" /> : <Bluetooth size={12} />}
          <span>{scanning ? "Scanne..." : "Bluetooth Gerät koppeln"}</span>
        </button>

        {statusMessage && (
          <span className="text-[9px] font-mono text-emerald-400 max-w-[150px] truncate" title={statusMessage}>
            {statusMessage}
          </span>
        )}
      </div>

      {/* Device List */}
      <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
        {devices.map((device) => {
          const icon = getDeviceIcon(device.type);
          return (
            <div
              key={device.id}
              className={`p-2 rounded-lg border transition-all ${
                device.power
                  ? "bg-slate-900/90 border-slate-800"
                  : "bg-slate-950/40 border-slate-950 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`p-1.5 rounded-md ${device.power ? "bg-slate-800" : "bg-slate-900/40"}`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200 block truncate">{device.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">
                      Status: <span className={device.status === "online" || device.status === "connected" ? "text-emerald-400" : "text-rose-400"}>{device.status}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => togglePower(device)}
                  className={`p-1.5 rounded-full border transition-all ${
                    device.power
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                  title={device.power ? "Ausschalten" : "Einschalten"}
                >
                  <Power size={12} />
                </button>
              </div>

              {/* Sliders for active controllable devices */}
              {device.power && (device.type === "light" || device.type === "thermostat" || device.type === "speaker") && (
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center space-x-2 text-[10px] font-mono">
                  <span className="text-slate-500">
                    {device.type === "light" ? "Helligkeit:" : device.type === "thermostat" ? "Temp:" : "Volume:"}
                  </span>
                  <input
                    type="range"
                    min={device.type === "thermostat" ? 16 : 0}
                    max={device.type === "thermostat" ? 28 : 100}
                    value={device.value}
                    onChange={(e) => handleSliderChange(device, parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-emerald-400 font-bold w-8 text-right">
                    {device.value}{device.type === "light" || device.type === "speaker" ? "%" : "°C"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
