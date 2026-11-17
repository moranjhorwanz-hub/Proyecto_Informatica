import { translations } from '../data/translations.js';

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const templates = Object.keys(translations.es).filter(key => key.includes('{')).map(key => {
  const names = [];
  const pattern = key.split(/(\{\w+\})/).map(part => {
    if (!part.startsWith('{')) return escape(part);
    names.push(part.slice(1, -1)); return '(.+?)';
  }).join('');
  return { key, names, regex: new RegExp(`^${pattern}$`, 'i') };
});
const upperKeys = new Map(Object.keys(translations.es).map(key => [key.toUpperCase(), key]));

export function translate(value, language = 'es', depth = 0) {
  if (Array.isArray(value)) return value.map(line => translate(line, language));
  if (value == null) return '';
  const source = String(value), dictionary = translations[language];
  if (!dictionary || language === 'es' || depth > 8 || !source) return source;
  if (Object.hasOwn(dictionary, source)) return dictionary[source];
  const upper = source === source.toUpperCase();
  if (upper && upperKeys.has(source)) return dictionary[upperKeys.get(source)].toUpperCase();
  for (const { key, names, regex } of templates) {
    const match = source.match(regex);
    if (match) {
      const params = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
      const result = dictionary[key].replace(/\{(\w+)\}/g, (_, name) => translate(params[name], language, depth + 1));
      return upper ? result.toUpperCase() : result;
    }
  }
  const parts = source.split(/(\n| · | {2,}| \/ |: )/);
  if (parts.length > 1) return parts.map((part, index) => index % 2 ? part : translate(part, language, depth + 1)).join('');
  const prefix = source.match(/^([←→♪◈] )(.+)$/);
  if (prefix) return prefix[1] + translate(prefix[2], language, depth + 1);
  const suffix = source.match(/^(.+?)( →| ✓| \([A-Z]+\)|\.)$/);
  if (suffix) return translate(suffix[1], language, depth + 1) + suffix[2];
  return source;
}
