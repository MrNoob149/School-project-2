const TRANSLATE_API = "http://127.0.0.1:5000/translate";
let currentAutoLanguage = "en";
const originalTexts = new WeakMap();
const translationCache = new Map();
async function translateText(text, language) {
  if (!text.trim() || language === "en") {
    return text;
  }
  const cacheKey = `${language}:${text}`;
  if (!translationCache.has(cacheKey)) {
    const request = fetch(TRANSLATE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: language,
        format: "text",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Translation failed");
        }
        return response.json();
      })
      .then((data) => data.translatedText)
      .catch((error) => {
        console.error(error);
        return text;
      });

    translationCache.set(cacheKey, request);
  }
  return translationCache.get(cacheKey);
}
async function translatePage(language) {
  currentAutoLanguage = language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (
      !parent ||
      parent.closest(
        '[data-tns], [translate="no"], button, input, select, textarea, script, style, noscript, [aria-hidden="true"]',
      ) ||
      !node.textContent.trim()
    ) {
      continue;
    }
    nodes.push(node);
  }
  for (const textNode of nodes) {
    if (!originalTexts.has(textNode)) {
      originalTexts.set(textNode, textNode.textContent);
    }
    const original = originalTexts.get(textNode);
    if (language === "en") {
      textNode.textContent = original;
      continue;
    }
    const translated = await translateText(original, language);
    if (currentAutoLanguage === language && textNode.isConnected) {
      textNode.textContent = translated;
    }
  }
}
window.translatePage = translatePage;
// & "$env:APPDATA\Python\Python314\Scripts\libretranslate.exe" --load-only en,vi
