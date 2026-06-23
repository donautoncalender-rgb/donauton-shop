'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'bar';

const translations = {
  de: {
    nav_noten: "NOTEN",
    nav_cds: "CDS & AUDIO",
    nav_buecher: "BÜCHER",
    nav_tickets: "TICKETS",
    nav_merch: "MERCHANDISE",
    nav_autoren: "UNSERE AUTOR*INNEN",
    search_placeholder: "Suchen...",
    search_all: "Alle Ergebnisse anzeigen",
    search_empty: "Keine Ergebnisse",
    search_one: "1 Suchvorschlag",
    search_many: "Suchvorschläge",
    search_not_found: "Keine passenden Produkte gefunden",
    cart_title: "Dein Warenkorb",
    cart_empty: "Dein Warenkorb ist leer.",
    cart_continue: "Weiter einkaufen",
    cart_subtotal: "Zwischensumme",
    cart_checkout: "Zur Kasse",
    product_add_to_cart: "In den Warenkorb",
    product_print: "Gedruckte Ausgabe",
    product_digital: "Digitaler Download (PDF)",
    product_listen: "Anhören",
    product_read: "Lesen",
    product_save: "Merken",
    product_share: "Teilen",
    product_tax_info: "inkl. MwSt. zzgl. Versandkosten",
    product_amount: "Menge",
    checkout_title: "Kasse",
    checkout_summary: "Bestellübersicht",
    checkout_buy: "Kostenpflichtig bestellen",
    error_404_title: "Ton verfehlt!",
    error_404_desc: "Die gesuchte Seite konnte auf unserer Bühne nicht gefunden werden.",
    error_404_btn: "ZURÜCK ZUR STARTSEITE"
  },
  bar: {
    nav_noten: "NOTN",
    nav_cds: "PLATTN & AUDIO",
    nav_buecher: "BIACHA",
    nav_tickets: "KARTN",
    nav_merch: "GWAAND & ZEIG",
    nav_autoren: "UNSRE SCHREIBERLINGE",
    search_placeholder: "Suacha...",
    search_all: "Ois ozoang",
    search_empty: "Nix do",
    search_one: "1 Vorschlag",
    search_many: "Vorschläg",
    search_not_found: "Nix passends gfundn",
    cart_title: "Dei Körberl",
    cart_empty: "Dei Körberl is laar.",
    cart_continue: "Weida eikaffa",
    cart_subtotal: "Zwischensumme",
    cart_checkout: "Zum Zoin",
    product_add_to_cart: "Ab in's Körberl",
    product_print: "Aufm Papier",
    product_digital: "Digital (PDF)",
    product_listen: "Ohearn",
    product_read: "Neischaun",
    product_save: "Merka",
    product_share: "Weidasagn",
    product_tax_info: "inkl. Steuer, ohne Porto",
    product_amount: "Menge",
    checkout_title: "Kassa",
    checkout_summary: "Bestellübersicht",
    checkout_buy: "Jetzt kaffa",
    error_404_title: "Verblasn!",
    error_404_desc: "Des wos du suachst, hammer ned. Do is nix!",
    error_404_btn: "ZURÜCK ZUM START"
  }
};

type Translations = typeof translations.de;
export type TranslationKey = keyof Translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'de',
  setLanguage: () => {},
  t: (key) => translations.de[key] || key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('de');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('donauton_dialect') as Language;
    if (savedLang && (savedLang === 'de' || savedLang === 'bar')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('donauton_dialect', lang);
  };

  const t = (key: TranslationKey): string => {
    // Return standard german during SSR to avoid hydration mismatch
    if (!mounted) return translations.de[key] || key;
    return translations[language][key] || translations.de[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
