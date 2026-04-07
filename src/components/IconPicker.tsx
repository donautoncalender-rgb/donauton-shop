'use client';

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

// Selected set of icons relevant to the shop
const CURATED_ICONS = [
  'Music', 'Disc', 'Book', 'Shirt', 'Ticket', 'Truck', 'CreditCard', 
  'ShieldCheck', 'RotateCcw', 'Download', 'Zap', 'Users', 'Heart', 
  'CheckCircle2', 'Banknote', 'Euro', 'Mail', 'Gift', 'Star',
  'FileText', 'Globe', 'Headphones', 'Info', 'Package', 'Pointer', 
  'Search', 'Settings', 'Share2', 'ShoppingBag', 'Smile', 'ThumbsUp', 
  'Trophy', 'User', 'Video', 'Wallet', 'Clock'
];

interface IconPickerProps {
  currentIcon: string;
  onSelect: (iconName: string) => void;
}

export default function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '0.8rem 1rem', 
          border: '1.5px solid var(--border)', 
          borderRadius: '8px', 
          background: 'white', 
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left'
        }}
      >
        <span style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'var(--accent)' 
        }}>
           {renderLucideIcon(currentIcon, 24)}
        </span>
        <span style={{ fontWeight: 600 }}>{currentIcon || 'Wähle ein Icon...'}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}>⌄</span>
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          background: 'white', 
          border: '1px solid var(--border)', 
          borderRadius: '12px', 
          marginTop: '0.5rem', 
          padding: '1rem', 
          zIndex: 100, 
          boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.8rem',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {CURATED_ICONS.map((iconName) => (
            <button 
              key={iconName}
              type="button"
              onClick={() => { onSelect(iconName); setIsOpen(false); }}
              title={iconName}
              style={{ 
                padding: '10px', 
                border: '1px solid transparent', 
                borderRadius: '8px', 
                background: currentIcon === iconName ? 'var(--bg)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentIcon === iconName ? 'var(--accent)' : 'inherit'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              onMouseLeave={(e) => { if (currentIcon !== iconName) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
            >
               {renderLucideIcon(iconName, 20)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility to render an icon safely
function renderLucideIcon(name: string, size: number = 24) {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}
