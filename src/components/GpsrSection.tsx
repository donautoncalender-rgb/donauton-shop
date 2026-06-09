import React from 'react';
import { prisma } from '../lib/prisma';

interface GpsrSectionProps {
  publisher: string | null;
}

export default async function GpsrSection({ publisher }: GpsrSectionProps) {
  const isDonauton = !publisher || publisher.trim() === '' || publisher.toLowerCase().includes('donauton');

  // Dynamische Stammdaten aus der Datenbank abrufen mit Fallback-Werten aus der Suite
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
    console.error('Failed to load dynamic company settings for GPSR:', e);
  }

  return (
    <details style={{
      marginTop: '1.5rem',
      border: '1px solid #eaeaea',
      borderRadius: '8px',
      backgroundColor: '#fcfcfc',
      padding: '0.8rem 1rem',
      fontSize: '0.9rem',
      fontFamily: 'inherit'
    }} className="no-print">
      <summary style={{
        fontWeight: 650,
        color: '#111',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        outline: 'none',
        userSelect: 'none'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛡️ Produktsicherheit (GPSR)
        </span>
        <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 500 }}>
          Anzeigen
        </span>
      </summary>
      <div style={{ 
        marginTop: '0.8rem', 
        paddingTop: '0.8rem', 
        borderTop: '1px solid #f1f5f9', 
        color: '#475569', 
        lineHeight: 1.5 
      }}>
        {isDonauton ? (
          <div>
            <strong style={{ color: '#1e293b' }}>Hersteller:</strong><br />
            {name}<br />
            {street}<br />
            {zip} {city}<br />
            {country}<br />
            E-Mail: {email}<br />
            Web: {website}
          </div>
        ) : (
          <div>
            <strong style={{ color: '#1e293b' }}>Hersteller / Lizenzgeber:</strong><br />
            {publisher}<br />
            (Vertrieb durch {name})<br /><br />
            Für Sicherheits- und Konformitätsfragen kontaktieren Sie bitte den Vertriebspartner:<br />
            {name}, {street}, {zip} {city}, {country}<br />
            E-Mail: {email}
          </div>
        )}
      </div>
    </details>
  );
}
