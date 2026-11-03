const TRANSLATE_API = "/api/translate";
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
          throw new Error(
            `Translation request failed: ${response.status} ${response.statusText}`,
          );
        }
        return response.json();
      })
      .then((data) => {
        if (typeof data.translatedText !== "string") {
          throw new Error("Translation API returned an invalid response");
        }
        return data.translatedText;
      })
      .catch((error) => {
        console.error(error);
        translationCache.delete(cacheKey);
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
        '[data-tns], [translate="no"], .language-switcher, input, select, textarea, script, style, noscript, [aria-hidden="true"]',
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

export { translatePage };
// & "$env:APPDATA\Python\Python314\Scripts\libretranslate.exe" --load-only en,vi
