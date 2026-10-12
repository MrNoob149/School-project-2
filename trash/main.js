import { createDepartmentPages } from "./scripts/features/department-pages.js";
import { initializeContactForm } from "./scripts/features/contact-form.js";
import { createHomepageProjects } from "./scripts/features/homepage-projects.js";
import { initializeLanguageSwitcher } from "./scripts/features/language-switcher.js";
import { initializeNavigation } from "./scripts/features/navigation.js";

const intro = document.querySelector(".intro");
const showcase = document.querySelector(".showcase");

const homepageProjects = createHomepageProjects();
const departmentPages = createDepartmentPages();

initializeNavigation({
  onViewChange(view) {
    departmentPages.hide();
    intro.hidden = false;
    showcase.hidden = false;
    homepageProjects.setView(view);
  },
  onDepartmentChange(departmentId) {
    homepageProjects.clearSearch();
    intro.hidden = true;
    showcase.hidden = true;
    departmentPages.show(departmentId);
  },
});

initializeLanguageSwitcher();
initializeContactForm();
