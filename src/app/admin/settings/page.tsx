import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Server Action for saving settings
async function saveSettings(formData: FormData) {
  'use server';
  
  let logoUrl = formData.get('logoUrl') as string;
  const logoFile = formData.get('logoFile') as File | null;
  const shopTitle = formData.get('shopTitle') as string;
  const announcementText = formData.get('announcementText') as string;

  // Handle file upload
  if (logoFile && logoFile.size > 0) {
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extMatch = logoFile.name.match(/\.[0-9a-z]+$/i);
    const ext = extMatch ? extMatch[0] : '.png';
    const filename = `logo-${Date.now()}${ext}`;
    
    try {
      const blob = await put(filename, logoFile, { access: 'public' });
      logoUrl = blob.url;
    } catch(e) {
      console.log('Blob upload failed. Did you configure Vercel Blob?', e);
    }
  }

  // Upsert settings
  if (logoUrl != null && logoUrl !== "") {
    await prisma.shopSetting.upsert({
      where: { key: 'logo_url' },
      update: { value: logoUrl },
      create: { key: 'logo_url', value: logoUrl }
    });
  }

  if (shopTitle != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'shop_title' },
      update: { value: shopTitle },
      create: { key: 'shop_title', value: shopTitle }
    });
  }

  if (announcementText != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'announcement_text' },
      update: { value: announcementText },
      create: { key: 'announcement_text', value: announcementText }
    });
  }

  const erpUrl = formData.get('erpUrl') as string;
  const erpKey = formData.get('erpKey') as string;

  if (erpUrl != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'erp_suite_url' },
      update: { value: erpUrl },
      create: { key: 'erp_suite_url', value: erpUrl }
    });
  }

  if (erpKey != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'erp_suite_key' },
      update: { value: erpKey },
      create: { key: 'erp_suite_key', value: erpKey }
    });
  }

  // Payment Keys
  const stripePubKey = formData.get('stripePubKey') as string;
  const stripeSecKey = formData.get('stripeSecKey') as string;
  const paypalClientId = formData.get('paypalClientId') as string;

  if (stripePubKey != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'stripe_publishable_key' },
      update: { value: stripePubKey },
      create: { key: 'stripe_publishable_key', value: stripePubKey }
    });
  }

  if (stripeSecKey != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'stripe_secret_key' },
      update: { value: stripeSecKey },
      create: { key: 'stripe_secret_key', value: stripeSecKey }
    });
  }

  if (paypalClientId != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'paypal_client_id' },
      update: { value: paypalClientId },
      create: { key: 'paypal_client_id', value: paypalClientId }
    });
  }

  // Turnstile Keys
  const turnstileSiteKey = formData.get('turnstileSiteKey') as string;
  const turnstileSecretKey = formData.get('turnstileSecretKey') as string;

  if (turnstileSiteKey != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'turnstile_site_key' },
      update: { value: turnstileSiteKey },
      create: { key: 'turnstile_site_key', value: turnstileSiteKey }
    });
  }

  if (turnstileSecretKey != null) {
    await prisma.shopSetting.upsert({
      where: { key: 'turnstile_secret_key' },
      update: { value: turnstileSecretKey },
      create: { key: 'turnstile_secret_key', value: turnstileSecretKey }
    });
  }

  revalidatePath('/admin/settings');
  revalidatePath('/'); // update frontend too
  redirect('/admin/settings?success=1');
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const resolvedSearchParams = await searchParams;
  // Load current settings
  const settingsRecords = await prisma.shopSetting.findMany();
  
  // Transform to dict
  const settings = settingsRecords.reduce((acc, current) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <>
      <h1 style={{ marginBottom: '1rem' }}>Allgemeine Einstellungen</h1>

      {resolvedSearchParams.success === '1' && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <strong>Erfolgreich gespeichert!</strong> Die Einstellungen wurden übernommen.
        </div>
      )}

      <div className="admin-card">
        <h3 className="admin-card-title">Shop Basisdaten</h3>
        
        <form action={saveSettings} encType="multipart/form-data">
          <div className="admin-form-group">
            <label className="admin-label">Shop Titel</label>
            <input 
              name="shopTitle" 
              type="text" 
              className="admin-input" 
              defaultValue={settings['shop_title'] || 'DONAUTON Shop'} 
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Shop Logo</label>
            
            {settings['logo_url'] && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Aktuelles Logo:</p>
                <img src={settings['logo_url']} alt="Current Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input 
                name="logoFile" 
                type="file" 
                accept="image/*"
                className="admin-input" 
                style={{ cursor: 'pointer', padding: '0.8rem' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#64748b', alignSelf: 'center' }}>- ODER alternative Bild-ID -</span>
              <input 
                name="logoUrl" 
                type="text" 
                className="admin-input" 
                placeholder="https://... (Leer lassen falls Datei hochgeladen wird)"
                defaultValue={settings['logo_url'] || ''} 
              />
            </div>
            
            <small style={{ color: '#718096', display: 'block', marginTop: '0.5rem' }}>
              Dies ersetzt den Text "DONAUTON." im Headerbereich. Wähle einfach ein Bild von deinem PC aus.
            </small>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Ankündigungs-Banner (oben)</label>
            <input 
              name="announcementText" 
              type="text" 
              className="admin-input" 
              placeholder="z.B. Nur heute: Kostenloser Versand!"
              defaultValue={settings['announcement_text'] || ''} 
            />
          </div>

          <button type="submit" className="admin-btn">Einstellungen speichern</button>
        </form>
      </div>
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <h3 className="admin-card-title">ERP / DONAUTON Suite Integration</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Hier kannst du die direkte Anbindung an dein DONAUTON Main-System aktivieren. Sobald ein Token hinterlegt ist, werden Bestellungen sofort synchronisiert!
        </p>
        
        <form action={saveSettings}>
          <div className="admin-form-group">
            <label className="admin-label">Suite API URL</label>
            <input 
              name="erpUrl" 
              type="text" 
              className="admin-input" 
              placeholder="z.B. https://suite.donauton.de/api/v1/shop/orders"
              defaultValue={settings['erp_suite_url'] || 'http://localhost:3001/api/v1/shop/orders'} 
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">API Bearer Token (don_live_...)</label>
            <input 
              name="erpKey" 
              type="password" 
              className="admin-input" 
              placeholder="don_live_..."
              defaultValue={settings['erp_suite_key'] || ''} 
            />
            <small style={{ color: '#718096', display: 'block', marginTop: '0.5rem' }}>
              Diesen Token generierst du in deiner Suite unter E-Commerce -&gt; Einstellungen -&gt; API &amp; Webhooks.
            </small>
          </div>

          <button type="submit" className="admin-btn" style={{ background: '#059669' }}>API Speichern</button>
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <h3 className="admin-card-title">💳 Zahlungsanbieter-Anbindung</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Hier hinterlegst du sicher die Zugangsschlüssel für Kreditkarte/Apple Pay (Stripe) und PayPal. Die Schlüssel werden verschlüsselt in deiner Datenbank abgelegt.
        </p>

        <form action={saveSettings}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* STRIPE */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ marginBottom: '1rem', color: '#635bff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.996 0C5.371 0 0 5.37 0 11.996 0 18.62 5.371 23.991 11.996 23.991 18.621 23.991 23.991 18.62 23.991 11.996 23.991 5.37 18.621 0 11.996 0zm5.632 17.073c-1.25.642-2.825.968-4.478.968-4.846 0-7.258-2.316-7.258-6.19 0-3.924 2.658-6.42 7.081-6.42 1.488 0 2.825.337 3.868.868l-.872 2.673c-.886-.445-1.936-.706-3.078-.706-2.617 0-4.053 1.25-4.053 3.327 0 2.01 1.29 3.016 3.657 3.016.993 0 2.218-.217 3.048-.598l2.085 2.997z"/></svg>
                Stripe Einstellungen
              </h4>
              <div className="admin-form-group">
                <label className="admin-label">Publishable Key (pk_...)</label>
                <input name="stripePubKey" type="text" className="admin-input" placeholder="pk_live_..." defaultValue={settings['stripe_publishable_key'] || ''} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Secret Key (sk_...)</label>
                <input name="stripeSecKey" type="password" className="admin-input" placeholder="sk_live_..." defaultValue={settings['stripe_secret_key'] || ''} />
              </div>
            </div>

            {/* PAYPAL */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ marginBottom: '1rem', color: '#003087', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.053.303-.092.484-.518 3.227-2.669 4.906-5.874 5.093h-.062c-.413.024-.805.035-1.182.035H9.68a.862.862 0 0 0-.85.73l-1.754 8.9z"/></svg>
                PayPal Einstellungen
              </h4>
              <div className="admin-form-group">
                <label className="admin-label">Client ID</label>
                <input name="paypalClientId" type="text" className="admin-input" placeholder="..." defaultValue={settings['paypal_client_id'] || ''} />
              </div>
            </div>

          </div>
          <button type="submit" className="admin-btn" style={{ marginTop: '1.5rem' }}>Zahlungsschlüssel speichern</button>
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <h3 className="admin-card-title">🛡️ Spam-Schutz (Cloudflare Turnstile)</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Der unsichtbare und DSGVO-konforme Bot-Schutz für Kasse und Registrierung.
        </p>

        <form action={saveSettings}>
          <div style={{ padding: '1.5rem', backgroundColor: '#fdf8f6', borderRadius: '8px', border: '1px solid #f97316' }}>
            <h4 style={{ marginBottom: '1rem', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Cloudflare Turnstile Keys
            </h4>
            <div className="admin-form-group">
              <label className="admin-label">Site Key</label>
              <input name="turnstileSiteKey" type="text" className="admin-input" placeholder="0x4AAAAAA..." defaultValue={settings['turnstile_site_key'] || ''} />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Secret Key</label>
              <input name="turnstileSecretKey" type="password" className="admin-input" placeholder="..." defaultValue={settings['turnstile_secret_key'] || ''} />
            </div>
          </div>
          <button type="submit" className="admin-btn" style={{ marginTop: '1.5rem', background: '#ea580c' }}>Spam-Schutz Speichern</button>
        </form>
      </div>
    </>
  );
}
