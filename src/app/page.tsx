import React from 'react';
import Link from 'next/link';
import HeroSlider from '../components/HeroSlider';
import MiniProductSlider from '../components/MiniProductSlider';
import DynamicIcon from '../components/DynamicIcon';
import { prisma } from '../lib/prisma';
import DailyHighlight from '../components/DailyHighlight';

export default async function Home() {
  const settingsRecords = await prisma.shopSetting.findMany();
  const s = settingsRecords.reduce((acc, current) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  const dbSliders = await prisma.frontpageSlider.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' }
  });
  
  const activeSliders = dbSliders.length > 0 ? dbSliders : [
    { title: 'Werke vom Alpen-Sound Musikverlag', linkUrl: '/noten', filterType: 'CATEGORY', filterValue: 'alpen-sound' },
    { title: 'Neu im Sortiment', linkUrl: '/noten?sort=new', filterType: 'LATEST', filterValue: null }
  ];

  const productsDb = await prisma.product.findMany();
  const allProducts = productsDb.map((p: any) => {
    let urlType = p.category?.toLowerCase() || 'noten';
    if (urlType === 'bücher') urlType = 'buecher';
    return {
      id: p.id,
      wooId: p.wooId,
      title: p.title,
      type: urlType,
      price: p.price,
      image: p.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=565&fit=crop&q=80',
      badge: p.badge || '',
      slug: p.slug,
      genre: p.genre || p.category
    };
  });

  // Dynamische Auswahl des "Highlight des Tages"
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const highlightProduct = productsDb.length > 0 ? productsDb[dayOfYear % productsDb.length] : null;

  // Dynamische Slides für Hero Categories
  const heroSlides = [
    {
      id: 1,
      image: s['home_slider_1_img'] || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1600&q=80',
      tagline: s['home_slider_1_tagline'] || 'DAS GANZE SORTIMENT',
      title: s['home_slider_1_title'] || 'Die größte',
      subtitle: s['home_slider_1_subtitle'] || 'Notenauswahl',
      text: s['home_slider_1_text'] || 'Tausende Werke für Blasorchester und kleine Ensembles warten auf dich.',
      link: s['home_slider_1_link'] || '/noten',
      btnText: s['home_slider_1_btn'] || 'Zu den Noten'
    },
    {
      id: 2,
      image: s['home_slider_2_img'] || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&q=80',
      tagline: s['home_slider_2_tagline'] || 'FACHLITERATUR',
      title: s['home_slider_2_title'] || 'Spannende',
      subtitle: s['home_slider_2_subtitle'] || 'Unterrichtswerke',
      text: s['home_slider_2_text'] || 'Stöbere jetzt in unserer riesigen Auswahl an Musikliteratur und Lehrwerken.',
      link: s['home_slider_2_link'] || '/noten',
      btnText: s['home_slider_2_btn'] || 'Bücher entdecken'
    },
    {
      id: 3,
      image: s['home_slider_3_img'] || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&q=80',
      tagline: s['home_slider_3_tagline'] || 'AUDIO PRODUKTE',
      title: s['home_slider_3_title'] || 'Hunderte CDs',
      subtitle: s['home_slider_3_subtitle'] || '& Audio-Tracks',
      text: s['home_slider_3_text'] || 'Entdecke die ganze Welt der böhmischen und modernen Blasmusik auf CD oder per Download.',
      link: s['home_slider_3_link'] || '/cds',
      btnText: s['home_slider_3_btn'] || 'Zum Audio-Shop'
    }
  ];

  // Helper to get products for slider
  const getProductsForSlider = (slider: any) => {
    // For now we just return latest 6 products as fallback, unless filtered
    return allProducts.slice(0, 8);
  };

  return (
    <>
      <HeroSlider slides={heroSlides} />

      {/* ENDLOS-MARQUEE / TRUST-BADGE */}
      <div style={{ backgroundColor: 'var(--surface)', borderTop: '3px solid var(--accent)', borderBottom: '3px solid var(--accent)', overflow: 'hidden', padding: '1.2rem 0', display: 'flex', position: 'relative' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scrollMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .trust-marquee { display: inline-flex; animation: scrollMarquee 35s linear infinite; white-space: nowrap; }
          .trust-marquee:hover { animation-play-state: paused; }
        `}} />
        <div className="trust-marquee">
          {[...Array(2)].map((_, i) => (
             <React.Fragment key={i}>
                {(s['home_marquee_text'] || 'Lukas Bruckmeyer Publikationen, Alpen-Sound Verlag, Klarus Musikverlag, Original Egerländer Musikverlag, Donauton Exklusiv')
                  .split(',')
                  .map((t, idx) => (
                  <React.Fragment key={idx}>
                    <span style={{ padding: '0 3rem', color: 'var(--text-light)', fontWeight: 600, fontSize: '0.95rem', letterSpacing: '2px', textTransform: 'uppercase' }}>{t.trim()}</span>
                    <span style={{ color: 'var(--accent)' }}>✦</span>
                  </React.Fragment>
                ))}
             </React.Fragment>
          ))}
        </div>
      </div>


      {/* QUICK CATEGORY LINKS */}
      <section style={{ padding: '4rem 0 5rem 0', backgroundColor: 'var(--surface)', position: 'relative' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              { title: 'Noten', icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>, path: '/noten' },
              { title: 'CDs & Audio', icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="12" x2="16.24" y2="7.76"></line></svg>, path: '/cds' },
              { title: 'Bücher', icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>, path: '/buecher' },
              { title: 'Merch', icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>, path: '/merch' },
              { title: 'Tickets', icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>, path: '/tickets' }
            ].map((cat, idx) => (
              <Link href={cat.path} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', textDecoration: 'none', color: 'var(--text)' }} className="cat-link-hover">
                <style dangerouslySetInnerHTML={{__html: `
                  .cat-link-hover:hover .cat-circle-inner { transform: translateY(-5px) scale(1.02); background-color: var(--primary) !important; box-shadow: 0 15px 30px rgba(167, 25, 48, 0.4) !important; }
                  .cat-link-hover:hover .cat-icon-container { transform: scale(1.15) rotate(3deg); }
                  .cat-link-hover:hover .cat-title-text { color: var(--accent); }
                `}} />
                <div className="cat-circle-inner" style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--accent)', border: 'none', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 8px 20px rgba(167, 25, 48, 0.15)', zIndex: 2 }}>
                  <div className="cat-icon-container" style={{ color: '#fff', transition: 'all 0.4s ease' }}>
                    {cat.icon}
                  </div>
                </div>
                <span className="cat-title-text" style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1.05rem', letterSpacing: '1px', transition: 'color 0.3s' }}>{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dezenter zentrierter roter Strich als optischer Trenner */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '250px', height: '4px', backgroundColor: 'var(--accent)', borderRadius: '2px 2px 0 0' }} />
      </section>


      <DailyHighlight product={highlightProduct} />
      {/* DYNAMIC MINI PRODUCT SLIDERS ROW */}
      <section className="section" style={{ padding: '3rem 0' }}>
        <div className="container">
          {activeSliders.map((slider: any, idx: number) => {
            return (
              <div key={slider.id || idx}>
                <MiniProductSlider 
                  title={slider.title} 
                  linkAll={slider.linkUrl || ''} 
                  products={getProductsForSlider(slider)} 
                />
                
                {idx < activeSliders.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                    <div style={{ width: '250px', height: '4px', backgroundColor: 'var(--accent)', borderRadius: '2px' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER VIP BANNER */}
      <section style={{ padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url("https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(5,38,53, 0.95) 0%, rgba(5,38,53, 0.75) 100%)', zIndex: -1 }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'white' }}>
           <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{s['home_newsletter_title'] || 'Werde Teil der Donauton-Familie'}</h2>
           <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', marginBottom: '2.5rem' }}>{s['home_newsletter_text'] || 'Trag dich jetzt für unseren Exklusiv-Verteiler ein und erhalte sofort 10% Willkommens-Rabatt sowie kostenlose Probe-Partituren für dein Orchester.'}</p>
           
           <form style={{ display: 'flex', width: '100%', maxWidth: '540px', background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <input type="email" placeholder="Deine E-Mail Adresse..." required style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '0 1.5rem', fontSize: '1rem', outline: 'none' }} />
              <button type="button" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '40px' }}>VIP werden</button>
           </form>
           <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>100% Musik, 0% Spam. Abmeldung jederzeit möglich.</p>
        </div>
      </section>

      {/* WHY SHOP AT DONAUTON */}
      <section style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', textAlign: 'center' }}>
            
            {[1, 2, 3, 4].map(uspNum => {
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
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
               '<svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
             ];

             const title = s[`home_usp${uspNum}_title`] || defaultTitles[uspNum - 1];
             const text = s[`home_usp${uspNum}_text`] || defaultTexts[uspNum - 1];
             const iconSvg = s[`home_usp${uspNum}_icon`] || defaultIcons[uspNum - 1];

             return (
              <div key={uspNum}>
                <div style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                  <DynamicIcon 
                    icon={s[`home_usp${uspNum}_icon`] || defaultIcons[uspNum - 1]} 
                    size={28} 
                    fallbackSvg={defaultIcons[uspNum - 1]}
                  />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>{text}</p>
              </div>
             );
            })}

          </div>
        </div>
      </section>
    </>
  );
}
