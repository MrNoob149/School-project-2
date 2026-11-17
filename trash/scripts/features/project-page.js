import {
  departmentNames,
  departmentProjects,
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

const maxImageFileSize = 15 * 1024 * 1024;
const maxHighlightImages = 12;
const projectFieldLabels = new Set([
  "date",
  "year",
  "campus",
  "students' name",
  "expertises",
  "unit name & code",
  "clients",
  "deliverables",
  "platforms",
  "supervisors",
]);

function getProjectDetailValue(details, label) {
  if (!Array.isArray(details)) return "";

  const detail = details.find(
    (item) =>
      item &&
      String(item.label || "").trim().toLowerCase() === label.toLowerCase(),
  );
  return detail?.value || "";
}

function getAdditionalProjectDetails(details) {
  if (!Array.isArray(details)) return [];

  return details.filter(
    (detail) =>
      detail &&
      !projectFieldLabels.has(
        String(detail.label || "").trim().toLowerCase(),
      ),
  );
}

function getProjectFieldValue(project, field, label) {
  return (
    project[field] ||
    getProjectDetailValue(project.details, label) ||
    ""
  );
}

function getSavedProjectFieldValue(edits, project, field, label) {
  if (typeof edits[field] === "string") return edits[field];

  return (
    getProjectDetailValue(edits.details, label) ||
    getProjectFieldValue(project, field, label)
  );
}

function getYearFromDate(date) {
  return String(date || "").match(/\b\d{4}\b/)?.[0] || "";
}

export function createProjectPage() {
  const page = document.querySelector("#project-page");
  const overview = document.querySelector("#project-overview");
  const heroImage = document.querySelector("#project-hero-image");
  const heroFigure = document.querySelector(".project-hero-figure");
  const highlightGrid = document.querySelector("#project-highlight-grid");
  const highlightSection = document.querySelector(".project-highlights");
  const detailName = document.querySelector("#project-details-name");
  const detailTags = document.querySelector("#project-details-date-campus");
  const detailFacts = document.querySelector("#project-details-facts");
  const contentSections = document.querySelector("#project-content-sections");
  const relatedGrid = document.querySelector("#project-related-grid");
  const relatedPrevious = document.querySelector("#project-related-previous");
  const relatedNext = document.querySelector("#project-related-next");
  const editToggle = document.querySelector("#project-edit-toggle");
  const editor = document.querySelector("#project-editor");
  const editorForm = document.querySelector("#project-editor-form");
  const editorName = document.querySelector("#project-editor-name");
  const editorIntroduction = document.querySelector(
    "#project-editor-introduction",
  );
  const editorDate = document.querySelector("#project-editor-date");
  const editorCampus = document.querySelector("#project-editor-campus");
  const editorStudent = document.querySelector("#project-editor-student");
  const editorCategory = document.querySelector("#project-editor-category");
  const editorUnitNameCode = document.querySelector(
    "#project-editor-unit-name-code",
  );
  const editorClients = document.querySelector("#project-editor-clients");
  const editorDeliverables = document.querySelector(
    "#project-editor-deliverables",
  );
  const editorPlatforms = document.querySelector("#project-editor-platforms");
  const editorSupervisors = document.querySelector(
    "#project-editor-supervisors",
  );
  const editorDepartment = document.querySelector(
    "#project-editor-department",
  );
  const editorCover = document.querySelector("#project-editor-cover");
  const editorCoverPreview = document.querySelector(
    "#project-editor-cover-preview",
  );
  const editorDetails = document.querySelector("#project-editor-details");
  const editorSections = document.querySelector("#project-editor-sections");
  const editorHighlights = document.querySelector(
    "#project-editor-highlights",
  );
  const editorHighlightsUpload = document.querySelector(
    "#project-editor-highlights-upload",
  );
  const editorCancel = document.querySelector("#project-editor-cancel");
  const editorReset = document.querySelector("#project-editor-reset");
  const editorMessage = document.querySelector("#project-editor-message");
  const editorError = document.querySelector("#project-editor-error");
  const pageMessage = document.querySelector("#project-page-message");
  const pageError = document.querySelector("#project-page-error");

  let currentSlug = "";
  let currentProject = null;
  let originalProject = null;
  let editorCoverImage = "";

  function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
  }

  function setEditorMessage(message) {
    editorMessage.textContent = message;
    editorMessage.hidden = !message;
  }

  function setEditorError(message) {
    editorError.textContent = message;
    editorError.hidden = !message;
  }

  function setPageMessage(message) {
    pageMessage.textContent = message;
    pageMessage.hidden = !message;
  }

  function setPageError(message) {
    pageError.textContent = message;
    pageError.hidden = !message;
  }

  function storageKey(slug) {
    return `swinburne-project-page:${slug}`;
  }

  function readSavedEdits(slug) {
    let serialized;
    try {
      serialized = localStorage.getItem(storageKey(slug));
    } catch (error) {
      setPageError(`Saved edits could not be read: ${getErrorMessage(error)}`);
      return null;
    }

    if (!serialized) return null;

    try {
      const saved = JSON.parse(serialized);
      if (
        !saved ||
        typeof saved !== "object" ||
        typeof saved.title !== "string" ||
        !Array.isArray(saved.details) ||
        !Array.isArray(saved.sections) ||
        !Array.isArray(saved.highlightImages)
      ) {
        throw new Error("The saved project data is incomplete.");
      }
      return saved;
    } catch (error) {
      setPageError(`Saved edits could not be loaded: ${getErrorMessage(error)}`);
      return null;
    }
  }

  function applySavedEdits(project, edits) {
    if (!edits) return project;

    const sections = Object.fromEntries(
      edits.sections.map((section, index) => [
        `custom-${index + 1}`,
        {
          title: section.title,
          body: section.body,
          items: section.items,
        },
      ]),
    );
    const department = Number(edits.department);
    const date =
      typeof edits.date === "string"
        ? edits.date
        : getProjectDetailValue(edits.details, "Date") ||
          getProjectDetailValue(edits.details, "Year") ||
          String(edits.year ?? project.date ?? project.year ?? "");

    return {
      ...project,
      title: edits.title,
      description: edits.introduction,
      firstParagraph: edits.introduction,
      date,
      campus: getSavedProjectFieldValue(edits, project, "campus", "Campus"),
      student:
        typeof edits.date === "string"
          ? edits.student
          : edits.student ||
            getProjectDetailValue(edits.details, "Students' name"),
      category:
        typeof edits.date === "string"
          ? edits.category
          : edits.category ||
            getProjectDetailValue(edits.details, "Expertises"),
      unitNameCode: getSavedProjectFieldValue(
        edits,
        project,
        "unitNameCode",
        "Unit Name & Code",
      ),
      clients: getSavedProjectFieldValue(edits, project, "clients", "Clients"),
      deliverables: getSavedProjectFieldValue(
        edits,
        project,
        "deliverables",
        "Deliverables",
      ),
      platforms: getSavedProjectFieldValue(
        edits,
        project,
        "platforms",
        "Platforms",
      ),
      supervisors: getSavedProjectFieldValue(
        edits,
        project,
        "supervisors",
        "Supervisors",
      ),
      year: getYearFromDate(date) || edits.year || project.year || "",
      department,
      departmentName: departmentNames[department] || project.departmentName,
      image: edits.coverImage,
      details: getAdditionalProjectDetails(edits.details),
      highlightImages: edits.highlightImages,
      sections,
      availableSections: Object.keys(sections),
    };
  }

  function updateRelatedControls() {
    const maxScroll = relatedGrid.scrollWidth - relatedGrid.clientWidth;
    relatedPrevious.disabled = relatedGrid.scrollLeft <= 2;
    relatedNext.disabled =
      maxScroll <= 2 || relatedGrid.scrollLeft >= maxScroll - 2;
  }

  function renderSection(key, section, index) {
    if (key === "gallery" || section === null || section === undefined) {
      return "";
    }

    const content = typeof section === "string" ? { body: section } : section;
    const heading = escapeHtml(content.title || sectionLabels[key] || key);
    const sectionId = `project-details-section-${index + 1}`;
    const items = Array.isArray(content.items) ? content.items : [];
    const body = content.body || content.content || "";
    const links =
      key === "links"
        ? items.filter((item) => item && item.url && item.label)
        : [];
    const listItems =
      key === "links" ? [] : items.filter((item) => item !== null);
    if (!body && !links.length && !listItems.length) return "";

    return `
      <section class="project-detail-item" aria-labelledby="${sectionId}">
        <h3 id="${sectionId}">${heading}</h3>
        <div class="project-detail-copy">
          ${body ? `<p>${escapeHtml(body)}</p>` : ""}
          ${
            listItems.length
              ? `<ul class="project-detail-list">${listItems
                  .map((item) => `<li>${escapeHtml(item)}</li>`)
                  .join("")}</ul>`
              : ""
          }
          ${
            links.length
              ? `<ul class="project-detail-list">${links
                  .map(
                    (item) => `
                      <li>
                        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                          ${escapeHtml(item.label)}
                        </a>
                      </li>
                    `,
                  )
                  .join("")}</ul>`
              : ""
          }
        </div>
      </section>
    `;
  }

  function renderHighlights(project) {
    const galleryImages = project.sections.gallery?.images;
    const images = Array.isArray(project.highlightImages)
      ? project.highlightImages
      : Array.isArray(galleryImages) && galleryImages.length
        ? galleryImages
        : project.image
          ? [{ src: project.image, alt: `Highlight from ${project.title}` }]
          : [];

    highlightGrid.innerHTML = images
      .filter((image) => image && image.src)
      .map(
        (image, index) => `
          <figure class="project-highlight-item">
            <img
              src="${escapeHtml(image.src)}"
              alt="${escapeHtml(image.alt || `${project.title} highlight ${index + 1}`)}"
              loading="lazy"
            />
            ${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ""}
          </figure>
        `,
      )
      .join("");
    highlightSection.hidden = highlightGrid.childElementCount === 0;
  }

  function renderDetails(project) {
    const details = [
      {
        label: "Students' name",
        value: getProjectFieldValue(project, "student", "Students' name"),
      },
      {
        label: "Expertises",
        value: getProjectFieldValue(project, "category", "Expertises"),
      },
      {
        label: "Unit Name & Code",
        value: getProjectFieldValue(
          project,
          "unitNameCode",
          "Unit Name & Code",
        ),
      },
      { label: "Clients", value: getProjectFieldValue(project, "clients", "Clients") },
      {
        label: "Deliverables",
        value: getProjectFieldValue(
          project,
          "deliverables",
          "Deliverables",
        ),
      },
      {
        label: "Platforms",
        value: getProjectFieldValue(project, "platforms", "Platforms"),
      },
      {
        label: "Supervisors",
        value: getProjectFieldValue(
          project,
          "supervisors",
          "Supervisors",
        ),
      },
      ...getAdditionalProjectDetails(project.details),
    ];

    detailName.textContent = project.title || "";
    detailName.hidden = !project.title;
    detailTags.innerHTML = [
      {
        className: "project-details-date",
        value:
          project.date ??
          (getProjectDetailValue(project.details, "Date") ||
            getProjectDetailValue(project.details, "Year") ||
            project.year),
      },
      { className: "project-details-campus", value: project.campus },
    ]
      .filter(
        ({ value }) =>
          value !== undefined && value !== null && String(value).trim(),
      )
      .map(
        ({ className, value }) =>
          `<span class="${className}">${escapeHtml(value)}</span>`,
      )
      .join("");
    detailTags.hidden = !detailTags.innerHTML;
    detailFacts.innerHTML = details
      .filter(
        (item) =>
          item &&
          item.label &&
          item.value !== undefined &&
          String(item.value).trim() !== "",
      )
      .map(
        (item) => `
          <div>
            <dt>${escapeHtml(item.label)}</dt>
            <dd>${escapeHtml(item.value)}</dd>
          </div>
        `,
      )
      .join("");

    const sectionKeys = Array.isArray(project.availableSections)
      ? project.availableSections
      : Object.keys(project.sections);
    contentSections.innerHTML = sectionKeys
      .map((key, index) => renderSection(key, project.sections[key], index))
      .filter(Boolean)
      .join("");
  }

  function getRelatedProjects(slug) {
    const seen = new Set([slug]);
    return [...projects, ...departmentProjects].filter((project) => {
      const projectSlug = getProjectSlug(project);
      if (seen.has(projectSlug)) return false;
      seen.add(projectSlug);
      return true;
    });
  }

  function renderRelatedProjects(slug) {
    relatedGrid.innerHTML = getRelatedProjects(slug)
      .map(
        (project) => `
          <a
            class="project-row"
            data-department="${project.department}"
            href="#/project/${escapeHtml(getProjectSlug(project))}"
            aria-label="${escapeHtml(project.title)}, by ${escapeHtml(project.student || "Swinburne student")}"
          >
            ${
              project.image
                ? `<img class="project-card-image" src="${escapeHtml(project.image)}" alt="" loading="lazy" />`
                : '<span class="project-card-image project-card-image-placeholder" aria-hidden="true"></span>'
            }
            <span class="project-row-copy">
              <span class="project-row-title">${escapeHtml(project.title)}</span>
              <span class="project-row-meta">${escapeHtml(project.category || "Student project")}</span>
              <span class="project-row-description">${escapeHtml(project.description || "")}</span>
            </span>
          </a>
        `,
      )
      .join("");

    relatedGrid.scrollLeft = 0;
    requestAnimationFrame(updateRelatedControls);
  }

  function renderProject(project, slug) {
    currentProject = project;
    overview.textContent =
      project.firstParagraph || project.description || "";
    heroFigure.classList.toggle("is-placeholder", !project.image);
    heroImage.hidden = !project.image;
    if (project.image) {
      heroImage.src = project.image;
    } else {
      heroImage.removeAttribute("src");
    }
    heroImage.alt = project.title
      ? `Project artwork for ${project.title}`
      : "Project artwork";

    renderHighlights(project);
    renderDetails(project);
    renderRelatedProjects(slug);
    document.title = project.title
      ? `${project.title} — Swinburne Student Showcase`
      : "Project page — Swinburne Student Showcase";
    requestAnimationFrame(updateRelatedControls);
  }

  function getEditorData(project) {
    const sectionKeys = Array.isArray(project.availableSections)
      ? project.availableSections
      : Object.keys(project.sections);

    return {
      title: project.title || "",
      introduction:
        project.firstParagraph || project.description || "",
      date:
        project.date ??
        (getProjectDetailValue(project.details, "Date") ||
          getProjectDetailValue(project.details, "Year") ||
          project.year ||
          ""),
      campus: getProjectFieldValue(project, "campus", "Campus"),
      student: getProjectFieldValue(project, "student", "Students' name"),
      category: getProjectFieldValue(project, "category", "Expertises"),
      unitNameCode: getProjectFieldValue(
        project,
        "unitNameCode",
        "Unit Name & Code",
      ),
      clients: getProjectFieldValue(project, "clients", "Clients"),
      deliverables: getProjectFieldValue(
        project,
        "deliverables",
        "Deliverables",
      ),
      platforms: getProjectFieldValue(project, "platforms", "Platforms"),
      supervisors: getProjectFieldValue(
        project,
        "supervisors",
        "Supervisors",
      ),
      department: String(project.department || 1),
      coverImage: project.image || "",
      details: getAdditionalProjectDetails(project.details).map(
        ({ label = "", value = "" }) => ({ label, value }),
      ),
      highlightImages: Array.isArray(project.highlightImages)
        ? project.highlightImages.map((image) => ({ ...image }))
        : Array.isArray(project.sections.gallery?.images)
          ? project.sections.gallery.images.map((image) => ({ ...image }))
          : [],
      sections: sectionKeys
        .filter((key) => key !== "gallery")
        .map((key) => {
          const section = project.sections[key];
          const content =
            typeof section === "string" ? { body: section } : section || {};
          return {
            title: content.title || sectionLabels[key] || key,
            body: content.body || content.content || "",
            items: Array.isArray(content.items)
              ? content.items
                  .map((item) =>
                    typeof item === "string" ? item : item.label || "",
                  )
                  .filter(Boolean)
              : [],
          };
        }),
    };
  }

  function renderEditorDetails(details) {
    editorDetails.innerHTML = details
      .map(
        (detail, index) => `
          <div class="project-editor-row" data-editor-detail-row>
            <label>
              Detail label
              <input data-detail-label value="${escapeHtml(detail.label)}" />
            </label>
            <label>
              Detail value
              <input data-detail-value value="${escapeHtml(detail.value)}" />
            </label>
            <button
              class="project-editor-remove"
              type="button"
              data-remove-detail="${index}"
            >
              Remove
            </button>
          </div>
        `,
      )
      .join("");
  }

  function renderEditorSections(sections) {
    editorSections.innerHTML = sections
      .map(
        (section, index) => `
          <div class="project-editor-row project-editor-section-row" data-editor-section-row>
            <label>
              Section heading
              <input data-section-title value="${escapeHtml(section.title)}" />
            </label>
            <label>
              Paragraph
              <textarea data-section-body rows="3">${escapeHtml(section.body)}</textarea>
            </label>
            <label>
              List items (one per line)
              <textarea data-section-items rows="2">${escapeHtml(section.items.join("\n"))}</textarea>
            </label>
            <button
              class="project-editor-remove"
              type="button"
              data-remove-section="${index}"
            >
              Remove
            </button>
          </div>
        `,
      )
      .join("");
  }

  function renderEditorHighlights(images) {
    editorHighlights.innerHTML = images
      .map(
        (image, index) => `
          <article class="project-editor-image" data-editor-highlight>
            <img
              src="${escapeHtml(image.src)}"
              alt=""
              data-highlight-preview
            />
            <label>
              Picture description
              <input data-highlight-alt value="${escapeHtml(image.alt || "")}" />
            </label>
            <label>
              Caption
              <input data-highlight-caption value="${escapeHtml(image.caption || "")}" />
            </label>
            <button
              class="project-editor-remove"
              type="button"
              data-remove-highlight="${index}"
            >
              Remove picture
            </button>
          </article>
        `,
      )
      .join("");
  }

  function renderCoverPreview() {
    editorCoverPreview.innerHTML = editorCoverImage
      ? `
          <img src="${escapeHtml(editorCoverImage)}" alt="Cover picture preview" />
          <button class="project-editor-remove" type="button" data-clear-cover>
            Remove cover picture
          </button>
        `
      : "<p>No cover picture selected.</p>";
  }

  function populateEditor(project) {
    const data = getEditorData(project);
    editorName.value = data.title;
    editorIntroduction.value = data.introduction;
    editorDate.value = data.date;
    editorCampus.value = data.campus;
    editorStudent.value = data.student;
    editorCategory.value = data.category;
    editorUnitNameCode.value = data.unitNameCode;
    editorClients.value = data.clients;
    editorDeliverables.value = data.deliverables;
    editorPlatforms.value = data.platforms;
    editorSupervisors.value = data.supervisors;
    editorDepartment.value = data.department;
    editorCoverImage = data.coverImage;
    renderCoverPreview();
    renderEditorDetails(data.details);
    renderEditorSections(data.sections);
    renderEditorHighlights(data.highlightImages);
    setEditorMessage("");
    setEditorError("");
  }

  function readEditorDetails() {
    return [...editorDetails.querySelectorAll("[data-editor-detail-row]")]
      .map((row) => ({
        label: row.querySelector("[data-detail-label]").value.trim(),
        value: row.querySelector("[data-detail-value]").value.trim(),
      }))
      .filter((detail) => detail.label || detail.value);
  }

  function readEditorSections() {
    return [...editorSections.querySelectorAll("[data-editor-section-row]")]
      .map((row) => ({
        title: row.querySelector("[data-section-title]").value.trim(),
        body: row.querySelector("[data-section-body]").value.trim(),
        items: row
          .querySelector("[data-section-items]")
          .value.split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
      }))
      .filter((section) => section.title || section.body || section.items.length);
  }

  function readEditorHighlights() {
    return [...editorHighlights.querySelectorAll("[data-editor-highlight]")]
      .map((item) => ({
        src: item.querySelector("[data-highlight-preview]").getAttribute("src"),
        alt: item.querySelector("[data-highlight-alt]").value.trim(),
        caption: item.querySelector("[data-highlight-caption]").value.trim(),
      }));
  }

  async function imageFileToDataUrl(file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Choose an image file.");
    }
    if (file.size > maxImageFileSize) {
      throw new Error("Each image must be smaller than 15 MB.");
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      throw new Error("The browser could not prepare this image.");
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.84),
    );
    if (!blob) throw new Error("The browser could not compress this image.");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error("The browser could not read this image."));
      reader.readAsDataURL(blob);
    });
  }

  function openEditor() {
    populateEditor(currentProject);
    editor.hidden = false;
    editToggle.setAttribute("aria-expanded", "true");
    editToggle.textContent = "Close editor";
  }

  function closeEditor() {
    editor.hidden = true;
    editToggle.setAttribute("aria-expanded", "false");
    editToggle.textContent = "Edit this page";
  }

  function show(slug) {
    originalProject = getProjectBySlug(slug);
    if (!originalProject) return false;

    currentSlug = slug;
    setPageError("");
    setPageMessage("");
    const savedEdits = readSavedEdits(slug);
    const project = applySavedEdits(originalProject, savedEdits);
    renderProject(project, slug);
    closeEditor();
    page.hidden = false;
    requestAnimationFrame(updateRelatedControls);
    return true;
  }

  function hide() {
    page.hidden = true;
    closeEditor();
    document.title = "Swinburne Student Showcase";
  }

  editToggle.addEventListener("click", () => {
    if (editor.hidden) {
      openEditor();
    } else {
      closeEditor();
    }
  });

  document
    .querySelector("[data-add-project-detail]")
    .addEventListener("click", () => {
      const details = readEditorDetails();
      details.push({ label: "", value: "" });
      renderEditorDetails(details);
    });

  document
    .querySelector("[data-add-project-section]")
    .addEventListener("click", () => {
      const sections = readEditorSections();
      sections.push({ title: "", body: "", items: [] });
      renderEditorSections(sections);
    });

  editorDetails.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-detail]");
    if (!removeButton) return;
    const details = readEditorDetails();
    details.splice(Number(removeButton.dataset.removeDetail), 1);
    renderEditorDetails(details);
  });

  editorSections.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-section]");
    if (!removeButton) return;
    const sections = readEditorSections();
    sections.splice(Number(removeButton.dataset.removeSection), 1);
    renderEditorSections(sections);
  });

  editorHighlights.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-highlight]");
    if (!removeButton) return;
    const images = readEditorHighlights();
    images.splice(Number(removeButton.dataset.removeHighlight), 1);
    renderEditorHighlights(images);
  });

  editorCoverPreview.addEventListener("click", (event) => {
    if (!event.target.closest("[data-clear-cover]")) return;
    editorCoverImage = "";
    renderCoverPreview();
  });

  editorCover.addEventListener("change", async () => {
    const file = editorCover.files[0];
    if (!file) return;
    setEditorError("");
    try {
      editorCoverImage = await imageFileToDataUrl(file);
      renderCoverPreview();
      setEditorMessage("Cover picture added.");
    } catch (error) {
      setEditorError(`Cover picture upload failed: ${getErrorMessage(error)}`);
    } finally {
      editorCover.value = "";
    }
  });

  editorHighlightsUpload.addEventListener("change", async () => {
    const files = [...editorHighlightsUpload.files];
    if (!files.length) return;
    setEditorError("");
    try {
      const images = readEditorHighlights();
      if (images.length + files.length > maxHighlightImages) {
        throw new Error(`You can add up to ${maxHighlightImages} pictures.`);
      }
      for (const file of files) {
        images.push({
          src: await imageFileToDataUrl(file),
          alt: file.name,
          caption: "",
        });
      }
      renderEditorHighlights(images);
      setEditorMessage("Highlight pictures added.");
    } catch (error) {
      setEditorError(`Picture upload failed: ${getErrorMessage(error)}`);
    } finally {
      editorHighlightsUpload.value = "";
    }
  });

  editorCancel.addEventListener("click", () => {
    closeEditor();
    setEditorError("");
  });

  editorReset.addEventListener("click", () => {
    if (!window.confirm("Remove the saved edits for this project page?")) {
      return;
    }
    try {
      localStorage.removeItem(storageKey(currentSlug));
    } catch (error) {
      setEditorError(`Saved edits could not be removed: ${getErrorMessage(error)}`);
      return;
    }
    currentProject = originalProject;
    renderProject(originalProject, currentSlug);
    closeEditor();
    setPageError("");
    setPageMessage("Saved edits removed.");
  });

  editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setEditorError("");

    const details = readEditorDetails();
    if (details.some((detail) => !detail.label || !detail.value)) {
      setEditorError("Complete both fields for each additional project detail.");
      return;
    }

    const sections = readEditorSections();
    if (sections.some((section) => !section.title)) {
      setEditorError("Add a heading to each project details section.");
      return;
    }

    const edits = {
      title: editorName.value.trim(),
      introduction: editorIntroduction.value.trim(),
      date: editorDate.value.trim(),
      campus: editorCampus.value,
      student: editorStudent.value.trim(),
      category: editorCategory.value.trim(),
      unitNameCode: editorUnitNameCode.value.trim(),
      clients: editorClients.value.trim(),
      deliverables: editorDeliverables.value.trim(),
      platforms: editorPlatforms.value.trim(),
      supervisors: editorSupervisors.value.trim(),
      year: getYearFromDate(editorDate.value) || currentProject.year || "",
      department: Number(editorDepartment.value),
      coverImage: editorCoverImage,
      details,
      sections,
      highlightImages: readEditorHighlights(),
    };
    try {
      localStorage.setItem(storageKey(currentSlug), JSON.stringify(edits));
    } catch (error) {
      setEditorError(
        `Changes could not be saved in this browser: ${getErrorMessage(error)}`,
      );
      return;
    }

    currentProject = applySavedEdits(originalProject, edits);
    renderProject(currentProject, currentSlug);
    closeEditor();
    setPageError("");
    setPageMessage("Changes saved in this browser.");
  });

  relatedPrevious.addEventListener("click", () => {
    relatedGrid.scrollBy({
      left: -relatedGrid.clientWidth * 0.82,
      behavior: "smooth",
    });
  });
  relatedNext.addEventListener("click", () => {
    relatedGrid.scrollBy({
      left: relatedGrid.clientWidth * 0.82,
      behavior: "smooth",
    });
  });
  relatedGrid.addEventListener("scroll", updateRelatedControls, {
    passive: true,
  });
  window.addEventListener("resize", updateRelatedControls);

  return { show, hide };
}
