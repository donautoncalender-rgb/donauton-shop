'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { saveHomepageSettings } from './actions';
import IconPicker from '../../../components/IconPicker';
import ImagePicker from '../../../components/ImagePicker';
import SpinningNoteButton from '../../../components/SpinningNoteButton';

export default function HomepageForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, setIsPending] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);
  
  // Manage state for the 4 selected icons
  const [uspIcons, setUspIcons] = useState<Record<number, string>>({
    1: settings['home_usp1_icon'] || 'CheckCircle2',
    2: settings['home_usp2_icon'] || 'RotateCcw',
    3: settings['home_usp3_icon'] || 'Truck',
    4: settings['home_usp4_icon'] || 'Download'
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveHomepageSettings(formData);
      toast.success('Startseite erfolgreich aktualisiert!');
    } catch (err: any) {
      toast.error(err.message || 'Speichern fehlgeschlagen!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
      {/* 1. HERO SLIDER (3 SLIDES) */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
          Der Große Hero-Slider (Oben)
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '8px', width: 'fit-content' }}>
          {[1, 2, 3].map(num => (
            <button 
              key={num} 
              type="button" 
              onClick={() => setActiveSlide(num)}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', background: activeSlide === num ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer', boxShadow: activeSlide === num ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
            >
              Slide {num}
            </button>
          ))}
        </div>

        {[1, 2, 3].map(num => (
          <div key={num} style={{ display: activeSlide === num ? 'block' : 'none' }}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Hintergrundbild Slide {num}</label>
              <ImagePicker 
                currentUrl={settings[`home_slider_${num}_img`] || ''} 
                name={`home_slider_${num}_img`} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Schlagwort (Tagline)</label>
                <input type="text" name={`home_slider_${num}_tagline`} defaultValue={settings[`home_slider_${num}_tagline`] || (num === 1 ? 'DAS GANZE SORTIMENT' : num === 2 ? 'FACHLITERATUR' : 'NUR FÜR KURZE ZEIT')} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Haupt-Titel</label>
                <input type="text" name={`home_slider_${num}_title`} defaultValue={settings[`home_slider_${num}_title`] || (num === 1 ? 'Die größte' : num === 2 ? 'Spannende' : 'Exklusiver')} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Unter-Titel (Heller)</label>
                <input type="text" name={`home_slider_${num}_subtitle`} defaultValue={settings[`home_slider_${num}_subtitle`] || (num === 1 ? 'Notenauswahl' : num === 2 ? 'Unterrichtswerke' : 'Merchandise')} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Beschreibungstext</label>
                <input type="text" name={`home_slider_${num}_text`} defaultValue={settings[`home_slider_${num}_text`] || (num === 1 ? 'Tausende Werke für Blasorchester warten.' : num === 2 ? 'Stöbere jetzt in unserer riesigen Auswahl an Musikliteratur.' : 'Zeige Flagge mit den brandneuen Donauton Accessoires.')} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Button Text</label>
                <input type="text" name={`home_slider_${num}_btn`} defaultValue={settings[`home_slider_${num}_btn`] || (num === 1 ? 'Zu den Noten' : num === 2 ? 'Zum Buch-Katalog' : 'Kollektion ansehen')} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Button Ziel-Link</label>
                <input type="text" name={`home_slider_${num}_link`} defaultValue={settings[`home_slider_${num}_link`] || (num === 1 ? '/noten' : num === 2 ? '/buecher' : '/merch')} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. TRUST-MARQUEE */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
          Verlags-Laufband (Marquee)
        </h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Trage hier die Verlage getrennt mit einem Komma ein. Sie werden endlos unter dem Header durchlaufen.</p>
        
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Laufband Einträge</label>
          <textarea 
            name="home_marquee_text" 
            defaultValue={settings['home_marquee_text'] || 'Lukas Bruckmeyer Publikationen, Alpen-Sound Verlag, Klarus Musikverlag, Original Egerländer Musikverlag, Donauton Exklusiv'} 
            style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', minHeight: '80px', fontFamily: 'inherit' }}
            placeholder="Wert 1, Wert 2, Wert 3..."
          />
        </div>
      </div>

      {/* 3. FEATURED RELEASE (HIGHLIGHT DES MONATS) */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
          Mega-Modul (Highlight des Monats)
        </h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Bis wir die echten Artikel aus der Datenbank haben, kannst du hier das Cover und den Text manuell eintragen!</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Artikel-Cover Bild</label>
          {settings['home_featured_img'] && (
            <img src={settings['home_featured_img']} alt="Featured Cover" style={{ height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="file" name="home_featured_img_file" accept="image/*" style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
            <input type="text" name="home_featured_img_url" placeholder="Oder externe Bild-URL" defaultValue={settings['home_featured_img'] || ''} style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Kleines Schlagwort (Rot)</label>
            <input type="text" name="home_featured_tagline" defaultValue={settings['home_featured_tagline'] || 'Highlight des Monats'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Haupt-Titel (HTML erlaubt z.B. &lt;br/&gt;)</label>
            <input type="text" name="home_featured_title" defaultValue={settings['home_featured_title'] || 'Die neue<br/>Brauhauspolka'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Beschreibungstext</label>
            <textarea name="home_featured_text" defaultValue={settings['home_featured_text'] || 'Ein Muss für jedes Blasorchester! Erlebe den puren, unverfälschten Sound der böhmischen Blasmusik neu interpretiert. Jetzt als erstklassiger Partitur-Satz sowie kompletter Stimmenausgabe direkt digital aufs Pult.'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px', minHeight: '80px', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Button Text</label>
            <input type="text" name="home_featured_btn_text" defaultValue={settings['home_featured_btn_text'] || 'Satz für 38,00 € Kaufen'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Button Ziel-Link</label>
            <input type="text" name="home_featured_btn_link" defaultValue={settings['home_featured_btn_link'] || '/noten/brauhauspolka'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>
        </div>
      </div>

      {/* 4. USPs (Icons, Titel, Text) */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>4</span>
          USP Icons (Roter Banner)
        </h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Die vier Verkaufsargumente mit den kreisrunden Icons.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {[1, 2, 3, 4].map((uspNum) => {
             const defaultTitles = [
               'Europas größte Noten-Auswahl',
               '30 Tage Money-Back',
               'Blitzversand',
               'Noten sofort digital'
             ];
             const defaultTexts = [
               'Hunderte Stücke direkt digital verfügbar oder auf dem reinen Postweg direkt aufs Pult geliefert.',
               'Passt der Sound doch nicht zur Kapelle? Geld zurück. Ganz ohne große Fragen.',
               'Wir verpacken täglich. Viele Audio-Drucke und Noten sind bereits in 48 Stunden im Briefkasten.',
               'Erstelle dir sofort einen Account und greife ohne Umwege auf digitale Partituren zu.'
             ];
             const defaultIcons = [
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>',
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
             ];

             return (
               <div key={uspNum} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
                 <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>USP {uspNum}</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Titel</label>
                     <input type="text" name={`home_usp${uspNum}_title`} defaultValue={settings[`home_usp${uspNum}_title`] || defaultTitles[uspNum-1]} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Text</label>
                     <textarea name={`home_usp${uspNum}_text`} defaultValue={settings[`home_usp${uspNum}_text`] || defaultTexts[uspNum-1]} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', minHeight: '60px', fontFamily: 'inherit' }} />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.85rem' }}>Icon</label>
                     <IconPicker 
                       currentIcon={uspIcons[uspNum]} 
                       onSelect={(name) => setUspIcons({ ...uspIcons, [uspNum]: name })} 
                     />
                     <input type="hidden" name={`home_usp${uspNum}_icon`} value={uspIcons[uspNum]} />
                   </div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* 5. VIP NEWSLETTER */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>5</span>
          VIP Newsletter (Über dem Footer)
        </h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Der Call-to-Action Bereich für die Eintragung in den Verteiler.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Newsletter Überschrift</label>
            <input type="text" name="home_newsletter_title" defaultValue={settings['home_newsletter_title'] || 'Werde Teil der Donauton-Familie'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Newsletter Zusatz-Text</label>
            <textarea name="home_newsletter_text" defaultValue={settings['home_newsletter_text'] || 'Trag dich jetzt für unseren Exklusiv-Verteiler ein und erhalte sofort 10% Willkommens-Rabatt sowie kostenlose Probe-Partituren für dein Orchester.'} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px', minHeight: '80px', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* 5. CATEGORY TILES SECTION */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>5</span>
          Die 5 Kategorie-Ringe
        </h3>
        
        {[
          { id: 1, name: 'Noten' },
          { id: 2, name: 'Audio & CDs' },
          { id: 3, name: 'Bücher' },
          { id: 4, name: 'Merchandise' },
          { id: 5, name: 'Tickets' }
        ].map(cat => {
          const key = `home_cat${cat.id}_img`;
          return (
            <div key={cat.id} style={{ display: 'flex', gap: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '1rem', background: 'var(--bg)' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.8rem' }}>{cat.id}. {cat.name}</label>
                {settings[key] ? (
                  <img src={settings[key]} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Kein Bild</div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                <input type="file" name={`${key}_file`} accept="image/*" style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'white' }} />
                <input type="text" name={`${key}_url`} placeholder="Oder Bild-URL" defaultValue={settings[key] || ''} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
        {isPending ? (
          <SpinningNoteButton size="large" />
        ) : (
          <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(205,23,25,0.4)', borderRadius: '50px' }}>
            Startseite speichern
          </button>
        )}
      </div>
    </form>
  );
}
