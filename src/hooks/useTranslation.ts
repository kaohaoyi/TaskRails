import { useState, useEffect } from 'react';
import { zh_TW, TranslationType } from '../locales/zh-TW';
import { zh_CN } from '../locales/zh-CN';
import { en_US } from '../locales/en-US';
import { ja_JP } from '../locales/ja-JP';
import { es_ES } from '../locales/es-ES';
import { fr_FR } from '../locales/fr-FR';
import { de_DE } from '../locales/de-DE';

// Define available languages
export type LanguageCode = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'es-ES' | 'fr-FR' | 'de-DE';

const languages: Record<LanguageCode, TranslationType> = {
  'zh-TW': zh_TW,
  'zh-CN': zh_CN,
  'en-US': en_US,
  'ja-JP': ja_JP,
  'es-ES': es_ES,
  'fr-FR': fr_FR,
  'de-DE': de_DE,
};

// Simple event bus for language changes
const languageEventTarget = new EventTarget();

export function setLanguage(lang: LanguageCode) {
    localStorage.setItem('taskrails_lang', lang);
    languageEventTarget.dispatchEvent(new CustomEvent('lang_change', { detail: lang }));
}

export function getLanguage(): LanguageCode {
    return (localStorage.getItem('taskrails_lang') as LanguageCode) || 'zh-TW';
}

export function useTranslation(): TranslationType {
  const [lang, setLang] = useState<LanguageCode>(getLanguage());

  useEffect(() => {
    const handleLangChange = (e: any) => {
        setLang(e.detail);
    };
    languageEventTarget.addEventListener('lang_change', handleLangChange);
    return () => {
        languageEventTarget.removeEventListener('lang_change', handleLangChange);
    };
  }, []);

  return languages[lang] || languages['zh-TW'];
}
