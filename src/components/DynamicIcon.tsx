'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  icon: string;
  size?: number;
  className?: string;
  fallbackSvg?: string;
}

export default function DynamicIcon({ icon, size = 24, className, fallbackSvg }: DynamicIconProps) {
  // Check if it's a Lucide icon name
  const IconComponent = (LucideIcons as any)[icon];
  
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // If not a Lucide icon, check if it's SVG code or a generic string
  if (icon && (icon.startsWith('<svg') || icon.includes('<path'))) {
    return (
      <div 
        className={className} 
        style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        dangerouslySetInnerHTML={{ __html: icon }} 
      />
    );
  }

  // Fallback to a provided SVG or a default music icon
  if (fallbackSvg) {
    return (
      <div 
        className={className} 
        style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        dangerouslySetInnerHTML={{ __html: fallbackSvg }} 
      />
    );
  }

  return <LucideIcons.Music size={size} className={className} />;
}
