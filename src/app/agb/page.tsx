import { prisma } from '../../lib/prisma';

export default async function AGBPage() {
  const contentSetting = await prisma.shopSetting.findUnique({ where: { key: 'page_agb' } });
  const titleSetting = await prisma.shopSetting.findUnique({ where: { key: 'page_agb_title' } });

  const title = titleSetting?.value || 'Allgemeine Geschäftsbedingungen';
  const htmlContent = contentSetting?.value || `
    <div class="agb-content" style="font-size: 1rem; line-height: 1.8;">
      <p><strong>Allgemeine Geschäftsbedingungen (AGB) der DONAUTON GmbH</strong></p>
      <p>Stand: Juni 2026</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 1 Geltungsbereich und Anbieter</h3>
      <p>(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB“) gelten für alle Bestellungen, die Verbraucher oder Unternehmer (nachfolgend „Kunde“) über den Online-Shop der</p>
      <p style="padding-left: 20px; margin: 1rem 0;">
        <strong>DONAUTON GmbH</strong><br />
        Vertreten durch den Geschäftsführer: Lukas Bruckmeyer<br />
        Dorfstraße 24a<br />
        86735 Forheim<br />
        Deutschland<br />
        E-Mail: vertrieb@donauton.de<br />
        Website: www.donauton.de<br />
      </p>
      <p>(nachfolgend „Anbieter“ oder „wir“) tätigen.</p>
      <p>(2) Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbstständigen beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist eine natürliche oder juristische Person oder eine rechtsfähige Personengesellschaft, die bei Abschluss eines Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbstständigen beruflichen Tätigkeit handelt.</p>
      <p>(3) Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 2 Vertragsgegenstand und Produkte</h3>
      <p>(1) Gegenstand des Vertrages ist der Verkauf von Waren (z.B. gedruckte Notenausgaben, Bücher, Tonträger/CDs, Merchandise-Artikel) sowie der Verkauf und die Bereitstellung von digitalen Inhalten (z.B. Noten-Downloads im PDF-Format, Audio-Dateien) und Eintrittskarten (Tickets) für Veranstaltungen über unseren Online-Shop.</p>
      <p>(2) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 3 Bestellvorgang und Vertragsschluss</h3>
      <p>(1) Der Kunde kann Produkte aus dem Sortiment des Anbieters auswählen und diese über den Button „In den Warenkorb“ in einem sogenannten Warenkorb sammeln.</p>
      <p>(2) Über den Button „Kostenpflichtig bestellen“ gibt der Kunde einen bindenden Antrag zum Kauf der im Warenkorb befindlichen Waren ab. Vor Absenden der Bestellung kann der Kunde die Daten jederzeit ändern und einsehen.</p>
      <p>(3) Der Vertrag kommt zustande, indem wir dem Kunden nach Eingang der Bestellung eine automatische Bestellbestätigung per E-Mail zusenden, mit welcher der Vertragsschluss unmittelbar erfolgt.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 4 Preise, Versandkosten und Zahlungsbedingungen</h3>
      <p>(1) Alle im Online-Shop angegebenen Preise verstehen sich als Endpreise in Euro inklusive der jeweils gesetzlich gültigen Mehrwertsteuer zzgl. anfallender Versandkosten.</p>
      <p>(2) Die entsprechenden Versandkosten werden dem Kunden im Bestellformular vor dem Absenden der Bestellung angegeben und sind vom Kunden zu tragen, sofern nicht versandkostenfreie Lieferung vereinbart ist.</p>
      <p>(3) Dem Kunden stehen die im Online-Shop angebotenen Zahlungsmethoden zur Verfügung (z.B. Kreditkarte, PayPal, Stripe, Vorkasse). Die Zahlung ist unmittelbar nach Vertragsschluss fällig.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 5 Lieferung und Eigentumsvorbehalt</h3>
      <p>(1) Sofern nicht anders vereinbart, erfolgt die Lieferung physischer Waren auf dem Versandweg an die vom Kunden angegebene Lieferanschrift.</p>
      <p>(2) Bis zur vollständigen Bezahlung des Kaufpreises verbleiben die gelieferten Waren im Eigentum des Anbieters.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 6 Besondere Bedingungen für digitale Inhalte (Noten-Downloads)</h3>
      <p>(1) Der Anbieter vertreibt Notenausgaben auch in Form von digitalen Downloads (PDF-Format). Diese digitalen Inhalte werden dem Kunden nach erfolgreicher Zahlung im Kundenkonto oder per Download-Link bereitgestellt.</p>
      <p>(2) <strong>Nutzungsrechte:</strong> An den erworbenen digitalen Inhalten räumt der Anbieter dem Kunden ein einfaches, nicht übertragbares, zeitlich und räumlich unbegrenztes Recht ein, die bereitgestellten Dateien ausschließlich für den persönlichen oder vereinsinternen Gebrauch (z.B. im Rahmen des eigenen Musikvereins, Orchesters oder Chores) zu nutzen.</p>
      <p>(3) Jede weitergehende Nutzung, insbesondere das Vervielfältigen für Dritte außerhalb des eigenen Vereinsbedarfs, die kommerzielle Weiterverbreitung, das Einstellen ins Internet oder der Weiterverkauf der PDF-Noten ist ausdrücklich untersagt.</p>
      <p>(4) <strong>Widerrufsrecht bei Downloads:</strong> Das Widerrufsrecht erlischt bei Verträgen über die Lieferung von digitalen Inhalten vorzeitig, wenn der Kunde ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung des Vertrages vor Ablauf der Widerrufsfrist beginnt, und der Kunde seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung des Vertrages sein Widerrufsrecht verliert.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 7 Besondere Bedingungen für Tickets (Eintrittskarten)</h3>
      <p>(1) Beim Kauf von Eintrittskarten (Tickets) für Veranstaltungen der DONAUTON GmbH kommt der Vertrag über den Veranstaltungsbesuch zustande.</p>
      <p>(2) Gemäß § 312g Abs. 2 Nr. 9 BGB besteht bei Verträgen zur Erbringung von Dienstleistungen im Zusammenhang mit Freizeitbetätigungen, die einen spezifischen Termin oder Zeitraum vorsehen, <strong>kein Widerrufsrecht</strong>. Der Kauf von Tickets ist damit bindend und verpflichtet zur Abnahme und Zahlung.</p>
      <p>(3) Zum Schutz vor Vervielfältigung sind personalisierte PDF-Tickets limitiert abrufbar (in der Regel einmaliger Download). Bei Fragen oder Verlust wenden Sie sich bitte direkt an unseren Support.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 8 Widerrufsrecht für Verbraucher</h3>
      <p>Verbrauchern steht beim Kauf von physischen Waren (ausgenommen entsiegelte Tonträger, Spezialanfertigungen oder Tickets) ein gesetzliches Widerrufsrecht zu. Die Details entnehmen Sie bitte unserer gesonderten Widerrufsbelehrung.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 9 Gewährleistung und Haftung</h3>
      <p>(1) Es gelten die gesetzlichen Gewährleistungsrechte.</p>
      <p>(2) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer Pflichtverletzung des Anbieters, eines gesetzlichen Vertreters oder Erfüllungsgehilfen beruhen, sowie für sonstige Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen.</p>

      <h3 style="color: var(--primary); font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; font-weight: 700;">§ 10 Alternative Streitbeilegung</h3>
      <p>(1) Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">https://ec.europa.eu/consumers/odr</a> finden.</p>
      <p>(2) Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.</p>
    </div>
  `;

  return (
    <div className="container page-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '8rem', paddingBottom: '4rem' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .strict-wrap-container * {
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
          max-width: 100% !important;
        }
      `}} />
      <h1 className="page-title animate-fade-in" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>{title}</h1>
      <div 
        className="animate-fade-in text-content-dynamic strict-wrap-container" 
        style={{ 
          animationDelay: '0.1s', 
          lineHeight: 1.8, 
          color: 'var(--text-light)',
          backgroundColor: 'var(--surface)',
          padding: '3rem',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }} 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}
