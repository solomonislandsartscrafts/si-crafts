'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Shared custom Select dropdown component.
 *
 * Renders a button trigger + a dropdown panel positioned directly below.
 * Follows WAI-ARIA Listbox pattern for accessibility:
 *  - role="listbox" on the dropdown
 *  - role="option" on each item
 *  - aria-expanded on the trigger
 *  - Keyboard: Enter/Space to open, Escape to close, ArrowUp/Down to navigate
 *  - Closes on outside click
 *
 * Use this instead of native <select> for consistent visual styling across
 * browsers and devices.
 */

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  /** Current selected value (empty string or null = placeholder shown) */
  value: string | null;
  /** Called when user picks an option */
  onChange: (value: string | null) => void;
  /** The available options */
  options: SelectOption[];
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Accessible label for the select */
  label: string;
  /** HTML id for the component */
  id?: string;
  /** Additional class names on the wrapper */
  className?: string;
  /**
   * Fill the container width at every breakpoint instead of shrinking to the
   * label's width from `sm` up. For a select in a narrow rail, where it has to
   * line up with a full-width search box beside it — the same reason
   * `SearchInput` carries this prop. Passing `w-full` via `className` cannot do
   * this: `sm:w-auto` is emitted after the base utilities, so it wins.
   */
  fullWidth?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  id,
  className = '',
  fullWidth = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // All items including the "all" placeholder as first option
  const allOptions: SelectOption[] = [
    { value: '', label: placeholder },
    ...options,
  ];

  const selectedOption = allOptions.find((o) => o.value === (value ?? ''));
  const displayLabel = selectedOption?.label || placeholder;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const focused = list.children[focusedIndex] as HTMLElement | undefined;
    focused?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex, open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        // When opening, focus the currently selected item
        const idx = allOptions.findIndex((o) => o.value === (value ?? ''));
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }, [value, allOptions]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue || null);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, allOptions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < allOptions.length) {
            handleSelect(allOptions[focusedIndex].value);
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(allOptions.length - 1);
          break;
      }
    },
    [open, focusedIndex, allOptions, handleToggle, handleSelect]
  );

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()} id={id}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        aria-controls={id ? `${id}-listbox` : undefined}
        // Point assistive tech at the currently highlighted option so arrowing
        // through the list is announced, not just visually highlighted. Only
        // set while open and pointing at a real option.
        aria-activedescendant={
          open && id && focusedIndex >= 0 ? `${id}-opt-${focusedIndex}` : undefined
        }
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`h-11 ${
          fullWidth ? 'w-full' : 'w-full sm:w-auto'
        } inline-flex items-center justify-between gap-2xs px-sm rounded-md border bg-white text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
          open
            ? 'border-ocean ring-1 ring-ocean'
            : 'border-sand-dark text-warm-gray-800 hover:border-ocean/50'
        }`}
      >
        <span className={value ? 'text-warm-gray-800' : 'text-warm-gray-400'}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-warm-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel — positioned directly below the trigger */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          id={id ? `${id}-listbox` : undefined}
          aria-label={label}
          className="absolute left-0 top-full mt-3xs z-50 w-full min-w-[180px] max-h-60 overflow-y-auto rounded-md border border-sand-dark bg-white shadow-lg py-3xs"
          onKeyDown={handleKeyDown}
        >
          {allOptions.map((opt, index) => {
            const isSelected = opt.value === (value ?? '');
            const isFocused = index === focusedIndex;

            return (
              <li
                key={opt.value}
                id={id ? `${id}-opt-${index}` : undefined}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`flex items-center gap-2xs px-xs py-2xs text-base cursor-pointer transition-colors ${
                  isFocused ? 'bg-ocean/5 text-deep-blue' : 'text-warm-gray-800'
                } ${isSelected ? 'font-medium' : ''}`}
              >
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  {isSelected && <Check className="w-3.5 h-3.5 text-ocean" aria-hidden="true" />}
                </span>
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
