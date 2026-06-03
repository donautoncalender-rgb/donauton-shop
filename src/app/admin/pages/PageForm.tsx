'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { updatePage } from './actions';
import RichTextEditor from '../../../components/RichTextEditor';

interface PageFormProps {
  pageKey: string;
  pageName: string;
  initialTitle: string;
  initialContent: string;
}

export default function PageForm({ pageKey, pageName, initialTitle, initialContent }: PageFormProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updatePage(formData);
      toast.success(`${pageName} erfolgreich aktualisiert!`);
    } catch (err: any) {
      toast.error(err.message || 'Speichern fehlgeschlagen!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="key" value={pageKey} />
      
      <div className="admin-form-group">
        <label className="admin-label">Seitenüberschrift</label>
        <input 
          name="title" 
          type="text" 
          className="admin-input" 
          defaultValue={initialTitle || pageName} 
          required 
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-label">Inhalt</label>
        <RichTextEditor name="content" initialValue={initialContent} />
      </div>
      
      <button 
        type="submit" 
        className="admin-btn"
        disabled={isPending}
        style={{ opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
      >
        {isPending ? 'Wird gespeichert...' : 'Speichern & Veröffentlichen'}
      </button>
    </form>
  );
}
