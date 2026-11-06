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
  const projectPrevious = document.querySelector("#project-previous");
  const projectNext = document.querySelector("#project-next");
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
    const visibleProjects = [...showcaseProjects];

    if (currentView === "recent") {
      return visibleProjects.sort(
        (first, second) =>
          Number(second.year ?? 0) - Number(first.year ?? 0),
      );
    }

    return visibleProjects;
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

    emptyState.hidden = visibleProjects.length > 0;
    projectCount.textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;
    grid.scrollLeft = 0;
    requestAnimationFrame(updateCarouselControls);
  }

  function setView(view) {
    currentView = view;
    render();
  }

  projectPrevious.addEventListener("click", () => {
    grid.scrollBy({ left: -grid.clientWidth * 0.82, behavior: "smooth" });
  });
  projectNext.addEventListener("click", () => {
    grid.scrollBy({ left: grid.clientWidth * 0.82, behavior: "smooth" });
  });
  grid.addEventListener("scroll", updateCarouselControls, { passive: true });
  window.addEventListener("resize", updateCarouselControls);

  render();

  return { setView };
}
