import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface SearchableDropdownProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Type to search...',
  disabled = false,
  required = false,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options.slice(0, 100);
    const q = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 100);
  }, [search, options]);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filtered.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch(value);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const scrollToIndex = useCallback((idx: number) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[idx]) {
      (items[idx] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filtered.length - 1 ? prev + 1 : 0;
          scrollToIndex(next);
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filtered.length - 1;
          scrollToIndex(next);
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          selectOption(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch(value);
        inputRef.current?.blur();
        break;
    }
  };

  const selectOption = (opt: string) => {
    onChange(opt);
    setSearch(opt);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value !== value) onChange('');
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2.5 bg-slate-700/50 border rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors ${
            error
              ? 'border-red-500/50'
              : isOpen && search && !value
              ? 'border-cyan-500/50'
              : 'border-slate-600/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSearch('');
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {isOpen && !disabled && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-slate-800 border border-slate-600/50 shadow-xl"
        >
          {filtered.map((opt, idx) => (
            <button
              key={opt}
              type="button"
              onClick={() => selectOption(opt)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${
                idx === highlightedIndex
                  ? 'bg-cyan-600/30 text-white'
                  : opt === value
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {isOpen && !disabled && search && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-slate-800 border border-slate-600/50 shadow-xl p-3 text-sm text-slate-400">
          No results found
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};
