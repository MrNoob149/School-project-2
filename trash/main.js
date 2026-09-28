const grid = document.querySelector("#project-grid");
const emptyState = document.querySelector("#empty-state");
const projectCount = document.querySelector("#project-count");
const browserLayout = document.querySelector("#browser-layout");
const projectPreview = document.querySelector("#project-preview");
const navLinks = document.querySelectorAll("[data-view]");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#project-search");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

let selectedProjectIndex = null;
let currentView = "home";

const projects = [
  {
    title: "A quieter kind of city",
    description:
      "An illustrated field guide to finding calm in the middle of Melbourne.",
    category: "Communication design",
    student: "Maya Chen",
    year: "2026",
    popularity: 96,
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Second nature",
    description:
      "A speculative installation exploring the relationship between people and plants.",
    category: "Interior architecture",
    student: "Oliver Reed",
    year: "2026",
    popularity: 88,
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Objects with a past",
    description:
      "A photographic study of the traces people leave behind in everyday objects.",
    category: "Photography",
    student: "Amara Patel",
    year: "2026",
    popularity: 91,
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
  },
];

function escapeHtml(value) {
  return String(value || "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

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
    return filteredProjects.sort((first, second) => second.year - first.year);
  }

  return filteredProjects;
}

function renderProjects() {
  const visibleProjects = getVisibleProjects();
  const viewLabel = searchInput.value.trim()
    ? "Search results"
    : currentView === "popular"
      ? "Popular projects"
      : currentView === "recent"
        ? "Recent projects"
        : "Latest projects";

  document.querySelector("#showcase-title").textContent = viewLabel;
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

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    currentView = link.dataset.view;
    selectedProjectIndex = null;
    navLinks.forEach((navLink) => {
      const isCurrent = navLink === link;
      navLink.classList.toggle("is-active", isCurrent);
      navLink.toggleAttribute("aria-current", isCurrent);
    });
    renderProjects();
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    (currentView === "home"
      ? document.querySelector("#top")
      : document.querySelector("#showcase-title")
    )?.scrollIntoView({ behavior: "smooth" });
  });
});

searchInput.addEventListener("input", () => {
  selectedProjectIndex = null;
  renderProjects();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  selectedProjectIndex = null;
  renderProjects();
  document
    .querySelector("#showcase-title")
    ?.scrollIntoView({ behavior: "smooth" });
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mainNav.classList.toggle("is-open", !isOpen);
});

grid.addEventListener("click", (event) => {
  const row = event.target.closest("[data-project-index]");
  if (!row) return;

  selectedProjectIndex = Number(row.dataset.projectIndex);
  renderProjects();
  grid.querySelector(`[data-project-index="${selectedProjectIndex}"]`)?.focus({
    preventScroll: true,
  });
});

projectPreview.addEventListener("click", (event) => {
  if (!event.target.closest("[data-close-preview]")) return;

  const closedIndex = selectedProjectIndex;
  selectedProjectIndex = null;
  renderProjects();
  grid.querySelector(`[data-project-index="${closedIndex}"]`)?.focus({
    preventScroll: true,
  });
});

renderProjects();
