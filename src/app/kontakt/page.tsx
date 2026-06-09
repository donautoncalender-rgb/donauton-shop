import { prisma } from '../../lib/prisma';
import ContactForm from '../../components/ContactForm';

export default async function KontaktPage() {
  // Dynamische Stammdaten aus der Datenbank abrufen mit Fallback-Werten
  let name = 'DONAUTON GmbH';
  let street = 'Dorfstraße 24a';
  let zip = '86735';
  let city = 'Forheim';
  let country = 'Deutschland';
  let email = 'vertrieb@donauton.de';
  let website = 'www.donauton.de';

  try {
    const settings = await prisma.shopSetting.findMany({
      where: {
        key: {
          in: [
            'company_name',
            'company_street',
            'company_zip',
            'company_city',
            'company_country',
            'company_email',
            'company_website'
          ]
        }
      }
    });

    const settingsMap = settings.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {} as Record<string, string>);

    if (settingsMap['company_name']) name = settingsMap['company_name'];
    if (settingsMap['company_street']) street = settingsMap['company_street'];
    if (settingsMap['company_zip']) zip = settingsMap['company_zip'];
    if (settingsMap['company_city']) city = settingsMap['company_city'];
    if (settingsMap['company_country']) country = settingsMap['company_country'];
    if (settingsMap['company_email']) email = settingsMap['company_email'];
    if (settingsMap['company_website']) website = settingsMap['company_website'];
  } catch (e) {
    console.error('Failed to load dynamic company settings for Kontakt page:', e);
  }

  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Sprechen Sie mit uns</h1>
        <p className="page-subtitle">Haben Sie Fragen zu unseren Noten, Arrangements oder Ihrer Bestellung? Wir helfen gerne weiter.</p>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '0.2s', backgroundColor: 'var(--surface)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <ContactForm />
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.4s', textAlign: 'center', marginTop: '4rem', color: 'var(--text-light)', lineHeight: '1.8' }}>
        <p style={{ fontWeight: 650, color: 'var(--primary)', marginBottom: '0.3rem' }}>{name}</p>
        <p>{street} &bull; {zip} {city} &bull; {country}</p>
        <p>
          E-Mail: <a href={`mailto:${email}`} className="hover:text-accent" style={{ textDecoration: 'underline' }}>{email}</a> 
          {website && (
            <>
              &nbsp;&bull;&nbsp;Web: <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent" style={{ textDecoration: 'underline' }}>{website}</a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

