export type LocaleInfo = { code: string; name: string };

// Curated locales list (can be expanded). 'system' will be provided as a default option by pickers.
export const LOCALES: LocaleInfo[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)' },
  { code: 'fr-FR', name: 'Français (France)' },
  { code: 'es-ES', name: 'Español (España)' },
  { code: 'it-IT', name: 'Italiano (Italia)' },
  { code: 'pt-PT', name: 'Português (Portugal)' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'nl-NL', name: 'Nederlands (Nederland)' },
  { code: 'sv-SE', name: 'Svenska (Sverige)' },
  { code: 'pl-PL', name: 'Polski (Polska)' },
  { code: 'tr-TR', name: 'Türkçe (Türkiye)' },
  { code: 'ru-RU', name: 'Русский (Россия)' },
  { code: 'ja-JP', name: '日本語（日本）' },
  { code: 'ko-KR', name: '한국어(대한민국)' },
  { code: 'zh-CN', name: '简体中文（中国大陆）' },
  { code: 'zh-TW', name: '繁體中文（台灣）' },
  { code: 'hi-IN', name: 'हिन्दी (भारत)' },
  { code: 'ar-SA', name: 'العربية (السعودية)' },
];
