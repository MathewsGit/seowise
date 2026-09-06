'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import styles from './Select.module.css';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ChevronDownIcon = () => (
  <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export function Select({ label, options, value, onChange, disabled = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setActiveIndex(options.findIndex(opt => opt.value === value));
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLUListElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          handleSelect(options[activeIndex].value);
        } else {
          toggleOpen();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(options.findIndex(opt => opt.value === value));
        } else {
          setActiveIndex((prev) => (prev + 1 < options.length ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
        }
        break;
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label} id="select-label">{label}</label>}
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? "select-label" : undefined}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <ul
          className={styles.listbox}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {options.map((opt, index) => (
            <li
              key={opt.value}
              className={`${styles.option} ${index === activeIndex ? styles.focused : ''}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => handleSelect(opt.value)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {opt.label}
              {opt.value === value && <CheckIcon />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}