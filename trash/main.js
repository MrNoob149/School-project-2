import { createDepartmentPages } from "./scripts/features/department-pages.js";
import { initializeContactForm } from "./scripts/features/contact-form.js";
import { createHomepageProjects } from "./scripts/features/homepage-projects.js";
import { initializeLanguageSwitcher } from "./scripts/features/language-switcher.js";
import { initializeNavigation } from "./scripts/features/navigation.js";
import { createProjectPage } from "./scripts/features/project-page.js";
require('dotenv').config();

const intro = document.querySelector(".intro");
const departmentDirectory = document.querySelector(".department-directory");
const showcase = document.querySelector(".showcase");

const homepageProjects = createHomepageProjects();
const departmentPages = createDepartmentPages();
const projectPage = createProjectPage();

initializeNavigation({
  onViewChange(view) {
    projectPage.hide();
    departmentPages.hide();
    intro.hidden = false;
    departmentDirectory.hidden = false;
    showcase.hidden = false;
    homepageProjects.setView(view);
  },
  onDepartmentChange(departmentId) {
    projectPage.hide();
    homepageProjects.clearSearch();
    intro.hidden = true;
    departmentDirectory.hidden = true;
    showcase.hidden = true;
    departmentPages.show(departmentId);
  },
  onProjectChange(slug) {
    departmentPages.hide();
    intro.hidden = true;
    departmentDirectory.hidden = true;
    showcase.hidden = true;
    return projectPage.show(slug);
  },
});

initializeLanguageSwitcher();
initializeContactForm();
