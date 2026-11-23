import { escapeHtml } from "../utils/html.js";
import { fetchProjects} from "../utils/fetch-project.js"
import {departmentExpertise, departmentNames} from '../data/project-data.js'

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
const maxHighlightVideoFileSize = 200 * 1024 * 1024;
const maxHighlightImages = 12;
const highlightTemplateValues = new Set(["four", "three", "video", "issuu"]);
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
  const imageLightbox = document.querySelector("#project-image-lightbox");
  const imageLightboxClose = document.querySelector(
    "#project-image-lightbox-close",
  );
  const imageLightboxImage = document.querySelector(
    "#project-image-lightbox-image",
  );
  const imageLightboxCaption = document.querySelector(
    "#project-image-lightbox-caption",
  );
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
  const editorHighlightTemplate = document.querySelector(
    "#project-editor-highlight-template",
  );
  const editorHighlightImagesControls = document.querySelector(
    "#project-editor-highlight-images-controls",
  );
  const editorHighlightVideoControls = document.querySelector(
    "#project-editor-highlight-video-controls",
  );
  const editorHighlightIssuuControls = document.querySelector(
    "#project-editor-highlight-issuu-controls",
  );
  const editorHighlightVideoUrl = document.querySelector(
    "#project-editor-highlight-video-url",
  );
  const editorHighlightVideoUpload = document.querySelector(
    "#project-editor-highlight-video-upload",
  );
  const editorHighlightVideoUploadStatus = document.querySelector(
    "#project-editor-highlight-video-upload-status",
  );
  const editorHighlightIssuuUrl = document.querySelector(
    "#project-editor-highlight-issuu-url",
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
  let editorHighlightVideoFile = null;
  let editorSavedVideoName = "";
  let currentVideoObjectUrl = "";
  let videoLoadGeneration = 0;

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

  function openProjectMediaDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("swinburne-project-media", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("videos");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          request.error || new Error("The browser could not open media storage."),
        );
      request.onblocked = () =>
        reject(new Error("Project media storage is blocked by another tab."));
    });
  }

  async function accessProjectVideo(slug, mode, action) {
    const database = await openProjectMediaDatabase();
    return new Promise((resolve, reject) => {
      let transaction;
      try {
        transaction = database.transaction("videos", mode);
        const request = action(transaction.objectStore("videos"), slug);
        let result;
        request.onsuccess = () => {
          result = request.result;
        };
        transaction.oncomplete = () => {
          database.close();
          resolve(result);
        };
        transaction.onerror = () => {
          database.close();
          reject(
            transaction.error ||
              new Error("The browser could not access saved video storage."),
          );
        };
        transaction.onabort = () => {
          database.close();
          reject(
            transaction.error ||
              new Error("Access to saved video storage was aborted."),
          );
        };
      } catch (error) {
        database.close();
        reject(error);
      }
    });
  }

  function saveProjectVideo(slug, file) {
    return accessProjectVideo(slug, "readwrite", (store, key) =>
      store.put(file, key),
    );
  }

  function readProjectVideo(slug) {
    return accessProjectVideo(slug, "readonly", (store, key) =>
      store.get(key),
    );
  }

  function deleteProjectVideo(slug) {
    return accessProjectVideo(slug, "readwrite", (store, key) =>
      store.delete(key),
    );
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
      highlightTemplate: highlightTemplateValues.has(edits.highlightTemplate)
        ? edits.highlightTemplate
        : "four",
      videoUrl: typeof edits.videoUrl === "string" ? edits.videoUrl : "",
      uploadedVideoName:
        typeof edits.uploadedVideoName === "string"
          ? edits.uploadedVideoName
          : "",
      uploadedVideoUrl: "",
      issuuUrl: typeof edits.issuuUrl === "string" ? edits.issuuUrl : "",
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
    const template = highlightTemplateValues.has(project.highlightTemplate)
      ? project.highlightTemplate
      : "four";
    const galleryImages = project.sections.gallery?.images;
    const images = Array.isArray(project.highlightImages)
      ? project.highlightImages
      : Array.isArray(galleryImages) && galleryImages.length
        ? galleryImages
        : project.image
          ? [{ src: project.image, alt: `Highlight from ${project.title}` }]
          : [];

    highlightGrid.dataset.template = template;
    if (template === "video") {
      const videoUrl =
        getVideoUrl(project.videoUrl) ||
        (project.uploadedVideoUrl
          ? { embed: false, src: project.uploadedVideoUrl }
          : null);
      highlightGrid.innerHTML = videoUrl
        ? videoUrl.embed
          ? `<iframe class="project-highlight-frame" src="${escapeHtml(videoUrl.src)}" title="${escapeHtml(`${project.title} project video`)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`
          : `<video class="project-highlight-frame" src="${escapeHtml(videoUrl.src)}" controls preload="metadata">Your browser does not support embedded video.</video>`
        : "";
    } else if (template === "issuu") {
      const issuuUrl = getIssuuEmbedUrl(project.issuuUrl);
      highlightGrid.innerHTML = issuuUrl
        ? `<iframe class="project-highlight-frame" src="${escapeHtml(issuuUrl)}" title="${escapeHtml(`${project.title} Issuu flipbook`)}" allow="clipboard-write; fullscreen" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
        : "";
    } else {
      const visibleImages =
        template === "three" ? images.slice(0, 3) : images;
      highlightGrid.innerHTML = visibleImages
        .filter((image) => image && image.src)
        .map(
          (image, index) => `
            <figure class="project-highlight-item">
              <button
                class="project-highlight-zoom"
                type="button"
                data-highlight-open
                aria-label="View ${escapeHtml(image.alt || `${project.title} highlight ${index + 1}`)} full size"
              >
                <img
                  src="${escapeHtml(image.src)}"
                  alt="${escapeHtml(image.alt || `${project.title} highlight ${index + 1}`)}"
                  loading="lazy"
                />
              </button>
              ${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ""}
            </figure>
          `,
        )
        .join("");
    }
    highlightGrid.querySelectorAll('image').forEach((image) => { 
      function handleImageSize() { 
        const ratio = image.naturalWidth / image.naturalHeight;

        image.classList.remove("landscape", "portrait", "square");

        if ( ratio > 1.05) {
          image.classList.add("landscape");}
        else if ( ratio < 0.95) {
          image.classList.add("portrait");
        } else {
          image.classList.add("square");
        }
      }
      if (image.complete && image.naturalWidth > 0) {
        handleImageSize();
      } else { 
        image.addEventListener("load", updateImageOrientation, { once: true });
      }
    });
    highlightSection.hidden = highlightGrid.childElementCount === 0;

  }

  function getVideoUrl(value) {
    if (!value) return null;

    let url;
    try {
      url = new URL(value);
    } catch {
      return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const host = url.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        return {
          embed: true,
          src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
        };
      }
    }
    if (host === "youtu.be" || host === "www.youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        return {
          embed: true,
          src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
        };
      }
    }
    if (["vimeo.com", "www.vimeo.com"].includes(host)) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      if (videoId && /^\d+$/.test(videoId)) {
        return {
          embed: true,
          src: `https://player.vimeo.com/video/${videoId}`,
        };
      }
    }
    return { embed: false, src: url.href };
  }

  function getIssuuEmbedUrl(value) {
    if (!value) return "";

    let url;
    try {
      url = new URL(value);
    } catch {
      return "";
    }
    if (
      url.protocol !== "https:" ||
      !(url.hostname === "issuu.com" || url.hostname.endsWith(".issuu.com")) ||
      !url.pathname.includes("/docs/")
    ) {
      return "";
    }

    url.searchParams.set("embed", "true");
    return url.href;
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
  
    relatedGrid.scrollLeft = 0;
    requestAnimationFrame(updateRelatedControls);
  }

  function renderProject(project, slug) {
    currentProject = project;


    overview.textContent =
      project.firstParagraph || project.description || project.Introduction || project.Description || "";

    heroFigure.classList.toggle("is-placeholder", !project.image);
    heroImage.hidden = !project.image;

    if (project.image) {
      heroImage.src = project.image;
    } else {
      heroImage.removeAttribute("src");
    }
    
    heroImage.alt = project.Title
      ? `Project artwork for ${project.Title}`
      : "Project artwork";

    renderHighlights(project);
    renderDetails(project);
    document.title =
    `${project.title || project.Title} — Swinburne Student Showcase`;

  requestAnimationFrame(updateRelatedControls);
  }

  
  async function show(slug) {
    const databaseProjects = await getAllProjects();

    // Find the project using its URL slug
    const project = databaseProjects.find(
      (item) => getProjectSlug(item) === slug);

    if (!project) {
      console.error("Project not found:", slug);
      return false;
    }

    // Display project information from MySQL
    const turnIntoSuitableData = {
      id: project.id,
      Title: project.Title,
      Introduction: project.Introduction || "",
      Description: project.Description || "",
      Department: project.DepartmentID ? departmentNames[project.DepartmentID] || `Department ${project.DepartmentID}`: "Department not assigned",  
      image: project.images?.[0]?.url || "",
    highlightImages: (project.images || []).map((image) => ({
        src: image.url,
        alt: `Highlight from ${project.Title}`,
    })),
    highlightTemplate: "four",    
      CreatedAt: project.createdAt ? new Date(project.createdAt).getFullYear() : null,
      UpdatedAt: project.UpdatedAt,
      Popular: project.popular,
      student: "Swinburne student",
      category: "Student project",
      details: [],
      sections: {},
      availableSections: [],
    }

    currentSlug = slug;
    currentProject = turnIntoSuitableData;
    originalProject = turnIntoSuitableData;
    
    detailName.textContent = turnIntoSuitableData.Title;
    overview.textContent = turnIntoSuitableData.Introduction;
    
    renderDetails(turnIntoSuitableData);
    renderHighlights(turnIntoSuitableData);

    if (turnIntoSuitableData.image) {
    heroImage.src = turnIntoSuitableData.image;
    heroImage.alt = `Project image for ${turnIntoSuitableData.Title}`;
    heroImage.hidden = false;
} else {
    heroImage.removeAttribute("src");
    heroImage.hidden = true;
}

    // Display other projects as related projects. Using AI on this one 
    relatedGrid.innerHTML = databaseProjects
  .filter((item) => item.id !== project.id)
  
  .map(
    (item) => {
      const imageUrl = item.images?.[0]?.url || "";

      return `
        <a
          class="project-related-card"
          href="#/project/${escapeHtml(getProjectSlug(item))}"
        >
          ${
            imageUrl
              ? `
                <div class="project-related-card-image">
                  <img
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(item.Title)}"
                    loading="lazy"
                  />
                </div>
              `
              : `
                <div class="project-related-card-image project-related-card-placeholder">
                  <span>No image available</span>
                </div>
              `
          }

          <span class="project-related-card-copy">
            <small>Student project</small>
            <strong>${escapeHtml(item.Title)}</strong>
            <span>
              Swinburne student ·
              ${
                item.CreatedAt
                  ? new Date(item.CreatedAt).getFullYear()
                  : "Not specified"
              }
            </span>
          </span>

          <span class="project-related-arrow" aria-hidden="true">↗</span>
        </a>
      `;
    }
  )
  .join("");
    page.hidden = false;
    closeEditor();
    document.title = `${turnIntoSuitableData.Title} | Swinburne Student Showcase`;

