import { translations } from "../data/translations.js";

export function initializeLanguageSwitcher() {
  const englishButton = document.querySelector("#lang-en");
  const vietnameseButton = document.querySelector("#lang-vi");
  const placeholder = document.querySelector("[data-tns-placeholder]");

  function changeLanguage(language) {
    document.querySelectorAll("[data-tns]").forEach((element) => {
      const key = element.dataset.tns;
      element.textContent = translations[language][key];
    });
    placeholder.placeholder =
      translations[language][placeholder.dataset.tnsPlaceholder];
    englishButton.classList.toggle("active", language === "en");
    vietnameseButton.classList.toggle("active", language === "vi");
  }

  englishButton.addEventListener("click", () => changeLanguage("en"));
  vietnameseButton.addEventListener("click", () => changeLanguage("vi"));
}
