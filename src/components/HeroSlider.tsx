'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider({ slides }: { slides: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ 
      position: 'relative', 
      width: '100%', 
      height: '450px', 
      backgroundColor: '#111',
      overflow: 'hidden'
    }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            zIndex: currentSlide === index ? 1 : 0
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url("${slide.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}></div>
          
          <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', transform: currentSlide === index ? 'translateY(0)' : 'translateY(20px)', transition: 'transform 1s ease-out' }}>
            <div style={{ background: 'var(--accent)', color: 'white', padding: '0.3rem 0.8rem', display: 'inline-block', alignSelf: 'flex-start', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
              {slide.tagline}
            </div>
            <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', textShadow: '0 4px 20px rgba(0,0,0,0.5)', margin: 0 }}>
              {slide.title} <br/> <span style={{ color: '#f0f0f0', fontWeight: 300 }}>{slide.subtitle}</span>
            </h1>
            <p style={{ color: '#ddd', fontSize: '1.1rem', maxWidth: '500px', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {slide.text}
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <Link href={slide.link} className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(205,23,25,0.5)' }}>
                {slide.btnText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Indicators */}
      <div style={{ position: 'absolute', bottom: '30px', left: '0', width: '100%', display: 'flex', justifyContent: 'center', gap: '15px', zIndex: 10 }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: currentSlide === index ? '40px' : '15px',
              height: '8px',
              borderRadius: '4px',
              background: currentSlide === index ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label={`Gehe zu Slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </section>
  );
}
