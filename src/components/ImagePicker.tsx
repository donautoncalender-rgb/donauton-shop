'use client';

import React, { useState } from 'react';

const IMAGE_LIBRARY = [
  // NOTEN
  { id: '1507838153414-b4b713384a76', tags: 'noten sheet music partitur', cat: 'noten' },
  { id: '1465821185615-934fa820bc7c', tags: 'notenblätter paper music', cat: 'noten' },
  { id: '1510915361894-db8b60106cb1', tags: 'orchester orchestra concert', cat: 'noten' },
  { id: '1415201375777-a110a3c27633', tags: 'noten alt vintage paper', cat: 'noten' },
  { id: '1516062423053-74519fa71aa8', tags: 'noten schreiben pen write', cat: 'noten' },
  { id: '1593132332675-bc32205566f1', tags: 'noten druck print', cat: 'noten' },
  { id: '1566160173361-9c17c223c6d6', tags: 'dirigent conductor stick', cat: 'noten' },
  { id: '1585292211623-e4905a8b79b6', tags: 'noten detailliert macro', cat: 'noten' },
  
  // INSTRUMENTE
  { id: '1459749411177-042180ce673c', tags: 'trompete trumpet brass', cat: 'instrumente' },
  { id: '1511379938547-c1f69419868d', tags: 'klavier piano keyboard', cat: 'instrumente' },
  { id: '1514320291840-2e0a9bf2a9ae', tags: 'schlagzeug drums percussion', cat: 'instrumente' },
  { id: '1461784121038-f088ca1e7714', tags: 'gitarre guitar strings', cat: 'instrumente' },
  { id: '1520523839897-bd0b52f945a0', tags: 'cello geige violin', cat: 'instrumente' },
  { id: '1460039230329-eb0f8a4bf77d', tags: 'saxophon sax jazz', cat: 'instrumente' },
  { id: '1501612722927-d12c73f397be', tags: 'bass gitarre electric rock', cat: 'instrumente' },
  { id: '1484755560615-a4c64e778a6c', tags: 'harfe harp strings', cat: 'instrumente' },
  { id: '1451367301736-5d9c8270ee9c', tags: 'flöte flute woodwind', cat: 'instrumente' },
  { id: '1481132821613-30d57f275d04', tags: 'gitarre akustisch acoustic wood', cat: 'instrumente' },
  { id: '1526218626217-0b192b62b7b2', tags: 'klavier flügel grand piano', cat: 'instrumente' },
  
  // BÜCHER
  { id: '1453733190371-0a9bedd82893', tags: 'bücher bücherregal library read', cat: 'buecher' },
  { id: '1458560871784-56d23406c091', tags: 'bücher offen book open', cat: 'buecher' },
  { id: '1452830978618-d6feae7d0ffa', tags: 'lesen reading book', cat: 'buecher' },
  { id: '1552321554-10405AD7B107', tags: 'bücher stapel stack books', cat: 'buecher' },
  { id: '1491849762741-1914af5a4437', tags: 'book story telling antique', cat: 'buecher' },
  
  // MERCH & ATMOSPHERE
  { id: '1511671782779-c97d3d27a1d4', tags: 'mikrofon mic singen vocal', cat: 'merch' },
  { id: '1470225620780-dba8ba36b745', tags: 'studio recording schallschutz', cat: 'merch' },
  { id: '1525926477800-7a3b10a163a8', tags: 'mischpult mixer audio', cat: 'merch' },
  { id: '1468164016595-6108e4c60c8b', tags: 'merchandise kleidung merch', cat: 'merch' },
  { id: '1521433367824-3f8140ae6f9d', tags: 'konzert ticket eintritt pass', cat: 'merch' },
  { id: '1493225255756-d9584f8606e9', tags: 'equipment gear audio tech', cat: 'merch' },
  { id: '1512733594741-26705503bc1a', tags: 'merch shirt t-shirt', cat: 'merch' },
  { id: '1506157713291-0810d7a6be60', tags: 'merch tasse cup mug music', cat: 'merch' },
  { id: '1564184606994-0d32e987c14a', tags: 'konzert bühne blau blue light', cat: 'noten' },
  
  // CD & VINYL
  { id: '1513883049090-d0b7439799bf', tags: 'vinyl schallplatte record', cat: 'cds' },
  { id: '1446057032654-9d88220451af', tags: 'kopfhörer headphones listen', cat: 'cds' },
  { id: '1493225255756-d9584f8606e9', tags: 'audio sounds speaker cd', cat: 'cds' }
];

