import { createDepartmentPages } from "./scripts/features/department-pages.js";
import { initializeContactForm } from "./scripts/features/contact-form.js";
import { createHomepageProjects } from "./scripts/features/homepage-projects.js";
import { initializeLanguageSwitcher } from "./scripts/features/language-switcher.js";
import { initializeNavigation } from "./scripts/features/navigation.js";
import { createProjectPage } from "./scripts/features/project-page.js";

const intro = document.querySelector(".intro");
const departmentDirectory = document.querySelector(".department-directory");
const aboutPage = document.querySelector("#about-page");
const aboutSwinburnePage = document.querySelector("#about-swinburne-page");
const aboutContributorsPage = document.querySelector(
  "#about-contributors-page",
);
const showcase = document.querySelector(".showcase");
const behindScenesCarousel = document.querySelector("#behind-scenes-carousel");
const behindScenesPrevious = document.querySelector("#behind-scenes-previous");
const behindScenesNext = document.querySelector("#behind-scenes-next");

function updateBehindScenesControls() {
  const maxScroll =
    behindScenesCarousel.scrollWidth - behindScenesCarousel.clientWidth;
  behindScenesPrevious.disabled = behindScenesCarousel.scrollLeft <= 2;
  behindScenesNext.disabled =
    maxScroll <= 2 || behindScenesCarousel.scrollLeft >= maxScroll - 2;
}

behindScenesPrevious.addEventListener("click", () => {
  behindScenesCarousel.scrollBy({
    left: -behindScenesCarousel.clientWidth * 0.82,
    behavior: "smooth",
  });
});
behindScenesNext.addEventListener("click", () => {
  behindScenesCarousel.scrollBy({
    left: behindScenesCarousel.clientWidth * 0.82,
    behavior: "smooth",
  });
});
behindScenesCarousel.addEventListener("scroll", updateBehindScenesControls, {
  passive: true,
});
window.addEventListener("resize", updateBehindScenesControls);

const homepageProjects = createHomepageProjects();
const departmentPages = createDepartmentPages();
const projectPage = createProjectPage();

initializeNavigation({
  onViewChange(view) {
    delete document.body.dataset.aboutPage;
    projectPage.hide();
    departmentPages.hide();
    aboutPage.hidden = true;
    intro.hidden = false;
    departmentDirectory.hidden = false;
    showcase.hidden = false;
    homepageProjects.setView(view);
  },
  onDepartmentChange(departmentId) {
    delete document.body.dataset.aboutPage;
    projectPage.hide();
    aboutPage.hidden = true;
    intro.hidden = true;
    departmentDirectory.hidden = true;
    showcase.hidden = true;
    departmentPages.show(departmentId);
  },
  onAboutChange(page) {
    document.body.dataset.aboutPage = page;
    projectPage.hide();
    departmentPages.hide();
    intro.hidden = true;
    departmentDirectory.hidden = true;
    showcase.hidden = true;
    aboutPage.hidden = false;
    aboutSwinburnePage.hidden = page !== "swinburne";
    aboutContributorsPage.hidden = page !== "contributors";
    requestAnimationFrame(updateBehindScenesControls);
  },
  onProjectChange(slug) {
    delete document.body.dataset.aboutPage;
    departmentPages.hide();
    aboutPage.hidden = true;
    intro.hidden = true;
    departmentDirectory.hidden = true;
    showcase.hidden = true;
    return projectPage.show(slug);
  },
});

initializeLanguageSwitcher();
initializeContactForm();

const schoolSlider = document.querySelector(".school-slider");
if (schoolSlider) {
  const slideCaptions = [
    "Students/Campus/Activities",
    "Student Projects",
    "Campus Life",
    "Student Community",
  ];
  const slideCaption = document.querySelector("#school-slide-caption");
  const slideDots = [...schoolSlider.querySelectorAll("[data-school-dot]")];
  let activeSlide = 0;

  function showSchoolSlide(index) {
    activeSlide = (index + slideCaptions.length) % slideCaptions.length;
    slideCaption.textContent = slideCaptions[activeSlide];
    schoolSlider.className = `school-slider is-slide-${activeSlide}`;
    slideDots.forEach((dot, dotIndex) => {
      if (dotIndex === activeSlide) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  schoolSlider
    .querySelector('[data-school-slide="previous"]')
    .addEventListener("click", () => showSchoolSlide(activeSlide - 1));
  schoolSlider
    .querySelector('[data-school-slide="next"]')
    .addEventListener("click", () => showSchoolSlide(activeSlide + 1));
  slideDots.forEach((dot) => {
    dot.addEventListener("click", () =>
      showSchoolSlide(Number(dot.dataset.schoolDot)),
    );
  });
}