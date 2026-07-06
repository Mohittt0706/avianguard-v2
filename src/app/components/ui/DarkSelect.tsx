import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DarkSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DarkSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (DarkSelectOption | string)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DarkSelect({ value, onChange, options, placeholder, className = '', disabled }: DarkSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const normalizedOptions: DarkSelectOption[] = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const selected = normalizedOptions.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-emerald-500/40"
      >
        <span className={selected ? 'text-white truncate' : 'text-gray-600 truncate'}>
          {selected ? selected.label : placeholder || 'Select...'}
        </span>
        <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#111318] border border-white/[0.1] rounded-lg max-h-48 overflow-y-auto shadow-2xl shadow-black/40">
          {normalizedOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                value === opt.value
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : opt.disabled
                    ? 'text-gray-700 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check size={13} className="text-emerald-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
