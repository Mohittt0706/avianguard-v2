import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DarkSelect } from '../ui/DarkSelect';
import { sensorApi } from '@/services/sensorApi';

interface AddSensorDialogProps {
  onSuccess: () => void;
}

const DEPLOYMENT_LOCATIONS = [
  { label: 'Nal Sarovar',              wetland: 'Nal Sarovar',              lat: 22.7780, lng: 72.1420 },
  { label: 'Khijadiya Bird Sanctuary', wetland: 'Khijadiya Bird Sanctuary', lat: 22.4920, lng: 70.0680 },
  { label: 'Thol Lake',                wetland: 'Thol Lake',                lat: 23.1200, lng: 72.3800 },
  { label: 'Nalsarovar East',          wetland: 'Nalsarovar East',          lat: 22.7650, lng: 72.1580 },
  { label: 'Narmada Estuary',          wetland: 'Narmada Estuary',          lat: 21.6200, lng: 72.2600 },
  { label: 'Lokhand Sarovar',          wetland: 'Lokhand Sarovar',          lat: 22.5100, lng: 71.2300 },
  { label: 'KIDND',                    wetland: 'KIDND',                    lat: 23.0200, lng: 72.5300 },
  { label: 'Custom Location',          wetland: '',                         lat: NaN,     lng: NaN },
] as const;

const INPUT_CLASS = 'w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all';
const LABEL_CLASS = 'text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block';

export function AddSensorDialog({ onSuccess }: AddSensorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [sensorId, setSensorId] = useState('');
  const [name, setName] = useState('');
  const [locationKey, setLocationKey] = useState('');
  const [location, setLocation] = useState('');
  const [wetland, setWetland] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
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
    setLocationKey('');
    setLocation('');
    setWetland('');
    setLatitude('');
    setLongitude('');
    setStatus('online');
    setTemperature('');
    setPh('');
    setTds('');
    setDissolvedOxygen('');
    setWaterLevel('');
    setBattery('');
    setSignalStrength('');
    setErrors([]);
  }

  function handleLocationSelect(value: string) {
    setLocationKey(value);
    const loc = DEPLOYMENT_LOCATIONS.find(l => l.label === value);
    if (loc) {
      setWetland(loc.wetland);
      setLocation(loc.label);
      if (!isNaN(loc.lat)) {
        setLatitude(String(loc.lat));
        setLongitude(String(loc.lng));
      } else {
        setLatitude('');
        setLongitude('');
      }
    }
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!sensorId.trim()) errs.push('Sensor ID is required');
    if (!name.trim()) errs.push('Sensor Name is required');
    if (!locationKey) errs.push('Please select a Deployment Location');
    if (locationKey === 'Custom Location') {
      if (!latitude.trim()) errs.push('Latitude is required');
      if (!longitude.trim()) errs.push('Longitude is required');
    }
    if (latitude.trim() && isNaN(parseFloat(latitude))) errs.push('Latitude must be a valid number');
    if (longitude.trim() && isNaN(parseFloat(longitude))) errs.push('Longitude must be a valid number');
    if (latitude.trim()) {
      const lat = parseFloat(latitude);
      if (lat < -90 || lat > 90) errs.push('Latitude must be between -90 and 90');
    }
    if (longitude.trim()) {
      const lng = parseFloat(longitude);
      if (lng < -180 || lng > 180) errs.push('Longitude must be between -180 and 180');
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      validationErrors.forEach(msg => toast.error(msg));
      return;
    }

    setLoading(true);
    try {
      await sensorApi.create({
        sensorId: sensorId.trim(),
        name: name.trim(),
        location: location.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
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

      toast.success(`Sensor "${sensorId.trim()}" created successfully`);
      reset();
      setOpen(false);
      window.dispatchEvent(new CustomEvent('sensor:updated'));
      onSuccess();
    } catch (err: unknown) {
      let msg = 'Failed to add sensor. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        msg = axiosErr.response?.data?.message || msg;
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }
      toast.error(msg);
      setErrors([msg]);
    } finally {
      setLoading(false);
    }
  }

  const isCustomLocation = locationKey === 'Custom Location';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
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

        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {errors.map((e, i) => (
              <p key={i} className="text-[11px] text-red-400">{e}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className={LABEL_CLASS}>Sensor ID *</label>
              <input type="text" value={sensorId} onChange={e => setSensorId(e.target.value)} placeholder="e.g. NS-TEMP-01" required
                className={INPUT_CLASS} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={LABEL_CLASS}>Sensor Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nal Sarovar Temp Sensor" required
                className={INPUT_CLASS} />
            </div>
          </div>

          {/* Deployment Location dropdown */}
          <div>
            <label className={LABEL_CLASS}>
              <span className="flex items-center gap-1.5">
                <MapPin size={10} className="text-emerald-400" />
                Deployment Location *
              </span>
            </label>
            <DarkSelect value={locationKey} onChange={handleLocationSelect}
              options={DEPLOYMENT_LOCATIONS.map(loc => ({ value: loc.label, label: loc.label }))}
              placeholder="Select a wetland location..." />
            {locationKey && locationKey !== 'Custom Location' && (
              <p className="text-[10px] text-gray-500 mt-1">
                Lat: {latitude} · Lng: {longitude} · Wetland: {wetland}
              </p>
            )}
          </div>

          {/* Custom location fields - only shown when Custom Location is selected */}
          {isCustomLocation && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LABEL_CLASS}>Wetland Name</label>
                <input type="text" value={wetland} onChange={e => setWetland(e.target.value)} placeholder="e.g. My Custom Wetland"
                  className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Latitude *</label>
                <input type="number" step="0.0001" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="e.g. 22.7780" required
                  className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Longitude *</label>
                <input type="number" step="0.0001" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="e.g. 72.1420" required
                  className={INPUT_CLASS} />
              </div>
            </div>
          )}

          {/* Sensor readings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Status</label>
              <DarkSelect value={status} onChange={setStatus}
                options={['online', 'offline', 'warning', 'maintenance'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Battery %</label>
              <input type="number" value={battery} onChange={e => setBattery(e.target.value)} placeholder="0-100" min="0" max="100"
                className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Signal %</label>
              <input type="number" value={signalStrength} onChange={e => setSignalStrength(e.target.value)} placeholder="0-100" min="0" max="100"
                className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Temperature (°C)</label>
              <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="e.g. 28.5"
                className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>pH</label>
              <input type="number" step="0.1" value={ph} onChange={e => setPh(e.target.value)} placeholder="e.g. 7.2" min="0" max="14"
                className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>TDS (ppm)</label>
              <input type="number" step="0.1" value={tds} onChange={e => setTds(e.target.value)} placeholder="e.g. 210"
                className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Dissolved O₂ (mg/L)</label>
              <input type="number" step="0.1" value={dissolvedOxygen} onChange={e => setDissolvedOxygen(e.target.value)} placeholder="e.g. 6.8"
                className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Water Level (m)</label>
              <input type="number" step="0.1" value={waterLevel} onChange={e => setWaterLevel(e.target.value)} placeholder="e.g. 3.2"
                className={INPUT_CLASS} />
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
