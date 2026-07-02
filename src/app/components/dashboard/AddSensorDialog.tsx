import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { sensorApi } from '@/services/sensorApi';

interface AddSensorDialogProps {
  onSuccess: () => void;
}

export function AddSensorDialog({ onSuccess }: AddSensorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sensorId, setSensorId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [wetland, setWetland] = useState('');
  const [status, setStatus] = useState('online');
  const [temperature, setTemperature] = useState('');
  const [ph, setPh] = useState('');
  const [tds, setTds] = useState('');
  const [dissolvedOxygen, setDissolvedOxygen] = useState('');
  const [waterLevel, setWaterLevel] = useState('');
  const [battery, setBattery] = useState('');
  const [signalStrength, setSignalStrength] = useState('');

  function reset() {
    setSensorId('');
    setName('');
    setLocation('');
    setWetland('');
    setStatus('online');
    setTemperature('');
    setPh('');
    setTds('');
    setDissolvedOxygen('');
    setWaterLevel('');
    setBattery('');
    setSignalStrength('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!sensorId.trim() || !name.trim()) {
      toast.error('Sensor ID and Name are required');
      return;
    }

    setLoading(true);
    try {
      await sensorApi.create({
        sensorId: sensorId.trim(),
        name: name.trim(),
        location: location.trim() || undefined,
        wetland: wetland.trim() || undefined,
        status: status as 'online' | 'offline' | 'warning' | 'maintenance',
        temperature: temperature ? parseFloat(temperature) : undefined,
        ph: ph ? parseFloat(ph) : undefined,
        tds: tds ? parseFloat(tds) : undefined,
        dissolvedOxygen: dissolvedOxygen ? parseFloat(dissolvedOxygen) : undefined,
        waterLevel: waterLevel ? parseFloat(waterLevel) : undefined,
        battery: battery ? parseFloat(battery) : undefined,
        signalStrength: signalStrength ? parseFloat(signalStrength) : undefined,
      });
      toast.success('Sensor added successfully');
      reset();
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add sensor';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={13} />
          Add Sensor
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border border-white/[0.08] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Add New Sensor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Sensor ID *</label>
              <input type="text" value={sensorId} onChange={e => setSensorId(e.target.value)} placeholder="e.g. NS-TEMP-01" required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nal Sarovar Temp Sensor" required
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Nal Sarovar"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Wetland</label>
              <input type="text" value={wetland} onChange={e => setWetland(e.target.value)} placeholder="Nal Sarovar"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Battery %</label>
              <input type="number" value={battery} onChange={e => setBattery(e.target.value)} placeholder="0-100" min="0" max="100"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Signal %</label>
              <input type="number" value={signalStrength} onChange={e => setSignalStrength(e.target.value)} placeholder="0-100" min="0" max="100"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Temperature (°C)</label>
              <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="e.g. 28.5"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">pH</label>
              <input type="number" step="0.1" value={ph} onChange={e => setPh(e.target.value)} placeholder="e.g. 7.2" min="0" max="14"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">TDS (ppm)</label>
              <input type="number" step="0.1" value={tds} onChange={e => setTds(e.target.value)} placeholder="e.g. 210"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Dissolved O₂ (mg/L)</label>
              <input type="number" step="0.1" value={dissolvedOxygen} onChange={e => setDissolvedOxygen(e.target.value)} placeholder="e.g. 6.8"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Water Level (m)</label>
              <input type="number" step="0.1" value={waterLevel} onChange={e => setWaterLevel(e.target.value)} placeholder="e.g. 3.2"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {loading ? 'Adding...' : 'Add Sensor'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
