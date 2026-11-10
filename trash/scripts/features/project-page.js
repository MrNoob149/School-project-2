import {
  getProjectBySlug,
  getProjectSlug,
  projects,
} from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";

const sectionLabels = {
  overview: "Project overview",
  challenge: "The challenge",
  approach: "Our approach",
  outcome: "The outcome",
  process: "Behind the process",
  gallery: "Project gallery",
  tools: "Tools and skills",
  contributors: "Contributors",
  links: "Project links",
};

export function createProjectPage() {
  const page = document.querySelector("#project-page");
  const title = document.querySelector("#project-page-title");
  const subtitle = document.querySelector("#project-subtitle");
  const overview = document.querySelector("#project-overview");
  const student = document.querySelector("#project-student");
  const department = document.querySelector("#project-department");
  const year = document.querySelector("#project-year");
  const category = document.querySelector("#project-category");
  const heroImage = document.querySelector("#project-hero-image");
  const heroCaption = document.querySelector("#project-hero-caption");
  const contentSections = document.querySelector("#project-content-sections");
  const relatedGrid = document.querySelector("#project-related-grid");

  function renderSection(key, section, index) {
    if (!sectionLabels[key] || !section) return "";
    const heading = escapeHtml(section.title || sectionLabels[key]);

    if (key === "gallery") {
      const images = Array.isArray(section.images) ? section.images : [];
      if (!images.length) return "";
      return `
        <section class="project-content-section project-content-gallery" aria-labelledby="project-section-${key}">
          <div class="project-section-heading">
            <p class="eyebrow">${String(index + 1).padStart(2, "0")} / ${escapeHtml(sectionLabels[key])}</p>
            <h2 id="project-section-${key}">${heading}</h2>
          </div>
          <div class="project-gallery-grid">
            ${images
              .map(
                (image, imageIndex) => `
                  <figure class="project-gallery-item">
                    <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || `${title.textContent} detail ${imageIndex + 1}`)}" loading="lazy" />
                    ${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ""}
                  </figure>
                `,
              )
              .join("")}
          </div>
        </section>
      `;
    }

    if (key === "tools" || key === "contributors") {
      const items = Array.isArray(section.items) ? section.items : [];
      if (!items.length) return "";
      return `
        <section class="project-content-section" aria-labelledby="project-section-${key}">
          <div class="project-section-heading">
            <p class="eyebrow">${String(index + 1).padStart(2, "0")} / ${escapeHtml(sectionLabels[key])}</p>
            <h2 id="project-section-${key}">${heading}</h2>
          </div>
          <ul class="project-detail-list">
            ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      `;
    }

    if (key === "links") {
      const items = Array.isArray(section.items) ? section.items : [];
      if (!items.length) return "";
      return `
        <section class="project-content-section" aria-labelledby="project-section-${key}">
          <div class="project-section-heading">
            <p class="eyebrow">${String(index + 1).padStart(2, "0")} / ${escapeHtml(sectionLabels[key])}</p>
            <h2 id="project-section-${key}">${heading}</h2>
          </div>
          <div class="project-detail-links">
            ${items
              .filter((item) => item.url && item.label)
              .map(
                (item) => `
                  <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(item.label)} <span aria-hidden="true">↗</span>
                  </a>
                `,
              )
              .join("")}
          </div>
        </section>
      `;
    }

    const body = section.body || section.content || "";
    if (!body) return "";
    return `
      <section class="project-content-section" aria-labelledby="project-section-${key}">
        <div class="project-section-heading">
          <p class="eyebrow">${String(index + 1).padStart(2, "0")} / ${escapeHtml(sectionLabels[key])}</p>
          <h2 id="project-section-${key}">${heading}</h2>
        </div>
        <p class="project-section-copy">${escapeHtml(body)}</p>
      </section>
    `;
  }

  function show(slug) {
    const project = getProjectBySlug(slug);
    if (!project) return false;

    title.textContent = project.title;
    subtitle.textContent = project.subtitle || "";
    overview.textContent =
      project.firstParagraph || project.description || "";
    student.textContent = project.student || "Swinburne student";
    department.textContent = project.departmentName || "Swinburne Vietnam";
    year.textContent = project.year || "Not specified";
    category.textContent = project.category || "Student project";
    heroImage.src = project.image;
    heroImage.alt = `Project artwork for ${project.title}`;
    heroCaption.textContent = `${project.title} / ${project.category || "Student project"}`;

    const availableSections = project.availableSections || Object.keys(project.sections);
    contentSections.innerHTML = availableSections
      .map((key, index) => renderSection(key, project.sections[key], index))
      .filter(Boolean)
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
            <img src="${escapeHtml(item.image)}" alt="" loading="lazy" />
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
