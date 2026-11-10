import {
  getProjectBySlug,
  getProjectSlug,
  projects,
} from "../data/project-data.js";
import { escapeHtml } from "../utils/html.js";
import { fetchProjects } from "../utils/fetch-projects.js";

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
  let allProjects = null;

  async function getAllProjects() {
  if (allProjects === null) {
    allProjects = await fetchProjects();
  }

  return allProjects;
  }

  function getProjectSlug(project) {
    return project.Title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

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

  
  async function show(slug) {
    const databaseProjects = await getAllProjects();

    // Find the project using its URL slug
    const project = databaseProjects.find(
      (item) => getProjectSlug(item) === slug
    );

    if (!project) {
      console.error("Project not found:", slug);
      return false;
    }

    // Display project information from MySQL
    title.textContent = project.Title;
    subtitle.textContent = "";
    overview.textContent = project.Description || "";

    student.textContent = "Swinburne student";
    department.textContent = project.DepartmentID
      ? `Department ${project.DepartmentID}`
      : "Department not assigned";

    year.textContent = project.CreatedAt
      ? new Date(project.CreatedAt).getFullYear()
      : "Not specified";

    category.textContent = "Student project";

    // No image is currently returned by the API
    heroImage.removeAttribute("src");
    heroImage.alt = "";
    heroImage.hidden = true;

    heroCaption.textContent = "";

    // Detailed sections are not available in the current API yet
    contentSections.innerHTML = "";

    // Display other projects as related projects
    relatedGrid.innerHTML = databaseProjects
      .filter((item) => item.id !== project.id)
      .slice(0, 3)
      .map(
        (item) => `
          <a
            class="project-related-card"
            href="#/project/${escapeHtml(getProjectSlug(item))}"
          >
            <span class="project-related-card-copy">
              <small>Student project</small>
              <strong>${escapeHtml(item.Title)}</strong>
              <span>
                Swinburne student ·
                ${item.CreatedAt
                  ? new Date(item.CreatedAt).getFullYear()
                  : "Not specified"}
              </span>
            </span>
            <span class="project-related-arrow" aria-hidden="true">↗</span>
          </a>
        `
      )
      .join("");

    document.title = `${project.Title} — Swinburne Student Showcase`;

    page.hidden = false;

    return true;
  }


  function hide() {
    page.hidden = true;
    document.title = "Swinburne Student Showcase";
  }

  return { show, hide };
}
