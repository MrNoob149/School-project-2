import { escapeHtml } from "../utils/html.js";
import { fetchProjects } from "../utils/fetch-projects.js";

export function createHomepageProjects() {
  const grid = document.querySelector("#project-grid");
  const emptyState = document.querySelector("#empty-state");
  const projectCount = document.querySelector("#project-count");
  const projectPrevious = document.querySelector("#project-previous");
  const projectNext = document.querySelector("#project-next");

  let showcaseProjects = [];
  let currentView = "home";

  // Convert database records into the format used by the frontend
  function formatProjects(databaseProjects) {
    return databaseProjects.map((project) => ({
      id: project.id,
      title: project.Title,
      description: project.Description,
      createdAt: project.CreatedAt,
      year: new Date(project.CreatedAt).getFullYear(),
      image: project.Image || "",
      category: project.Category || "Student project",
      student: project.Student || "Swinburne student",
    }));
  }

  function getProjectSlug(project) {
    return project.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function updateCarouselControls() {
    const maxScroll = grid.scrollWidth - grid.clientWidth;

    projectPrevious.disabled = grid.scrollLeft <= 2;
    projectNext.disabled =
      maxScroll <= 2 || grid.scrollLeft >= maxScroll - 2;
  }

  function getVisibleProjects() {
    const visibleProjects = [...showcaseProjects];

    if (currentView === "recent") {
      return visibleProjects.sort(
        (first, second) =>
          new Date(second.createdAt) - new Date(first.createdAt)
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
            aria-label="${escapeHtml(project.title)}, by ${escapeHtml(project.student)}">
            ${
              project.image
                ? `<img class="project-card-image" src="${escapeHtml(project.image)}" alt="" loading="lazy" />`
                : ""
            }

            <span class="project-row-copy">
              <span class="project-row-title">
                ${escapeHtml(project.title)}
              </span>

              <span class="project-row-meta">
                ${escapeHtml(project.category)}
              </span>

              <span class="project-row-description">
                ${escapeHtml(project.description || "")}
              </span>
            </span>
          </a>
        `
      )
      .join("");

    emptyState.hidden = visibleProjects.length > 0;

    projectCount.textContent =
      `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;

    grid.scrollLeft = 0;

    requestAnimationFrame(updateCarouselControls);
  }

  function setView(view) {
    currentView = view;
    render();
  }

  projectPrevious.addEventListener("click", () => {
    grid.scrollBy({
      left: -grid.clientWidth * 0.82,
      behavior: "smooth",
    });
  });

  projectNext.addEventListener("click", () => {
    grid.scrollBy({
      left: grid.clientWidth * 0.82,
      behavior: "smooth",
    });
  });

  grid.addEventListener("scroll", updateCarouselControls, {
    passive: true,
  });

  window.addEventListener("resize", updateCarouselControls);

  // Load projects from the database
  async function loadProjects() {
    const databaseProjects = await fetchProjects();

    showcaseProjects = formatProjects(databaseProjects);

    render();
  }

  grid.innerHTML = "<p>Loading projects...</p>";
  loadProjects();

  return { setView };
}
