/** Client-side clarification when API is unreachable — match user message language, not site UI locale. */
const CLARIFICATION: Record<string, string> = {
  ka: 'ამ საკითხთან დაკავშირებით ინფორმაციის დაზუსტება მჭირდება. როგორც კი დავაზუსტებ, გაგცემთ პასუხს.',
  en: 'I need to clarify this information. As soon as I have it confirmed, I will get back to you with an answer.',
  ru: 'По этому вопросу мне нужно уточнить информацию. Как только уточню, дам вам ответ.',
  fr: "J'ai besoin de clarifier cette information. Dès que ce sera confirmé, je vous répondrai.",
  de: 'Dazu muss ich die Information noch klären. Sobald ich sie bestätigt habe, antworte ich Ihnen.',
  tr: 'Bu konuyla ilgili bilgiyi netleştirmem gerekiyor. Netleşir netleşmez size yanıt vereceğim.',
  ar: 'أحتاج إلى توضيح هذه المعلومات. بمجرد التأكد منها سأعود إليك بالإجابة.',
}

export function detectMessageLanguage(text: string): string {
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka'
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'
  const lower = text.toLowerCase()
  if (/\b(und|nicht|bitte|danke)\b/.test(lower)) return 'de'
  if (/\b(et|pour|merci|bonjour)\b/.test(lower)) return 'fr'
  if (/\b(ve|için|merhaba|teşekkür)\b/.test(lower)) return 'tr'
  return 'en'
}

export function clarificationReply(message: string) {
  const lang = detectMessageLanguage(message)
  return CLARIFICATION[lang] ?? CLARIFICATION.en
}
