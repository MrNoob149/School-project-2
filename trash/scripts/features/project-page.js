import {
  getProjectBySlug,
  getProjectSlug,
  projects,
} from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";

export function createProjectPage() {
  const page = document.querySelector("#project-page");
  const title = document.querySelector("#project-page-title");
  const subtitle = document.querySelector("#project-subtitle");
  const overview = document.querySelector("#project-overview");
  const student = document.querySelector("#project-student");
  const year = document.querySelector("#project-year");
  const heroImage = document.querySelector("#project-hero-image");
  const heroCaption = document.querySelector("#project-hero-caption");
  const highlightTitle = document.querySelector("#project-highlight-title");
  const highlightCategory = document.querySelector(
    "#project-highlight-category",
  );
  const highlightSummary = document.querySelector("#project-highlight-summary");
  const highlightImage = document.querySelector("#project-highlight-image");
  const storyOne = document.querySelector("#project-story-one");
  const storyTwo = document.querySelector("#project-story-two");
  const gallery = document.querySelector("#project-gallery-grid");
  const relatedGrid = document.querySelector("#project-related-grid");

  function show(slug) {
    const project = getProjectBySlug(slug);
    if (!project) return false;

    const safeTitle = escapeHtml(project.title);
    const safeCategory = escapeHtml(project.category || "Student project");
    const safeDescription = escapeHtml(
      project.description || "A closer look at this student project.",
    );
    title.textContent = project.title;
    subtitle.textContent = project.subtitle || project.description;
    overview.textContent =
      project.firstParagraph || project.description || "Project introduction.";
    student.textContent = project.student || "Swinburne student";
    year.textContent = project.year || "2026";
    heroImage.src = project.image;
    heroImage.alt = `Project artwork for ${project.title}`;
    heroCaption.textContent = `${project.title} / ${project.category || "Student project"}`;
    highlightTitle.textContent = project.title;
    highlightCategory.textContent = project.category || "Student project";
    highlightSummary.textContent = project.description;
    highlightImage.src = project.image;
    highlightImage.alt = `Featured work for ${project.title}`;
    storyOne.textContent =
      project.firstParagraph || project.description || "Project overview.";
    storyTwo.textContent =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. The process brings research, experimentation, and thoughtful making together to shape the final work.";

    const galleryProjects = [
      project,
      ...projects.filter((item) => item.image !== project.image),
    ].slice(0, 3);

    gallery.innerHTML = galleryProjects
      .map(
        (item, index) => `
          <figure class="project-gallery-item project-gallery-item-${index + 1}">
            <img
              src="${escapeHtml(item.image)}"
              alt="${safeTitle} — project detail ${index + 1}"
              loading="lazy"
            />
            <figcaption>0${index + 1} / ${safeCategory}</figcaption>
          </figure>
        `,
      )
      .join("");

    relatedGrid.innerHTML = projects
      .filter((item) => getProjectSlug(item) !== slug)
      .slice(0, 3)
      .map(
        (item) => `
          <a
            class="project-related-card"
            href="#/project/${escapeHtml(getProjectSlug(item))}"
          >
            <img
              src="${escapeHtml(item.image)}"
              alt=""
              loading="lazy"
            />
            <span class="project-related-card-copy">
              <small>${escapeHtml(item.category || "Student project")}</small>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.student || "Swinburne student")} · ${escapeHtml(item.year || "2026")}</span>
            </span>
            <span class="project-related-arrow" aria-hidden="true">↗</span>
          </a>
        `,
      )
      .join("");

    document.title = `${project.title} — Swinburne Student Showcase`;
    page.hidden = false;
    return true;
  }

  function hide() {
    page.hidden = true;
    document.title = "Swinburne Student Showcase";
  }

  return { show, hide };
}
