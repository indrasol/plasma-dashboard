import { useState, useRef, useEffect } from 'react';

interface ModernDropdownProps {
  label: string;
  icon: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}

export default function ModernDropdown({ 
  label, 
  icon, 
  value, 
  options, 
  placeholder, 
  onChange 
}: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayValue = value || placeholder;

  return (
    <div className="modern-filter-group" ref={dropdownRef}>
      <label className="modern-filter-label">
        <span className="filter-icon">{icon}</span>
        {label}
      </label>
      
      <div className={`custom-dropdown ${isOpen ? 'open' : ''}`}>
        <div 
          className="dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`dropdown-value ${!value ? 'placeholder' : ''}`}>
            {displayValue}
          </span>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path 
                d="M1 1.5L6 6.5L11 1.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-search">
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
            
            <div className="dropdown-options">
              <div 
                className={`dropdown-option ${!value ? 'selected' : ''}`}
                onClick={() => handleSelect('')}
              >
                <span className="option-text">{placeholder}</span>
                {!value && <span className="check-icon">✓</span>}
              </div>
              
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`dropdown-option ${value === option ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  <span className="option-text">{option}</span>
                  {value === option && <span className="check-icon">✓</span>}
                </div>
              ))}
              
              {filteredOptions.length === 0 && searchTerm && (
                <div className="no-results">
                  <span className="no-results-icon">🔍</span>
                  <span>No results found</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
