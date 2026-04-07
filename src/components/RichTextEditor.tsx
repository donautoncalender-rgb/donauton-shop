'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// @ts-ignore
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <p>Lade Editor...</p>
});

export default function RichTextEditor({ 
  initialValue, 
  name 
}: { 
  initialValue: string, 
  name: string 
}) {
  const [value, setValue] = useState(initialValue);

  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  useEffect(() => {
    // Add tooltips to the quill toolbar via DOM manipulation
    setTimeout(() => {
      const titles: Record<string, string> = {
        '.ql-bold': 'Fett (Ctrl+B)',
        '.ql-italic': 'Kursiv (Ctrl+I)',
        '.ql-underline': 'Unterstrichen (Ctrl+U)',
        '.ql-strike': 'Durchgestrichen',
        '.ql-header': 'Überschrift',
        '.ql-list[value="ordered"]': 'Nummerierte Liste',
        '.ql-list[value="bullet"]': 'Aufzählungsliste',
        '.ql-link': 'Link einfügen',
        '.ql-clean': 'Formatierung entfernen',
        '.ql-align[value=""]': 'Linksbündig',
        '.ql-align[value="center"]': 'Zentriert',
        '.ql-align[value="right"]': 'Rechtsbündig',
        '.ql-align[value="justify"]': 'Blocksatz'
      };
      
      Object.keys(titles).forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          (el as HTMLElement).title = titles[selector];
        });
      });
    }, 500);
  }, []);

  return (
    <div style={{ backgroundColor: 'white', color: 'black' }}>
      <input type="hidden" name={name} value={value} />
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={setValue} 
        modules={modules}
      />
    </div>
  );
}
