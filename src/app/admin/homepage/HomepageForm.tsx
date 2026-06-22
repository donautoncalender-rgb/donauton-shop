'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { saveHomepageSettings } from './actions';
import IconPicker from '../../../components/IconPicker';
import ImagePicker from '../../../components/ImagePicker';
import SpinningNoteButton from '../../../components/SpinningNoteButton';

export default function HomepageForm({ settings }: { settings: Record<string, string> }) {
  const [isPending, setIsPending] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Manage state for the 4 selected icons
  const [uspIcons, setUspIcons] = useState<Record<number, string>>({
    1: settings['home_usp1_icon'] || 'CheckCircle2',
    2: settings['home_usp2_icon'] || 'RotateCcw',
    3: settings['home_usp3_icon'] || 'Truck',
    4: settings['home_usp4_icon'] || 'Download'
  });

  // 1. DYNAMIC HERO SLIDER STATE
  const [slides, setSlides] = useState<any[]>(() => {
    if (settings['hero_slides_data']) {
      try { return JSON.parse(settings['hero_slides_data']); } catch(e) {}
    }
    return [1, 2, 3].map(num => ({
      id: Date.now().toString() + num,
      image: settings[`home_slider_${num}_img`] || '',
      tagline: settings[`home_slider_${num}_tagline`] || (num === 1 ? 'DAS GANZE SORTIMENT' : num === 2 ? 'FACHLITERATUR' : 'NUR FÜR KURZE ZEIT'),
      title: settings[`home_slider_${num}_title`] || (num === 1 ? 'Die größte' : num === 2 ? 'Spannende' : 'Exklusiver'),
      subtitle: settings[`home_slider_${num}_subtitle`] || (num === 1 ? 'Notenauswahl' : num === 2 ? 'Unterrichtswerke' : 'Merchandise'),
      text: settings[`home_slider_${num}_text`] || (num === 1 ? 'Tausende Werke für Blasorchester warten.' : num === 2 ? 'Stöbere jetzt in unserer riesigen Auswahl an Musikliteratur.' : 'Zeige Flagge mit den brandneuen Donauton Accessoires.'),
      link: settings[`home_slider_${num}_link`] || (num === 1 ? '/noten' : num === 2 ? '/buecher' : '/merch'),
      btnText: settings[`home_slider_${num}_btn`] || (num === 1 ? 'Zu den Noten' : num === 2 ? 'Zum Buch-Katalog' : 'Kollektion ansehen'),
      isPromotion: false,
      validFrom: '',
      validUntil: ''
    }));
  });

  const handleAddSlide = () => {
    setSlides([...slides, {
      id: Date.now().toString(),
      image: '', tagline: 'NEUES HIGHLIGHT', title: 'Neuer', subtitle: 'Titel', text: 'Kurze Beschreibung...', link: '/noten', btnText: 'Jetzt ansehen',
      isPromotion: false, validFrom: '', validUntil: ''
    }]);
    setActiveSlide(slides.length); // switch to the new slide
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    if (slides.length <= 1) {
      toast.error('Es muss mindestens ein Slide übrig bleiben!');
      return;
    }
    setSlides(slides.filter((_, i) => i !== indexToRemove));
    setActiveSlide(0);
  };

  const handleSlideChange = (index: number, field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

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
      
      {/* 1. HERO SLIDER (DYNAMIC) */}
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
            Der Große Hero-Slider (Oben)
          </div>
          <button type="button" onClick={handleAddSlide} className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>+ Neuen Slide hinzufügen</button>
        </h3>
        
        {/* Helper to tell backend how many slides there are */}
        <input type="hidden" name="slide_count" value={slides.length} />

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '8px', width: '100%', overflowX: 'auto' }}>
          {slides.map((slide, index) => (
            <button 
              key={slide.id} 
              type="button" 
              onClick={() => setActiveSlide(index)}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', background: activeSlide === index ? 'white' : 'transparent', fontWeight: 700, cursor: 'pointer', boxShadow: activeSlide === index ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            >
              Slide {index + 1} {slide.isPromotion ? '🎟️' : ''}
            </button>
          ))}
        </div>

        {slides.map((slide, index) => (
          <div key={slide.id} style={{ display: activeSlide === index ? 'block' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
               <button type="button" onClick={() => handleRemoveSlide(index)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>🗑 Slide löschen</button>
            </div>

            {/* Promotion Toggle */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" name={`slide_${index}_isPromotion`} checked={slide.isPromotion} onChange={(e) => handleSlideChange(index, 'isPromotion', e.target.checked)} style={{ width: '18px', height: '18px' }} />
                Aktionsslider (Zeitgesteuert)
              </label>
              <p style={{ margin: '0.5rem 0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>Wenn aktiv, wird der Slider nur in dem unten angegebenen Zeitraum auf der Startseite angezeigt.</p>
              
              {slide.isPromotion && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Gültig von</label>
                    <input type="date" name={`slide_${index}_validFrom`} value={slide.validFrom} onChange={(e) => handleSlideChange(index, 'validFrom', e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Gültig bis</label>
                    <input type="date" name={`slide_${index}_validUntil`} value={slide.validUntil} onChange={(e) => handleSlideChange(index, 'validUntil', e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Hintergrundbild Slide {index + 1}</label>
              <ImagePicker 
                currentUrl={slide.image || ''} 
                name={`slide_${index}_img`} 
              />
              {/* Fallback hidden input to preserve existing image if picker doesn't change it */}
              <input type="hidden" name={`slide_${index}_image_existing`} value={slide.image || ''} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Schlagwort (Tagline)</label>
                <input type="text" name={`slide_${index}_tagline`} value={slide.tagline} onChange={(e) => handleSlideChange(index, 'tagline', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Haupt-Titel</label>
                <input type="text" name={`slide_${index}_title`} value={slide.title} onChange={(e) => handleSlideChange(index, 'title', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Unter-Titel (Heller)</label>
                <input type="text" name={`slide_${index}_subtitle`} value={slide.subtitle} onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Beschreibungstext</label>
                <input type="text" name={`slide_${index}_text`} value={slide.text} onChange={(e) => handleSlideChange(index, 'text', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Button Text</label>
                <input type="text" name={`slide_${index}_btnText`} value={slide.btnText} onChange={(e) => handleSlideChange(index, 'btnText', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Button Ziel-Link</label>
                <input type="text" name={`slide_${index}_link`} value={slide.link} onChange={(e) => handleSlideChange(index, 'link', e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '6px' }} />
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
               'Sichere Bezahlung',
               'Blitzversand',
               'Noten sofort digital'
             ];
             const defaultTexts = [
               'Hunderte Stücke direkt digital verfügbar oder auf dem reinen Postweg direkt aufs Pult geliefert.',
               'Bezahlen Sie sicher und bequem per PayPal, Kreditkarte oder Apple Pay. Käuferschutz inklusive.',
               'Wir verpacken (fast) täglich. Viele Druckausgaben und Noten sind bereits in 48 oder 72 Stunden im Briefkasten.',
               'Unsere Produkte gibt es bei uns alle zum Sofort-Download! Kundenkonto erstellen und los gehts!'
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
