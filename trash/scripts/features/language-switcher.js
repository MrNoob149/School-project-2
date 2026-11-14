import { translations } from "../data/translations.js";
import { translatePage } from "../../autotranslate.js";

export function initializeLanguageSwitcher() {
  const englishButton = document.querySelector("#lang-en");
  const vietnameseButton = document.querySelector("#lang-vi");

  function changeLanguage(language) {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-tns]").forEach((element) => {
      const key = element.dataset.tns;
      element.textContent = translations[language][key];
    });
    englishButton.classList.toggle("active", language === "en");
    vietnameseButton.classList.toggle("active", language === "vi");
    void translatePage(language);
  }

  englishButton.addEventListener("click", () => changeLanguage("en"));
  vietnameseButton.addEventListener("click", () => changeLanguage("vi"));
}
