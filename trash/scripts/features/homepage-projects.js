import {
  departmentProjects,
  getProjectSlug,
  projects,
} from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";

export function createHomepageProjects() {
  const grid = document.querySelector("#project-grid");
  const emptyState = document.querySelector("#empty-state");
  const projectCount = document.querySelector("#project-count");
  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#project-search");
  const showcaseTitle = document.querySelector("#showcase-title");
  const projectPrevious = document.querySelector("#project-previous");
  const projectNext = document.querySelector("#project-next");
  const filterPrevious = document.querySelector("#filter-previous");
  const filterNext = document.querySelector("#filter-next");
  const projectFilters = [...document.querySelectorAll(".project-filter")];
  const projectViews = projectFilters.map((filter) => filter.dataset.view);
  const showcaseProjects = [
    ...projects,
    ...departmentProjects.filter(
      (departmentProject) =>
        !projects.some(
          (project) =>
            getProjectSlug(project) === getProjectSlug(departmentProject),
        ),
    ),
  ];

  let currentView = "home";

  function updateCarouselControls() {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    projectPrevious.disabled = grid.scrollLeft <= 2;
    projectNext.disabled = grid.scrollLeft >= maxScroll - 2;
  }

  function getVisibleProjects() {
    const query = searchInput.value.trim().toLowerCase();
    const filteredProjects = showcaseProjects.filter((project) => {
      const searchableText =
        `${project.title} ${project.description} ${project.category} ${project.student}`.toLowerCase();
      return searchableText.includes(query);
    });

    if (currentView === "popular") {
      return filteredProjects.sort(
        (first, second) =>
          (second.popularity ?? 0) - (first.popularity ?? 0),
      );
    }

    if (currentView === "recent") {
      return filteredProjects.sort(
        (first, second) =>
          Number(second.year ?? 0) - Number(first.year ?? 0),
      );
    }

    return filteredProjects;
  }

  function render() {
    const visibleProjects = getVisibleProjects();
    grid.innerHTML = visibleProjects
      .map(
        (project) => `
          <a
            class="project-row"
            href="#/project/${escapeHtml(getProjectSlug(project))}"
            aria-label="${escapeHtml(project.title)}, by ${escapeHtml(project.student || "Swinburne student")}"
          >
            <img class="project-card-image" src="${escapeHtml(project.image)}" alt="" loading="lazy" />
            <span class="project-row-copy">
              <span class="project-row-title">${escapeHtml(project.title)}</span>
              <span class="project-row-meta">${escapeHtml(project.category || "Student project")}</span>
              <span class="project-row-description">${escapeHtml(project.description || "")}</span>
            </span>
          </a>
        `,
      )
      .join("");

    projectFilters.forEach((filter) => {
      const activeView = currentView === "recent" ? "home" : currentView;
      const isActive = filter.dataset.view === activeView;
      filter.classList.toggle("is-active", isActive);
      if (isActive) filter.setAttribute("aria-current", "true");
      else filter.removeAttribute("aria-current");
    });
    emptyState.hidden = visibleProjects.length > 0;
    projectCount.textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;
    grid.scrollLeft = 0;
    requestAnimationFrame(updateCarouselControls);
  }

  function setView(view) {
    currentView = view;
    render();
  }

  function stepFilter(direction) {
    const activeView = currentView === "recent" ? "home" : currentView;
    const currentIndex = Math.max(0, projectViews.indexOf(activeView));
    const nextIndex =
      (currentIndex + direction + projectViews.length) % projectViews.length;
    setView(projectViews[nextIndex]);
  }

  function clearSearch() {
    searchInput.value = "";
    render();
  }

  searchInput.addEventListener("input", () => {
    render();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
    showcaseTitle.scrollIntoView({ behavior: "smooth" });
  });

  projectPrevious.addEventListener("click", () => {
    grid.scrollBy({ left: -grid.clientWidth * 0.82, behavior: "smooth" });
  });
  projectNext.addEventListener("click", () => {
    grid.scrollBy({ left: grid.clientWidth * 0.82, behavior: "smooth" });
  });
  grid.addEventListener("scroll", updateCarouselControls, { passive: true });
  filterPrevious.addEventListener("click", () => stepFilter(-1));
  filterNext.addEventListener("click", () => stepFilter(1));
  window.addEventListener("resize", updateCarouselControls);

  render();

  return { setView, clearSearch };
}
