import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="logo" style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              DONAUTON<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <p style={{ color: '#a0a0a0', marginBottom: '1.5rem', maxWidth: '300px' }}>
              Dein premium Musikverlag für hochwertige Blasmusik Noten, Hörbücher und erstklassige CD-Produktionen. Echte Blasmusik-Leidenschaft.
            </p>
          </div>
          
          <div className="footer-col">
            <h3>Shop</h3>
            <ul className="footer-links">
              <li><Link href="/noten">Noten für Blasmusik</Link></li>
              <li><Link href="/cds">CDs & DVDs</Link></li>
              <li><Link href="/buecher">Bücher & Unterricht</Link></li>
              <li><Link href="/merch">Merchandise</Link></li>
              <li><Link href="/tickets">Tickets</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Service & Info</h3>
            <ul className="footer-links">
              <li><Link href="/kontakt">Kontakt</Link></li>
              <li><Link href="/versand">Versand & Zahlung</Link></li>
              <li><Link href="/agb">AGB</Link></li>
              <li><Link href="/datenschutz">Datenschutz</Link></li>
              <li><Link href="/impressum">Impressum</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Newsletter abonnieren</h3>
            <p style={{ color: '#a0a0a0', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Erhalte Neuigkeiten zu unseren Komponisten und neuen Publikationen direkt ins Postfach!
            </p>
            <form className="newsletter-form">
              <input type="email" placeholder="Deine E-Mail-Adresse" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn">Abonnieren</button>
            </form>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              {/* Social Icons Placeholder */}
              <a href="#" style={{ color: 'white' }}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
              <a href="#" style={{ color: 'white' }}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
              <a href="#" style={{ color: 'white' }}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} DONAUTON Shop | Professioneller Musikverlag. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