const getUnsplashUrl = (id: string, size = 800) => `https://images.unsplash.com/photo-${id}?w=${size}&q=80&auto=format&fit=crop`;

interface ImagePickerProps {
  currentUrl: string;
  name: string; 
}

export default function ImagePicker({ currentUrl, name }: ImagePickerProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentUrl);
  const [activeTab, setActiveTab ] = useState<'upload' | 'library'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('alle');

  const filteredImages = IMAGE_LIBRARY.filter(img => {
    const matchesSearch = img.tags.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'alle' || img.cat === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          type="button" 
          onClick={(e) => { e.preventDefault(); setActiveTab('upload'); }}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'upload' ? 'white' : 'transparent', color: activeTab === 'upload' ? '#cd1719' : '#64748b', fontWeight: activeTab === 'upload' ? 700 : 500, cursor: 'pointer', boxShadow: activeTab === 'upload' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
        >
          Hochladen
        </button>
        <button 
          type="button" 
          onClick={(e) => { e.preventDefault(); setActiveTab('library'); }}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: activeTab === 'library' ? 'white' : 'transparent', color: activeTab === 'library' ? '#cd1719' : '#64748b', fontWeight: activeTab === 'library' ? 700 : 500, cursor: 'pointer', boxShadow: activeTab === 'library' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
        >
          Aus Bibliothek wählen
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Datei wählen</label>
            <input 
              type="file" 
              name={`${name}_file`} 
              accept="image/*" 
              style={{ width: '100%', fontSize: '0.85rem' }} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Oder URL</label>
            <input 
              type="text" 
              name={`${name}_url`} 
              defaultValue={selectedUrl}
              placeholder="https://..."
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem' }} 
              onChange={(e) => setSelectedUrl(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div>
          {/* SEARCH & FILTERS */}
          <div style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Suche nach Motiven (z.B. Klavier, Noten, Merch...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '0.8rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['alle', 'noten', 'instrumente', 'buecher', 'merch', 'cds'].map(cat => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{ 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    border: '1px solid #e2e8f0', 
                    background: activeCategory === cat ? '#cd1719' : 'white', 
                    color: activeCategory === cat ? 'white' : '#64748b',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat === 'buecher' ? 'Bücher' : cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            maxHeight: '400px', 
            overflowY: 'auto', 
            padding: '12px',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            {filteredImages.map((img) => (
               <div 
                 key={img.id} 
                 onClick={() => setSelectedUrl(getUnsplashUrl(img.id))}
                 style={{ 
                   width: '120px',
                   height: '120px',
                   borderRadius: '8px', 
                   overflow: 'hidden', 
                   cursor: 'pointer', 
                   position: 'relative',
                   border: selectedUrl === getUnsplashUrl(img.id) ? '4px solid #cd1719' : '1px solid #e2e8f0',
                   boxShadow: selectedUrl === getUnsplashUrl(img.id) ? '0 4px 12px rgba(205,23,25,0.2)' : 'none',
                   transition: 'all 0.2s ease',
                   flexShrink: 0
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
               >
                 <img 
                   src={getUnsplashUrl(img.id)} 
                   alt="" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   onError={(e) => {
                     // If it fails, hide the image and show a colored placeholder with the first letter of the category
                     e.currentTarget.style.display = 'none';
                     const parent = e.currentTarget.parentElement;
                     if (parent) {
                       parent.style.background = 'linear-gradient(45deg, #f1f5f9, #e2e8f0)';
                       parent.innerHTML += `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-weight:bold; color:#94a3b8; font-size:1.2rem; text-transform:uppercase;">${img.cat[0]}</div>`;
                     }
                   }}
                 />
                 {selectedUrl === getUnsplashUrl(img.id) && (
                   <div style={{ 
                     position: 'absolute', 
                     top: '6px', 
                     right: '6px', 
                     backgroundColor: '#cd1719', 
                     color: 'white', 
                     borderRadius: '50%', 
                     width: '22px', 
                     height: '22px', 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center', 
                     fontSize: '0.8rem',
                     boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                   }}>✓</div>
                 )}
               </div>
            ))}
            {filteredImages.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', width: '100%', color: '#94a3b8' }}>
                Keine passenden Bilder in dieser Kategorie gefunden.
              </div>
            )}
            <input type="hidden" name={`${name}_url`} value={selectedUrl} />
          </div>
        </div>
      )}

      {selectedUrl && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Ausgewähltes Bild:</label>
          <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img src={selectedUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      )}
    </div>
  );
}
