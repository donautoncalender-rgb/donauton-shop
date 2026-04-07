import React from 'react';

interface ProductDetailsListProps {
  detailsJson: string | null;
  // Fallbacks falls detailsJson leer ist (z.B. alte Artikel)
  category?: string | null;
  genre?: string | null;
  sku?: string | null;
}

export default function ProductDetailsList({ detailsJson, category, genre, sku }: ProductDetailsListProps) {
  let details: { label: string; value: string }[] = [];
  
  if (detailsJson) {
    try {
      details = JSON.parse(detailsJson);
    } catch (e) {
      console.error("Fehler beim Parsen der detailsJson", e);
    }
  }

  // Fallback, falls gar nichts da ist (sollte nach Sync nicht passieren)
  if (details.length === 0) {
    if (category) details.push({ label: "Kategorie", value: category + (genre ? ` - ${genre}` : '') });
    if (sku) details.push({ label: "Artikelnummer", value: sku });
  }

  return (
    <div style={{ margin: '0 0 1.5rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#333' }}>
        <tbody>
          {details.map((detail, index) => (
            <tr key={index} style={{ borderBottom: index === details.length - 1 ? 'none' : '1px solid #eaeaea' }}>
              <td style={{ padding: '0.6rem 0', fontWeight: 600, color: '#111', width: '35%', verticalAlign: 'top' }}>
                {detail.label}
              </td>
              <td style={{ padding: '0.6rem 0', verticalAlign: 'top' }}>
                {detail.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
