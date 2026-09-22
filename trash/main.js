const form = document.querySelector("#project-form");
const grid = document.querySelector("#project-grid");
const emptyState = document.querySelector("#empty-state");
const projectCount = document.querySelector("#project-count");
const formMessage = document.querySelector("#form-message");

const projects = [
  {
    title: "A quieter kind of city",
    description:
      "An illustrated field guide to finding calm in the middle of Melbourne.",
    category: "Communication design",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Second nature",
    description:
      "A speculative installation exploring the relationship between people and plants.",
    category: "Interior architecture",
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Objects with a past",
    description:
      "A photographic study of the traces people leave behind in everyday objects.",
    category: "Photography",
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
        <article class="project-card">
          <div class="project-image-wrap">
            <img class="project-image" src="${project.image}" alt="Artwork for ${escapeHtml(project.title)}" />
            <span class="project-number">${String(index + 1).padStart(2, "0")}</span>
          </div>
          <div class="project-details">
            <p class="project-category">${escapeHtml(project.category || "Student project")}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description || "No description added.")}</p>
          </div>
        </article>
      `,
    )
    .join("");

  emptyState.hidden = projects.length > 0;
  projectCount.textContent = `${projects.length} ${projects.length === 1 ? "project" : "projects"}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const imageFile = formData.get("image");
  const addProject = (image) => {
    projects.unshift({
      title: formData.get("title"),
      description: formData.get("description"),
      category: "New submission",
      image:
        image ||
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=85",
    });

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
