import { prisma } from '../../../lib/prisma';
import HomepageForm from './HomepageForm';

export default async function HomepageDesigner() {
  const settingsRecords = await prisma.shopSetting.findMany();
  const s = settingsRecords.reduce((acc, current) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2.2rem', fontWeight: 800 }}>Startseiten-Designer</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '3rem', fontSize: '1.1rem' }}>Konfiguriere das Layout, die Grafiken und Texte deiner Startseite live.</p>
      
      <HomepageForm settings={s} />
    </div>
  );
}
