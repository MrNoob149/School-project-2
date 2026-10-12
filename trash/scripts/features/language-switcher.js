const translations = {
  en: {
    home: "Home",
    recent: "Recent projects",
    popular: "Popular projects",
    searchPlaceholder: "Search projects...",
    title: "Student work, on display",
    subtitle: "Ideas worth",
    subtitle2: "showing off.",
    description:
      "A living collection of the projects, experiments, and big ideas being made across Swinburne.",
    browseProjects: "Browse projects",
  },
  vi: {
    home: "Trang chủ",
    recent: "Dự án gần đây",
    popular: "Dự án phổ biến",
    searchPlaceholder: "Tìm kiếm dự án...",
    title: "Sản phẩm sinh viên, lên sàn",
    subtitle: "Ý tưởng",
    subtitle2: "đáng chiêm ngưỡng.",
    description:
      "Một bộ sưu tập các dự án, thí nghiệm và những ý tưởng lớn sống động được thực hiện tại Swinburne.",
    browseProjects: "Xem các dự án",
  },
};

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
