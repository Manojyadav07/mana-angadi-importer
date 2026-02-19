import { transliterate as tr } from 'transliteration';

/**
 * Check if a string contains Telugu characters
 */
export function containsTelugu(text: string): boolean {
  // Telugu Unicode range: \u0C00-\u0C7F
  return /[\u0C00-\u0C7F]/.test(text);
}

/**
 * Transliterate text to Latin/English characters
 * If text contains Telugu, it will be converted to English
 * Otherwise, returns the original text
 */
export function transliterateToEnglish(text: string): string {
  if (!text || !text.trim()) return text;
  
  // If contains Telugu characters, transliterate
  if (containsTelugu(text)) {
    return tr(text);
  }
  
  // Already in English/Latin, return as-is
  return text;
}

/**
 * Get both original and transliterated versions
 * Returns { original, english } where english is auto-generated if needed
 */
export function getShopNamePair(shopName: string): { original: string; english: string } {
  const trimmed = shopName.trim();
  const english = transliterateToEnglish(trimmed);
  
  return {
    original: trimmed,
    english: english
  };
}
