import {
  departmentExpertise,
  departmentNames,
  departmentProjects,
  getProjectSlug,
} from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";

export function createDepartmentPages() {
  const page = document.querySelector("#department-page");
  const number = document.querySelector("#department-number");
  const title = document.querySelector("#department-title");
  const projectGrid = document.querySelector("#department-project-grid");
  const expertiseCarousel = document.querySelector("#expertise-carousel");
  const expertisePrevious = document.querySelector("#expertise-previous");
  const expertiseNext = document.querySelector("#expertise-next");
  const projectsPrevious = document.querySelector(
    "#department-projects-previous",
  );
  const projectsNext = document.querySelector("#department-projects-next");
  const similarProjectFilter = document.querySelector(
    "#similar-project-filter",
  );
  const similarProjectGrid = document.querySelector("#similar-project-grid");
  const similarProjectEmpty = document.querySelector("#similar-project-empty");

  let currentDepartmentId = null;

  function updateCarouselControls(carousel, previous, next) {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= maxScroll - 2;
  }

  function renderExpertise() {
    expertiseCarousel.innerHTML = departmentExpertise[currentDepartmentId]
      .map(
        (expertise, index) => `
          <article class="expertise-card">
            <span class="expertise-card-index">0${index + 1} / 0${departmentExpertise[currentDepartmentId].length}</span>
            <span class="expertise-card-mark" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(expertise.title)}</h3>
            <p>${escapeHtml(expertise.description)}</p>
          </article>
        `,
      )
      .join("");
    expertiseCarousel.scrollLeft = 0;
    requestAnimationFrame(() =>
      updateCarouselControls(
        expertiseCarousel,
        expertisePrevious,
        expertiseNext,
      ),
    );
  }

  function renderFeaturedProjects() {
    const visibleProjects = departmentProjects.filter(
      (project) => project.department === currentDepartmentId,
    );

    projectGrid.innerHTML = visibleProjects
      .map(
        (project) => `
          <a
            class="department-project-card"
            href="#/project/${escapeHtml(getProjectSlug(project))}"
          >
            <img src="${escapeHtml(project.image)}" alt="" />
            <span class="department-project-card-copy">
              <small>${escapeHtml(project.category)}</small>
              <strong>${escapeHtml(project.title)}</strong>
            </span>
            <span class="department-card-arrow" aria-hidden="true">↗</span>
          </a>
        `,
      )
      .join("");
    projectGrid.scrollLeft = 0;
    requestAnimationFrame(() =>
      updateCarouselControls(projectGrid, projectsPrevious, projectsNext),
    );
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

    similarProjectGrid.innerHTML = visibleProjects
      .map(
        (project) => `
          <a
            class="similar-project-card"
            href="#/project/${escapeHtml(getProjectSlug(project))}"
          >
            <img src="${escapeHtml(project.image)}" alt="" />
            <span class="similar-project-card-copy">
              <small>${escapeHtml(departmentNames[project.department])} · ${escapeHtml(project.category)}</small>
              <strong>${escapeHtml(project.title)}</strong>
              <span>${escapeHtml(project.description)}</span>
            </span>
            <span class="similar-project-arrow" aria-hidden="true">↗</span>
          </a>
        `,
      )
      .join("");

    similarProjectEmpty.hidden = visibleProjects.length > 0;
  }

  function show(departmentId) {
    currentDepartmentId = departmentId;
    similarProjectFilter.value = "other";
    page.hidden = false;
    number.textContent = departmentNames[departmentId];
    title.textContent = departmentNames[departmentId];
    renderExpertise();
    renderFeaturedProjects();
    renderSimilarProjects();
  }

  function hide() {
    page.hidden = true;
    currentDepartmentId = null;
  }

  similarProjectFilter.addEventListener("change", () => {
    renderSimilarProjects();
  });

  expertisePrevious.addEventListener("click", () => {
    expertiseCarousel.scrollBy({
      left: -expertiseCarousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  });
  expertiseNext.addEventListener("click", () => {
    expertiseCarousel.scrollBy({
      left: expertiseCarousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  });
  projectsPrevious.addEventListener("click", () => {
    projectGrid.scrollBy({
      left: -projectGrid.clientWidth * 0.8,
      behavior: "smooth",
    });
  });
  projectsNext.addEventListener("click", () => {
    projectGrid.scrollBy({
      left: projectGrid.clientWidth * 0.8,
      behavior: "smooth",
    });
  });
  expertiseCarousel.addEventListener(
    "scroll",
    () =>
      updateCarouselControls(
        expertiseCarousel,
        expertisePrevious,
        expertiseNext,
      ),
    { passive: true },
  );
  projectGrid.addEventListener(
    "scroll",
    () => updateCarouselControls(projectGrid, projectsPrevious, projectsNext),
    { passive: true },
  );
  window.addEventListener("resize", () => {
    if (currentDepartmentId === null) return;
    updateCarouselControls(
      expertiseCarousel,
      expertisePrevious,
      expertiseNext,
    );
    updateCarouselControls(projectGrid, projectsPrevious, projectsNext);
  });

  return { show, hide };
}
