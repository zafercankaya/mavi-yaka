import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import tr from './tr.json';
import en from './en.json';
import de from './de.json';
import pt from './pt.json';
import id from './id.json';
import ru from './ru.json';
import es from './es.json';
import ja from './ja.json';
import th from './th.json';
import fr from './fr.json';
import it from './it.json';
import ar from './ar.json';
import ko from './ko.json';
import vi from './vi.json';
import pl from './pl.json';
import ms from './ms.json';
import nl from './nl.json';
import ur from './ur.json';
import sv from './sv.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  de: { translation: de },
  pt: { translation: pt },
  id: { translation: id },
  ru: { translation: ru },
  es: { translation: es },
  ja: { translation: ja },
  th: { translation: th },
  fr: { translation: fr },
  it: { translation: it },
  ar: { translation: ar },
  ko: { translation: ko },
  vi: { translation: vi },
  pl: { translation: pl },
  ms: { translation: ms },
  nl: { translation: nl },
  ur: { translation: ur },
  sv: { translation: sv },
};

// Detect device language — 'tr' stays 'tr', 'de' stays 'de', 'pt' stays 'pt', everything else defaults to 'en'
function getDeviceLanguage(): string {
  try {
    const locales = getLocales();
    const lang = locales[0]?.languageCode ?? 'en';
    if (lang === 'tr') return 'tr';
    if (lang === 'de') return 'de';
    if (lang === 'pt') return 'pt';
    if (lang === 'id') return 'id';
    if (lang === 'ru') return 'ru';
    if (lang === 'es') return 'es';
    if (lang === 'ja') return 'ja';
    if (lang === 'th') return 'th';
    if (lang === 'fr') return 'fr';
    if (lang === 'it') return 'it';
    if (lang === 'ar') return 'ar';
    if (lang === 'ko') return 'ko';
    if (lang === 'vi') return 'vi';
    if (lang === 'pl') return 'pl';
    if (lang === 'ms') return 'ms';
    if (lang === 'nl') return 'nl';
    if (lang === 'ur') return 'ur';
    if (lang === 'sv') return 'sv';
    return 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
