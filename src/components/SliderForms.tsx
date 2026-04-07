'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createSlider, updateSlider, deleteSlider } from '../app/admin/sliders/actions';

import SpinningNoteButton from './SpinningNoteButton';

export function CreateSliderForm() {
  const [pending, setPending] = useState(false);

  const handleCreate = async (formData: FormData) => {
    setPending(true);
    try {
      await createSlider(formData);
      toast.success('Neuer Slider angelegt!', { icon: '✨' });
    } catch {
      toast.error('Fehler beim Anlegen');
    }
    setPending(false);
  };

  return (
    <form>
      <SpinningNoteButton pending={pending} actionFn={handleCreate} className="admin-btn" style={{ background: '#222' }}>
        + Neuer Slider
      </SpinningNoteButton>
    </form>
  );
}

export function SliderEditForm({ slider }: { slider: any }) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    setSaving(true);
    try {
      await updateSlider(formData);
      toast.success('Erfolgreich gespeichert!', { icon: '🎵' });
    } catch {
      toast.error('Fehler beim Speichern.');
    }
    setSaving(false);
  };

  const handleDelete = async (formData: FormData) => {
    setDeleting(true);
    try {
      await deleteSlider(formData);
      toast.success('Slider entfernt!');
    } catch {
      toast.error('Fehler beim Löschen.');
    }
    setDeleting(false);
  };

  return (
    <div className="admin-card" style={{ padding: '2rem', borderLeft: slider.isVisible ? '4px solid var(--accent)' : '4px solid #ccc' }}>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <input type="hidden" name="id" value={slider.id} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 200px', gap: '1rem' }}>
          <div className="admin-form-group">
            <label className="admin-label">Überschrift</label>
            <input type="text" name="title" className="admin-input" defaultValue={slider.title} required style={{ fontSize: '1.1rem', fontWeight: 'bold' }} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Reihenfolge (Sortierung)</label>
            <input type="number" name="sortOrder" className="admin-input" defaultValue={slider.sortOrder} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <div className="admin-form-group">
            <label className="admin-label">Pfeil-Link (Zeige Alle Verlinkung)</label>
            <input type="text" name="linkUrl" className="admin-input" defaultValue={slider.linkUrl || ''} placeholder="z.B. /noten?sort=new" />
          </div>
          <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', padding: '1rem 0', gap: '0.8rem' }}>
            <input type="checkbox" name="isVisible" defaultChecked={slider.isVisible} id={`v-${slider.id}`} style={{ width: '20px', height: '20px' }} />
            <label htmlFor={`v-${slider.id}`} style={{ fontWeight: 600, cursor: 'pointer' }}>Slider ist aktiv & sichtbar</label>
          </div>
        </div>

        <div style={{ background: '#f8f8f8', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
           <h4 style={{ marginBottom: '1rem', marginTop: 0 }}>Befüllungs-Logik (Data Source)</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div className="admin-form-group">
                <label className="admin-label">Was soll angezeigt werden?</label>
                <select name="filterType" className="admin-input" defaultValue={slider.filterType}>
                  <option value="LATEST">Automatisch: Letzte Neuerscheinungen</option>
                  <option value="BESTSELLER">Automatisch: Meistverkauft</option>
                  <option value="CATEGORY">Nach Kategorie / Verlag / Komponist</option>
                  <option value="MANUAL">Manuelle Artikelliste (IDs)</option>
                </select>
             </div>
             <div className="admin-form-group">
                <label className="admin-label">Wert (z.B. Kategorie-Name oder IDs)</label>
                <input type="text" name="filterValue" className="admin-input" defaultValue={slider.filterValue || ''} placeholder="alpen-sound, oder 1,4,15" />
             </div>
           </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          <SpinningNoteButton pending={deleting} actionFn={handleDelete} className="admin-btn" style={{ background: 'transparent', border: '1px solid #ccc', color: '#666' }}>Löschen</SpinningNoteButton>
          <SpinningNoteButton pending={saving} actionFn={handleUpdate} className="admin-btn" style={{ padding: '0.8rem 2rem' }}>Einstellungen Speichern</SpinningNoteButton>
        </div>
      </form>
    </div>
  );
}
