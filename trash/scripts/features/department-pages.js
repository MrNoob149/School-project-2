import {
  departmentNames,
  departmentProjects,
} from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";

export function createDepartmentPages() {
  const page = document.querySelector("#department-page");
  const number = document.querySelector("#department-number");
  const title = document.querySelector("#department-title");
  const projectGrid = document.querySelector("#department-project-grid");
  const browserLayout = document.querySelector("#department-browser-layout");
  const projectPreview = document.querySelector(
    "#department-project-preview",
  );
  const similarProjectFilter = document.querySelector(
    "#similar-project-filter",
  );
  const similarProjectGrid = document.querySelector("#similar-project-grid");
  const similarProjectBrowser = document.querySelector(
    "#similar-project-browser",
  );
  const similarProjectPreview = document.querySelector(
    "#similar-project-preview",
  );
  const similarProjectEmpty = document.querySelector("#similar-project-empty");

  let currentDepartmentId = null;
  let selectedProjectIndex = null;
  let selectedSimilarProjectIndex = null;

  function renderFeaturedProjects() {
    const visibleProjects = departmentProjects.filter(
      (project) => project.department === currentDepartmentId,
    );

    projectGrid.innerHTML = visibleProjects
      .map(
        (project, index) => `
          <button
            class="department-project-card"
            type="button"
            data-department-project-index="${index}"
            aria-pressed="${selectedProjectIndex === index}"
          >
            <img src="${escapeHtml(project.image)}" alt="" />
            <span class="department-project-card-copy">
              <small>${escapeHtml(project.category)}</small>
              <strong>${escapeHtml(project.title)}</strong>
            </span>
          </button>
        `,
      )
      .join("");

    const project = visibleProjects[selectedProjectIndex];
    browserLayout.classList.toggle("has-selection", Boolean(project));
    projectPreview.setAttribute("aria-hidden", String(!project));
    projectPreview.inert = !project;
    projectPreview.innerHTML = project
      ? `
          <div class="department-preview-heading">
            <div>
              <p class="project-category">${escapeHtml(project.category)}</p>
              <h2>${escapeHtml(project.title)}</h2>
            </div>
            <img
              class="department-preview-image"
              src="${escapeHtml(project.image)}"
              alt="Artwork for ${escapeHtml(project.title)}"
            />
          </div>
          <p class="department-preview-description">${escapeHtml(project.description)}</p>
          <p class="department-preview-paragraph">${escapeHtml(project.firstParagraph)}</p>
          <p class="department-preview-footer">Created by ${escapeHtml(project.student)}</p>
        `
      : "";
  }

  function getSimilarProjects() {
    const filter = similarProjectFilter.value;
    return departmentProjects.filter((project) => {
      if (filter === "current") {
        return project.department === currentDepartmentId;
      }
      if (filter === "other") {
        return project.department !== currentDepartmentId;
      }
      if (filter === "all") return true;
      return project.department === Number(filter);
    });
  }

  function renderSimilarProjects() {
    const visibleProjects = getSimilarProjects();
    if (selectedSimilarProjectIndex >= visibleProjects.length) {
      selectedSimilarProjectIndex = null;
    }

    similarProjectGrid.innerHTML = visibleProjects
      .map(
        (project, index) => `
          <button
            class="similar-project-card"
            type="button"
            data-similar-project-index="${index}"
            aria-pressed="${selectedSimilarProjectIndex === index}"
          >
            <img src="${escapeHtml(project.image)}" alt="" />
            <span class="similar-project-card-copy">
              <small>${escapeHtml(departmentNames[project.department])} · ${escapeHtml(project.category)}</small>
              <strong>${escapeHtml(project.title)}</strong>
              <span>${escapeHtml(project.description)}</span>
            </span>
          </button>
        `,
      )
      .join("");

    const project = visibleProjects[selectedSimilarProjectIndex];
    similarProjectBrowser.classList.toggle("has-selection", Boolean(project));
    similarProjectPreview.setAttribute("aria-hidden", String(!project));
    similarProjectPreview.inert = !project;
    similarProjectEmpty.hidden = visibleProjects.length > 0;
    similarProjectPreview.innerHTML = project
      ? `
          <div class="department-preview-heading">
            <div>
              <p class="project-category">${escapeHtml(departmentNames[project.department])} · ${escapeHtml(project.category)}</p>
              <h3>${escapeHtml(project.title)}</h3>
            </div>
            <img
              class="department-preview-image"
              src="${escapeHtml(project.image)}"
              alt="Artwork for ${escapeHtml(project.title)}"
            />
          </div>
          <p class="department-preview-description">${escapeHtml(project.description)}</p>
          <p class="department-preview-paragraph">${escapeHtml(project.firstParagraph)}</p>
          <p class="department-preview-footer">Created by ${escapeHtml(project.student)}</p>
        `
      : "";
  }

  function show(departmentId) {
    currentDepartmentId = departmentId;
    selectedProjectIndex = null;
    selectedSimilarProjectIndex = null;
    similarProjectFilter.value = "other";
    page.hidden = false;
    number.textContent = departmentNames[departmentId];
    title.textContent = departmentNames[departmentId];
    renderFeaturedProjects();
    renderSimilarProjects();
  }

  function hide() {
    page.hidden = true;
    currentDepartmentId = null;
    selectedProjectIndex = null;
    selectedSimilarProjectIndex = null;
  }

  projectGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-department-project-index]");
    if (!card) return;

    selectedProjectIndex = Number(card.dataset.departmentProjectIndex);
    renderFeaturedProjects();
    projectGrid
      .querySelector(`[data-department-project-index="${selectedProjectIndex}"]`)
      ?.focus({ preventScroll: true });
  });

  similarProjectFilter.addEventListener("change", () => {
    selectedSimilarProjectIndex = null;
    renderSimilarProjects();
  });

  similarProjectGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-similar-project-index]");
    if (!card) return;

    selectedSimilarProjectIndex = Number(card.dataset.similarProjectIndex);
    renderSimilarProjects();
    similarProjectGrid
      .querySelector(
        `[data-similar-project-index="${selectedSimilarProjectIndex}"]`,
      )
      ?.focus({ preventScroll: true });
  });

  return { show, hide };
}
