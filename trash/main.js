const form = document.querySelector("#project-form");
const grid = document.querySelector("#project-grid");
const emptyState = document.querySelector("#empty-state");
const projectCount = document.querySelector("#project-count");
const formMessage = document.querySelector("#form-message");
const browserTrigger = document.querySelector("#project-browser-trigger");
const browserPanel = document.querySelector("#project-browser-panel");
const browserLayout = document.querySelector("#browser-layout");
const projectPreview = document.querySelector("#project-preview");

let selectedProjectIndex = null;

const projects = [
  {
    title: "A quieter kind of city",
    description:
      "An illustrated field guide to finding calm in the middle of Melbourne.",
    category: "Communication design",
    student: "Maya Chen",
    year: "2026",
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

function renderProjects() {
  grid.innerHTML = projects
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

  emptyState.hidden = projects.length > 0;
  projectCount.textContent = `${projects.length} ${projects.length === 1 ? "project" : "projects"}`;

  const project = projects[selectedProjectIndex];
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

browserTrigger.addEventListener("click", () => {
  const isOpen = browserTrigger.getAttribute("aria-expanded") === "true";
  browserTrigger.setAttribute("aria-expanded", String(!isOpen));
  browserPanel.setAttribute("aria-hidden", String(isOpen));
  browserPanel.inert = isOpen;
  browserPanel.classList.toggle("is-open", !isOpen);
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

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const imageFile = formData.get("image");
  const addProject = (image) => {
    projects.unshift({
      title: formData.get("title"),
      description: formData.get("description"),
      category: "New submission",
      student: "You",
      year: String(new Date().getFullYear()),
      image:
        image ||
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=85",
    });

    selectedProjectIndex = null;
    renderProjects();
    form.reset();
    formMessage.textContent = "Your project is now on the wall.";
    document
      .querySelector("#showcase-title")
      .scrollIntoView({ behavior: "smooth" });
  };

  if (imageFile && imageFile.size) {
    const reader = new FileReader();
    reader.addEventListener("load", () => addProject(reader.result), {
      once: true,
    });
    reader.readAsDataURL(imageFile);
  } else {
    addProject();
  }
});

renderProjects();