return true;
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

  function getEditorData(project) {
  return {
    title: project.title || project.Title || "",
    introduction:
      project.firstParagraph ||
      project.description ||
      project.Introduction ||
      project.Description ||
      "",
    date: project.date || project.CreatedAt || "",
    campus: project.campus || "",
    student: project.student || "",
    category: project.category || "",
    unitNameCode: project.unitNameCode || "",
    clients: project.clients || "",
    deliverables: project.deliverables || "",
    platforms: project.platforms || "",
    supervisors: project.supervisors || "",
    department: String(project.department || project.DepartmentID || ""),
    coverImage: project.image || "",
    details: project.details || [], sections: Array.isArray(project.sections)? project.sections: Object.entries(project.sections || {})
      .filter(([key]) => key !== "gallery")
      .map(([key, section]) => {
        const content =
          typeof section === "string" ? { body: section } : section || {};

        return {
          title: content.title || key,
          body: content.body || content.content || "",
          items: Array.isArray(content.items)
            ? content.items.map((item) =>
                typeof item === "string" ? item : item.label || "",
              )
            : [],
        };
      }),    highlightImages: project.highlightImages || [],
    highlightTemplate: project.highlightTemplate || "four",
    videoUrl: project.videoUrl || "",
    uploadedVideoName: project.uploadedVideoName || "",
    issuuUrl: project.issuuUrl || "",
  };
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
    editorHighlightTemplate.value = data.highlightTemplate;
    editorHighlightVideoUrl.value = data.videoUrl;
    editorHighlightIssuuUrl.value = data.issuuUrl;
    editorHighlightVideoFile = null;
    editorSavedVideoName = data.uploadedVideoName;
    updateVideoUploadStatus();
    updateHighlightEditorControls();
    setEditorMessage("");
    setEditorError("");
  }

  function updateVideoUploadStatus() {
    const fileName =
      editorHighlightVideoFile?.name || editorSavedVideoName;
    editorHighlightVideoUploadStatus.textContent = fileName
      ? editorHighlightVideoFile
        ? `Selected video: ${fileName}`
        : `Saved uploaded video: ${fileName}`
      : "";
    editorHighlightVideoUploadStatus.hidden = !fileName;
  }

  function updateHighlightEditorControls() {
    const template = editorHighlightTemplate.value;
    editorHighlightImagesControls.hidden =
      template !== "four" && template !== "three";
    editorHighlightVideoControls.hidden = template !== "video";
    editorHighlightIssuuControls.hidden = template !== "issuu";
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

  // function show(slug) {
  //   originalProject = getProjectBySlug(slug);
  //   if (!originalProject) return false;

  //   currentSlug = slug;
    const loadGeneration = ++videoLoadGeneration;
    if (currentVideoObjectUrl) {
      URL.revokeObjectURL(currentVideoObjectUrl);
      currentVideoObjectUrl = "";
    }
  //   setPageError("");
  //   setPageMessage("");
  //   const savedEdits = readSavedEdits(slug);
  //   const project = applySavedEdits(originalProject, savedEdits);
  //   renderProject(project, slug);
    // if (project.uploadedVideoName && !project.videoUrl) {
    //   readProjectVideo(slug)
    //     .then((file) => {
    //       if (loadGeneration !== videoLoadGeneration || currentSlug !== slug) {
    //         return;
    //       }
    //       if (!(file instanceof Blob)) {
    //         throw new Error("The saved video file could not be found.");
    //       }
    //       currentVideoObjectUrl = URL.createObjectURL(file);
    //       project.uploadedVideoUrl = currentVideoObjectUrl;
    //       currentProject = project;
    //       renderHighlights(project);
    //     })
    //     .catch((error) => {
    //       if (loadGeneration === videoLoadGeneration && currentSlug === slug) {
    //         setPageError(
    //           `Saved video could not be loaded: ${getErrorMessage(error)}`,
    //         );
    //       }
    //     });
    // }
  //   closeEditor();
  //   page.hidden = false;
  //   requestAnimationFrame(updateRelatedControls);
  //   return true;
  // }


  function hide() {
    page.hidden = true;
    closeEditor();
    videoLoadGeneration += 1;
    if (currentVideoObjectUrl) {
      URL.revokeObjectURL(currentVideoObjectUrl);
      currentVideoObjectUrl = "";
    }
    document.title = "Swinburne Student Showcase";
  }

  editToggle.addEventListener("click", () => {
    if (editor.hidden) {
      openEditor();
    } else {
      closeEditor();
    }
  });

  highlightGrid.addEventListener("click", (event) => {
    const zoomButton = event.target.closest("[data-highlight-open]");
    if (!zoomButton) return;

    const image = zoomButton.querySelector("img");
    const caption = zoomButton
      .closest(".project-highlight-item")
      .querySelector("figcaption");
    imageLightboxImage.src = image.currentSrc || image.src;
    imageLightboxImage.alt = image.alt;
    imageLightboxCaption.textContent = caption?.textContent || image.alt;
    imageLightbox.showModal();
  });

  imageLightboxClose.addEventListener("click", () => imageLightbox.close());
  imageLightbox.addEventListener("click", (event) => {
    if (event.target === imageLightbox) imageLightbox.close();
  });
  imageLightbox.addEventListener("close", () => {
    imageLightboxImage.removeAttribute("src");
    imageLightboxCaption.textContent = "";
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
      if (
        editorHighlightTemplate.value === "three" &&
        images.length + files.length !== 3
      ) {
        throw new Error(
          "The Three large pictures layout requires exactly 3 pictures.",
        );
      }
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

  editorHighlightVideoUpload.addEventListener("change", () => {
    const file = editorHighlightVideoUpload.files[0];
    if (!file) return;
    setEditorError("");
    if (!file.type.startsWith("video/")) {
      setEditorError("Choose a video file.");
      editorHighlightVideoUpload.value = "";
      return;
    }
    if (file.size > maxHighlightVideoFileSize) {
      setEditorError("The video must be smaller than 200 MB.");
      editorHighlightVideoUpload.value = "";
      return;
    }

    editorHighlightVideoFile = file;
    editorHighlightVideoUrl.value = "";
    updateVideoUploadStatus();
    setEditorMessage("Video added. Save changes to keep it in this browser.");
    editorHighlightVideoUpload.value = "";
  });

  editorHighlightVideoUrl.addEventListener("input", () => {
    if (!editorHighlightVideoUrl.value.trim()) return;
    editorHighlightVideoFile = null;
    updateVideoUploadStatus();
  });

  editorHighlightTemplate.addEventListener(
    "change",
    updateHighlightEditorControls,
  );

  editorCancel.addEventListener("click", () => {
    closeEditor();
    setEditorError("");
  });

  editorReset.addEventListener("click", async () => {
    if (!window.confirm("Remove the saved edits for this project page?")) {
      return;
    }
    try {
      if (currentProject.uploadedVideoName) {
        await deleteProjectVideo(currentSlug);
      }
      localStorage.removeItem(storageKey(currentSlug));
    } catch (error) {
      setEditorError(
        `Saved edits could not be removed: ${getErrorMessage(error)}`,
      );
      return;
    }
    if (currentVideoObjectUrl) {
      URL.revokeObjectURL(currentVideoObjectUrl);
      currentVideoObjectUrl = "";
    }
    currentProject = originalProject;
    renderProject(originalProject, currentSlug);
    closeEditor();
    setPageError("");
    setPageMessage("Saved edits removed.");
  });

  editorForm.addEventListener("submit", async (event) => {
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

    const highlightTemplate = editorHighlightTemplate.value;
    const videoUrl = editorHighlightVideoUrl.value.trim();
    const issuuUrl = editorHighlightIssuuUrl.value.trim();
    const highlightImages = readEditorHighlights();
    if (highlightTemplate === "three" && highlightImages.length !== 3) {
      setEditorError(
        "The Three large pictures layout requires exactly 3 pictures.",
      );
      return;
    }
    if (
      highlightTemplate === "video" &&
      !editorHighlightVideoFile &&
      !editorSavedVideoName &&
      !getVideoUrl(videoUrl)
    ) {
      setEditorError(
        "Upload a video or enter a valid video link (MP4/WebM, YouTube, or Vimeo).",
      );
      return;
    }
    if (highlightTemplate === "issuu" && !getIssuuEmbedUrl(issuuUrl)) {
      setEditorError(
        "Enter a published Issuu document link containing /docs/.",
      );
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
      highlightTemplate,
      videoUrl: editorHighlightVideoFile ? "" : videoUrl,
      uploadedVideoName:
        editorHighlightVideoFile?.name || editorSavedVideoName,
      issuuUrl,
    };
    let previousVideoFile;
    let videoSaved = false;
    try {
      if (editorHighlightVideoFile) {
        previousVideoFile = await readProjectVideo(currentSlug);
        await saveProjectVideo(currentSlug, editorHighlightVideoFile);
        videoSaved = true;
      }
      localStorage.setItem(storageKey(currentSlug), JSON.stringify(edits));
    } catch (error) {
      let saveError = error;
      if (videoSaved) {
        try {
          if (previousVideoFile instanceof Blob) {
            await saveProjectVideo(currentSlug, previousVideoFile);
          } else {
            await deleteProjectVideo(currentSlug);
          }
        } catch (restoreError) {
          saveError = new Error(
            `${getErrorMessage(error)} The previous video could not be restored: ${getErrorMessage(restoreError)}`,
          );
        }
      }
      setEditorError(
        `Changes could not be saved in this browser: ${getErrorMessage(saveError)}`,
      );
      return;
    }

    currentProject = applySavedEdits(originalProject, edits);
    if (editorHighlightVideoFile) {
      if (currentVideoObjectUrl) {
        URL.revokeObjectURL(currentVideoObjectUrl);
      }
      currentVideoObjectUrl = URL.createObjectURL(editorHighlightVideoFile);
      currentProject.uploadedVideoUrl = currentVideoObjectUrl;
      editorSavedVideoName = editorHighlightVideoFile.name;
      editorHighlightVideoFile = null;
    } else if (currentProject.videoUrl && currentVideoObjectUrl) {
      URL.revokeObjectURL(currentVideoObjectUrl);
      currentVideoObjectUrl = "";
    }
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