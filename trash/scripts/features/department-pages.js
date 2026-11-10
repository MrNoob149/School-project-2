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
  const heroImage = document.querySelector("#department-hero-image");
  const projectGrid = document.querySelector("#department-project-grid");
  const expertiseCarousel = document.querySelector("#expertise-carousel");
  const expertiseDescription = document.querySelector("#expertise-description");
  const expertisePrevious = document.querySelector("#expertise-previous");
  const expertiseNext = document.querySelector("#expertise-next");
  const projectsPrevious = document.querySelector(
    "#department-project-previous",
  );
  const projectsNext = document.querySelector("#department-project-next");
  const similarProjectFilter = document.querySelector(
    "#similar-project-filter",
  );
  const similarProjectGrid = document.querySelector("#similar-project-grid");
  const similarProjectEmpty = document.querySelector("#similar-project-empty");

  let currentDepartmentId = null;
  let activeExpertiseIndex = 0;

  function updateCarouselControls(carousel, previous, next) {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= maxScroll - 2;
  }

  function renderExpertise() {
    const expertiseOptions = departmentExpertise[currentDepartmentId];
    expertiseCarousel.innerHTML = expertiseOptions
      .map(
        (expertise, index) => `
          <button
            class="expertise-tag"
            type="button"
            data-expertise-index="${index}"
            aria-pressed="false"
            aria-label="${escapeHtml(`${expertise.title}: ${expertise.description}`)}"
          >
            <span class="expertise-tag-index">0${index + 1} / 0${expertiseOptions.length}</span>
            <strong>${escapeHtml(expertise.title)}</strong>
          </button>
        `,
      )
      .join("");
    selectExpertise(0, false);
  }

  function selectExpertise(index, shouldScroll = true) {
    const expertiseOptions = departmentExpertise[currentDepartmentId] ?? [];
    const selectedExpertise = expertiseOptions[index];
    if (!selectedExpertise) return;

    activeExpertiseIndex = index;
    expertiseCarousel
      .querySelectorAll(".expertise-tag")
      .forEach((tag, tagIndex) => {
        const isSelected = tagIndex === activeExpertiseIndex;
        tag.classList.toggle("is-active", isSelected);
        tag.setAttribute("aria-pressed", String(isSelected));
      });
    expertiseDescription.textContent = selectedExpertise.description;
    const hasMultipleOptions = expertiseOptions.length > 1;
    expertisePrevious.disabled = !hasMultipleOptions;
    expertiseNext.disabled = !hasMultipleOptions;

    const selectedTag = expertiseCarousel.querySelector(
      `[data-expertise-index="${activeExpertiseIndex}"]`,
    );
    if (!selectedTag) return;

    const tagBounds = selectedTag.getBoundingClientRect();
    const carouselBounds = expertiseCarousel.getBoundingClientRect();
    const centeredScrollLeft =
      expertiseCarousel.scrollLeft +
      tagBounds.left +
      tagBounds.width / 2 -
      carouselBounds.left -
      carouselBounds.width / 2;
    if (shouldScroll) {
      expertiseCarousel.scrollTo({
        left: centeredScrollLeft,
        behavior: "smooth",
      });
    } else {
      expertiseCarousel.scrollLeft = centeredScrollLeft;
    }
  }

  function moveExpertise(offset) {
    const expertiseCount = departmentExpertise[currentDepartmentId]?.length ?? 0;
    if (expertiseCount === 0) return;
    selectExpertise(
      (activeExpertiseIndex + offset + expertiseCount) % expertiseCount,
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
    const featuredProject = departmentProjects.find(
      (project) => project.department === departmentId,
    );
    if (!featuredProject) {
      throw new Error(`No featured project found for department ${departmentId}`);
    }

    currentDepartmentId = departmentId;
    similarProjectFilter.value = "other";
    page.hidden = false;
    number.textContent = departmentNames[departmentId];
    title.textContent = departmentNames[departmentId];
    heroImage.src = featuredProject.image;
    heroImage.alt =
      `Featured ${departmentNames[departmentId]} project: ${featuredProject.title}`;
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
    moveExpertise(-1);
  });
  expertiseNext.addEventListener("click", () => {
    moveExpertise(1);
  });
  expertiseCarousel.addEventListener("click", (event) => {
    const tag = event.target.closest("[data-expertise-index]");
    if (!tag || !expertiseCarousel.contains(tag)) return;
    selectExpertise(Number(tag.dataset.expertiseIndex));
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
  projectGrid.addEventListener(
    "scroll",
    () => updateCarouselControls(projectGrid, projectsPrevious, projectsNext),
    { passive: true },
  );
  window.addEventListener("resize", () => {
    if (currentDepartmentId === null) return;
    selectExpertise(activeExpertiseIndex, false);
    updateCarouselControls(projectGrid, projectsPrevious, projectsNext);
  });

  return { show, hide };
}
