import { prisma } from '../../../lib/prisma';
import { CreateSliderForm, SliderEditForm } from '../../../components/SliderForms';

export default async function SlidersAdmin() {
  const sliders = await prisma.frontpageSlider.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Startseiten Produkt-Slider</h1>
        <CreateSliderForm />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sliders.length === 0 && (
          <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
            Es sind noch keine Slider konfiguriert. Erstelle deinen ersten Slider oben rechts!
          </div>
        )}

        {sliders.map((slider: any) => (
          <SliderEditForm key={slider.id} slider={slider} />
        ))}
      </div>
    </>
  );
}
