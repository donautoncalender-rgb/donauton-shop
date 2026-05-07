'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from './ProductCard';

export default function NotenfinderClient({ 
  categories, 
  initialProducts,
  title,
  description
}: { 
  categories: any[], 
  initialProducts: any[],
  title?: string,
  description?: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBesetzungen, setSelectedBesetzungen] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedSoloinstruments, setSelectedSoloinstruments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    // 1. Check for explicit TOP-LEVEL Reset Signal
    if (searchParams.get('reset') === 'true') {
      setSearchQuery('');
      setSelectedBesetzungen([]);
      setSelectedGenres([]);
      setSelectedGrades([]);
      setSelectedPublishers([]);
      setSelectedSoloinstruments([]);
      
      // Clean up the URL silently without triggering a Next.js router transition race condition
      window.history.replaceState(null, '', '/noten');
      return; 
    }

    const bParams = searchParams.getAll('besetzung');
    const gParams = searchParams.getAll('genre');
    const qParam = searchParams.get('q') || '';
    
    // 2. Strict Synchronization with URL Parameters

    setSearchQuery(qParam);

    if (bParams.length > 0) {
      setSelectedBesetzungen(bParams);
    } else {
      const singleB = searchParams.get('besetzung');
      setSelectedBesetzungen(singleB ? [singleB] : []);
    }
    
    if (gParams.length > 0) {
      setSelectedGenres(gParams);
    } else {
      const singleG = searchParams.get('genre');
      setSelectedGenres(singleG ? [singleG] : []);
    }
    
    const sParams = searchParams.getAll('soloinstrument');
    if (sParams.length > 0) {
      setSelectedSoloinstruments(sParams);
    } else {
      const singleS = searchParams.get('soloinstrument');
      setSelectedSoloinstruments(singleS ? [singleS] : []);
    }
    
    // Note: Grades currently have no URL parameter equivalent in the taxonomy dropdown.
    // If a mega menu link is navigated to, it should reset the local grade filters to show all.
    if (bParams.length > 0 || gParams.length > 0 || searchParams.has('besetzung') || searchParams.has('genre')) {
      setSelectedGrades([]);
    }

  }, [searchParams]);

  const taxonomy = useMemo(() => {
    const taxonomyMap = new Map<string, { type: 'genre' | 'solist', items: Set<string> }>();
    initialProducts.forEach(p => {
      const main = p.besetzung || 'Sonstige Noten';
      if (!taxonomyMap.has(main)) {
         taxonomyMap.set(main, { type: p.soloinstrument ? 'solist' : 'genre', items: new Set() });
      }
      if (p.soloinstrument) {
         taxonomyMap.get(main)!.items.add(p.soloinstrument);
         taxonomyMap.get(main)!.type = 'solist';
      } else if (p.genre && p.genre !== 'Ohne Genre') {
         taxonomyMap.get(main)!.items.add(p.genre);
      }
    });
    return Array.from(taxonomyMap.entries()).map(([b, data]) => ({
      besetzung: b,
      type: data.type,
      items: Array.from(data.items).sort()
    })).sort((a, b) => a.besetzung.localeCompare(b.besetzung));
  }, [initialProducts]);

  const availableBesetzungen = useMemo(() => {
    const list = new Set<string>();
    initialProducts.forEach(p => {
      if (p.besetzung && p.besetzung.trim() !== '') {
        list.add(p.besetzung.trim());
      }
    });
    return Array.from(list).sort();
  }, [initialProducts]);

  const availableSoloinstruments = useMemo(() => {
    const list = new Set<string>();
    initialProducts.forEach(p => {
      if (p.soloinstrument && p.soloinstrument.trim() !== '') {
        list.add(p.soloinstrument.trim());
      }
    });
    return Array.from(list).sort();
  }, [initialProducts]);

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    initialProducts.forEach(p => {
      if (p.genre && p.genre.trim() !== '' && p.genre !== 'Ohne Genre') {
        genres.add(p.genre.trim());
      }
    });
    return Array.from(genres).sort();
  }, [initialProducts]);

  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    initialProducts.forEach(p => {
      if (p.grade && p.grade.trim() !== '') {
        grades.add(p.grade.trim());
      }
    });
    return Array.from(grades).sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB || a.localeCompare(b);
    });
  }, [initialProducts]);

  const availablePublishers = useMemo(() => {
    const publishers = new Set<string>();
    initialProducts.forEach(p => {
      if (p.publisher && p.publisher.trim() !== '') {
        publishers.add(p.publisher.trim());
      }
    });
    return Array.from(publishers).sort();
  }, [initialProducts]);

  const toggleBesetzung = (b: string) => {
    setSelectedBesetzungen(prev => 
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  // Handle genre toggle
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  // Handle grade toggle
  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  // Handle publisher toggle
  const togglePublisher = (publisher: string) => {
    setSelectedPublishers(prev => 
      prev.includes(publisher) ? prev.filter(p => p !== publisher) : [...prev, publisher]
    );
  };

  const toggleSoloinstrument = (inst: string) => {
    setSelectedSoloinstruments(prev => 
      prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]
    );
  };

  const hasAnyFilter = selectedBesetzungen.length > 0 || selectedGenres.length > 0 || selectedGrades.length > 0 || selectedPublishers.length > 0 || selectedSoloinstruments.length > 0 || searchQuery !== '';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBesetzungen([]);
    setSelectedGenres([]);
    setSelectedGrades([]);
    setSelectedPublishers([]);
    setSelectedSoloinstruments([]);
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      // 1. Search filter
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.genre.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBesetzung = selectedBesetzungen.length === 0 ||
        selectedBesetzungen.includes(product.besetzung?.trim());
        
      const matchesSoloinstrument = selectedSoloinstruments.length === 0 ||
        (product.soloinstrument && selectedSoloinstruments.includes(product.soloinstrument.trim()));

      // 2. Genre filter (Exact mapping from Suite)
      const matchesGenre = selectedGenres.length === 0 || 
        selectedGenres.includes(product.genre.trim());

      // 3. Grade filter (Exact mapping from Suite)
      const matchesGrade = selectedGrades.length === 0 || 
        selectedGrades.includes(product.grade.trim());

      // 4. Publisher filter
      const matchesPublisher = selectedPublishers.length === 0 || 
        selectedPublishers.includes(product.publisher.trim());

      return matchesSearch && matchesBesetzung && matchesSoloinstrument && matchesGenre && matchesGrade && matchesPublisher;
    });
  }, [searchQuery, selectedBesetzungen, selectedGenres, selectedGrades, selectedPublishers, initialProducts]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Unified Sticky Header */}
      <div 
        className="animate-fade-in"
        style={{ 
          position: 'sticky', 
          top: '0', 
          zIndex: 40, 
          background: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(12px)',
          padding: '1rem 0',
          marginBottom: '2rem',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginLeft: '-max(1rem, calc((100vw - 1200px) / 2))', // Stretch to full window background visually if needed, but since it's in .container it's already bounded. Actually, .container page-container has padding.
          marginRight: '-max(1rem, calc((100vw - 1200px) / 2))',
          paddingLeft: 'max(1rem, calc((100vw - 1200px) / 2))',
          paddingRight: 'max(1rem, calc((100vw - 1200px) / 2))',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              {title && <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--primary)', letterSpacing: '-0.5px' }}>{title}</h1>}
              {description && <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', maxWidth: '600px', lineHeight: 1.4 }}>{description}</p>}
            </div>
            
            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
               <div className="search-box" style={{ width: '100%', maxWidth: '400px', margin: 0, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50px' }}>
                 <svg className="search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ left: '1.2rem', color: '#94a3b8' }}>
                   <circle cx="11" cy="11" r="8"></circle>
                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                 </svg>
                 <input 
                   type="text" 
                   className="search-input" 
                   placeholder="Nach Titel, Komponist oder Genre suchen..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   style={{ fontSize: '0.95rem', padding: '0.8rem 1.5rem 0.8rem 3rem', background: 'transparent', border: 'none' }}
                 />
               </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <style dangerouslySetInnerHTML={{__html: `
              .sleek-select {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 50px;
                padding: 0.6rem 2.5rem 0.6rem 1.2rem;
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text);
                cursor: pointer;
                transition: all 0.2s;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 1rem center;
                background-size: 14px;
              }
              .sleek-select:hover {
                border-color: #cbd5e1;
                background-color: white;
              }
              .sleek-select:focus {
                outline: none;
                border-color: var(--accent);
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
              }
              .sleek-select.active {
                background-color: #fef2f2;
                border-color: #fca5a5;
                color: var(--accent);
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
              }
            `}} />

            {availableBesetzungen.length > 0 && (
              <select 
                value={selectedBesetzungen[0] || ''}
                onChange={(e) => setSelectedBesetzungen(e.target.value ? [e.target.value] : [])}
                className={`sleek-select ${selectedBesetzungen.length > 0 ? 'active' : ''}`}
              >
                <option value="">Alle Besetzungen</option>
                {availableBesetzungen.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}

            {availableSoloinstruments.length > 0 && (
              <select 
                value={selectedSoloinstruments[0] || ''}
                onChange={(e) => setSelectedSoloinstruments(e.target.value ? [e.target.value] : [])}
                className={`sleek-select ${selectedSoloinstruments.length > 0 ? 'active' : ''}`}
              >
                <option value="">Alle Soloinstrumente</option>
                {availableSoloinstruments.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            )}

            {availableGenres.length > 0 && (
              <select 
                value={selectedGenres[0] || ''}
                onChange={(e) => setSelectedGenres(e.target.value ? [e.target.value] : [])}
                className={`sleek-select ${selectedGenres.length > 0 ? 'active' : ''}`}
              >
                <option value="">Alle Genres</option>
                {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}

            {availableGrades.length > 0 && (
              <select 
                value={selectedGrades[0] || ''}
                onChange={(e) => setSelectedGrades(e.target.value ? [e.target.value] : [])}
                className={`sleek-select ${selectedGrades.length > 0 ? 'active' : ''}`}
              >
                <option value="">Alle Stufen</option>
                {availableGrades.map(g => <option key={g} value={g}>Stufe {g}</option>)}
              </select>
            )}

            {availablePublishers.length > 0 && (
              <select 
                value={selectedPublishers[0] || ''}
                onChange={(e) => setSelectedPublishers(e.target.value ? [e.target.value] : [])}
                className={`sleek-select ${selectedPublishers.length > 0 ? 'active' : ''}`}
              >
                <option value="">Alle Verlage</option>
                {availablePublishers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            )}

            {hasAnyFilter && (
               <button 
                 onClick={clearAllFilters} 
                 style={{ 
                   padding: '0.6rem 1.2rem', background: 'transparent', color: '#ef4444', 
                   border: '1px solid #fca5a5', borderRadius: '50px', cursor: 'pointer', 
                   fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                   transition: 'all 0.2s'
                 }}
                 onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                 onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
               >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 Filter löschen
               </button>
            )}
          </div>
        </div>
      </div>

    <div className="shop-layout" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Sidebar - Category Navigation */}
      <aside className="sidebar animate-fade-in" style={{ animationDelay: '0.1s', borderRight: '1px solid #e2e8f0', paddingRight: '2rem' }}>
        <div style={{ position: 'sticky', top: '12rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            Notenkategorien
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {taxonomy.map(tax => {
               const isExpanded = selectedBesetzungen.includes(tax.besetzung) || (selectedBesetzungen.length === 0 && searchParams.has('besetzung') && searchParams.get('besetzung') === tax.besetzung);
               return (
                 <li key={tax.besetzung}>
                   <button 
                     onClick={() => {
                        if (isExpanded) {
                          setSelectedBesetzungen([]);
                          setSelectedSoloinstruments([]);
                          setSelectedGenres([]);
                        } else {
                          setSelectedBesetzungen([tax.besetzung]);
                          setSelectedSoloinstruments([]);
                          setSelectedGenres([]);
                        }
                     }}
                     style={{ 
                       background: 'none', border: 'none', padding: '0.5rem 0', 
                       textAlign: 'left', width: '100%', cursor: 'pointer',
                       fontWeight: isExpanded ? 700 : 500,
                       color: isExpanded ? 'var(--accent)' : 'var(--text)',
                       display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                       fontSize: '1.05rem',
                       transition: 'color 0.2s'
                     }}
                   >
                     {tax.besetzung}
                     {tax.items.length > 0 && (
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                     )}
                   </button>
                   
                   {isExpanded && tax.items.length > 0 && (
                     <ul style={{ listStyle: 'none', padding: '0.5rem 0 1rem 1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: '2px solid #f1f5f9', marginLeft: '0.5rem' }}>
                       {tax.items.map(item => {
                         const isSubActive = tax.type === 'solist' ? selectedSoloinstruments.includes(item) : selectedGenres.includes(item);
                         return (
                           <li key={item}>
                             <button
                               onClick={() => {
                                 if (tax.type === 'solist') {
                                   setSelectedSoloinstruments(isSubActive ? [] : [item]);
                                   setSelectedGenres([]);
                                 } else {
                                   setSelectedGenres(isSubActive ? [] : [item]);
                                   setSelectedSoloinstruments([]);
                                 }
                               }}
                               style={{
                                 background: 'none', border: 'none', padding: 0,
                                 textAlign: 'left', width: '100%', cursor: 'pointer',
                                 fontSize: '0.95rem',
                                 color: isSubActive ? 'var(--accent)' : 'var(--text-light)',
                                 fontWeight: isSubActive ? 700 : 500,
                                 transition: 'color 0.2s'
                               }}
                             >
                               {item}
                             </button>
                           </li>
                         );
                       })}
                     </ul>
                   )}
                 </li>
               )
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="shop-main">
        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            {filteredProducts.length === 0 ? "Keine Ergebnisse gefunden" : filteredProducts.length === 1 ? "1 Ergebnis gefunden" : `${filteredProducts.length} Ergebnisse gefunden`}
          </div>
          <div className="toolbar-sort" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', background: '#f5f7fa', borderRadius: '4px', padding: '0.2rem' }}>
              <button 
                onClick={() => setViewMode('grid')}
                className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                style={{ 
                  background: viewMode === 'grid' ? 'white' : 'transparent', 
                  border: viewMode === 'grid' ? '1px solid #e2e8f0' : '1px solid transparent', 
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: viewMode === 'grid' ? 'var(--accent)' : '#a0aec0',
                  padding: '0.3rem', 
                  borderRadius: '3px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                aria-label="Rasteransicht"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                style={{ 
                  background: viewMode === 'list' ? 'white' : 'transparent', 
                  border: viewMode === 'list' ? '1px solid #e2e8f0' : '1px solid transparent', 
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: viewMode === 'list' ? 'var(--accent)' : '#a0aec0',
                  padding: '0.3rem', 
                  borderRadius: '3px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                aria-label="Listenansicht"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
            <select defaultValue="newest">
              <option value="newest">Neueste zuerst</option>
              <option value="title-asc">Titel (A-Z)</option>
              <option value="price-asc">Preis aufsteigend</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>Keine Noten gefunden</h3>
            <p>Versuche es mit einem anderen Suchbegriff oder ändere deine Filter.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedGenres([]); setSelectedGrades([]); }}>
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div 
            className={viewMode === 'grid' ? "product-grid animate-fade-in" : "animate-fade-in"} 
            style={{ 
              animationDelay: '0.4s',
              ...(viewMode === 'list' && {
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              })
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
