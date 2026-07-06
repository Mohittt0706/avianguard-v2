import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { sensorApi } from '@/services/sensorApi';

interface DeleteSensorDialogProps {
  sensor: { id: string; name: string; sensorId: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteSensorDialog({ sensor, open, onOpenChange, onSuccess }: DeleteSensorDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!sensor) return;
    setLoading(true);
    try {
      await sensorApi.delete(sensor.id);
      toast.success(`Sensor "${sensor.name}" deleted`);
      onOpenChange(false);
      window.dispatchEvent(new CustomEvent('sensor:updated'));
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete sensor';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border border-white/[0.08] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Delete Sensor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="p-1.5 rounded-full bg-red-500/20 shrink-0">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <div className="text-sm text-gray-300">
              <p className="font-medium text-red-300 mb-1">Are you sure?</p>
              <p>This will permanently delete <strong className="text-white">{sensor?.name}</strong> (ID: {sensor?.sensorId}) and all associated readings and alerts. This action cannot be undone.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button type="button" onClick={() => onOpenChange(false)} disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {loading ? 'Deleting...' : 'Delete Sensor'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
