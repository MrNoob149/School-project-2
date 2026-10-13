import { projects } from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";

export function createHomepageProjects() {
  const grid = document.querySelector("#project-grid");
  const emptyState = document.querySelector("#empty-state");
  const projectCount = document.querySelector("#project-count");
  const browserLayout = document.querySelector("#browser-layout");
  const projectPreview = document.querySelector("#project-preview");
  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#project-search");
  const showcaseTitle = document.querySelector("#showcase-title");

  let selectedProjectIndex = null;
  let currentView = "home";

  function getVisibleProjects() {
    const query = searchInput.value.trim().toLowerCase();
    const filteredProjects = projects.filter((project) => {
      const searchableText =
        `${project.title} ${project.description} ${project.category} ${project.student}`.toLowerCase();
      return searchableText.includes(query);
    });

    if (currentView === "popular") {
      return filteredProjects.sort(
        (first, second) => second.popularity - first.popularity,
      );
    }

    if (currentView === "recent") {
      return filteredProjects.sort(
        (first, second) => second.year - first.year,
      );
    }

    return filteredProjects;
  }

  function render() {
    const visibleProjects = getVisibleProjects();
    const viewLabel = searchInput.value.trim()
      ? "Search results"
      : currentView === "popular"
        ? "Popular projects"
        : currentView === "recent"
          ? "Recent projects"
          : "Latest projects";

    showcaseTitle.textContent = viewLabel;
    grid.innerHTML = visibleProjects
      .map(
        (project, index) => `
          <button
            class="project-row"
            type="button"
            data-project-index="${index}"
            aria-pressed="${selectedProjectIndex === index}"
          >
            <span class="project-row-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="project-row-copy">
              <span class="project-row-title">${escapeHtml(project.title)}</span>
              <span class="project-row-meta">${escapeHtml(project.student || "Swinburne student")} · ${escapeHtml(project.category || "Student project")} · ${escapeHtml(project.year || "Recent")}</span>
            </span>
            <span class="project-row-arrow" aria-hidden="true">&#8594;</span>
          </button>
        `,
      )
      .join("");

    emptyState.hidden = visibleProjects.length > 0;
    projectCount.textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;

    const project = visibleProjects[selectedProjectIndex];
    browserLayout.classList.toggle("has-selection", Boolean(project));
    projectPreview.setAttribute("aria-hidden", String(!project));
    projectPreview.inert = !project;
    projectPreview.innerHTML = project
      ? `
          <img class="preview-image" src="${escapeHtml(project.image)}" alt="Artwork for ${escapeHtml(project.title)}" />
          <div class="preview-copy">
            <div class="preview-topline">
              <p class="project-category">${escapeHtml(project.category || "Student project")}</p>
              <button class="preview-close" type="button" data-close-preview>Close</button>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p class="preview-description">${escapeHtml(project.description || "No description added.")}</p>
            <p class="preview-student">Created by <strong>${escapeHtml(project.student || "Swinburne student")}</strong> · ${escapeHtml(project.year || "Recent")}</p>
          </div>
        `
      : "";
  }

  function setView(view) {
    currentView = view;
    selectedProjectIndex = null;
    render();
  }

  function clearSearch() {
    searchInput.value = "";
    selectedProjectIndex = null;
    render();
  }

  searchInput.addEventListener("input", () => {
    selectedProjectIndex = null;
    render();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    selectedProjectIndex = null;
    render();
    showcaseTitle.scrollIntoView({ behavior: "smooth" });
  });

  grid.addEventListener("click", (event) => {
    const row = event.target.closest("[data-project-index]");
    if (!row) return;

    selectedProjectIndex = Number(row.dataset.projectIndex);
    render();
    grid
      .querySelector(`[data-project-index="${selectedProjectIndex}"]`)
      ?.focus({ preventScroll: true });
  });

  projectPreview.addEventListener("click", (event) => {
    if (!event.target.closest("[data-close-preview]")) return;

    const closedIndex = selectedProjectIndex;
    selectedProjectIndex = null;
    render();
    grid
      .querySelector(`[data-project-index="${closedIndex}"]`)
      ?.focus({ preventScroll: true });
  });

  render();

  return { setView, clearSearch };
}
