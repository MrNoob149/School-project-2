export function initializeNavigation({
  onViewChange,
  onDepartmentChange,
  onAboutChange,
  onProjectChange,
}) {
  const navLinks = document.querySelectorAll("[data-view]");
  const mainNav = document.querySelector("#main-nav");
  const menuToggle = document.querySelector("#menu-toggle");
  const aboutMenu = document.querySelector(".about-menu");
  const aboutMenuToggle = document.querySelector(".about-menu-toggle");
  const aboutLinks = document.querySelectorAll("[data-about]");
  let activeRoute = null;

  function closeMenus() {
    aboutMenu.classList.remove("is-open");
    aboutMenuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function setActiveView(view) {
    aboutMenuToggle.classList.remove("is-active");
    aboutMenuToggle.removeAttribute("aria-current");
    navLinks.forEach((link) => {
      const isCurrent = link.dataset.view === view;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function showDepartment(departmentId) {
    activeRoute = `department:${departmentId}`;
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    aboutMenuToggle.classList.add("is-active");
    aboutMenuToggle.setAttribute("aria-current", "page");
    closeMenus();
    onDepartmentChange(departmentId);
    window.scrollTo(0, 0);
  }

  function showAbout(page) {
    activeRoute = `about:${page}`;
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    aboutMenuToggle.classList.add("is-active");
    aboutMenuToggle.setAttribute("aria-current", "page");
    closeMenus();
    onAboutChange(page);
    document.title =
      page === "swinburne"
        ? "About Swinburne - Swinburne Student Showcase"
        : "Meet our website contributor - Swinburne Student Showcase";
    window.scrollTo(0, 0);
  }

  function showView(view, { clearRoute = false, scroll = true } = {}) {
    activeRoute = null;
    if (clearRoute) {
      window.history.pushState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
    setActiveView(view);
    closeMenus();
    onViewChange(view);
    document.title = "Swinburne Student Showcase";

    if (scroll) {
      (view === "home"
        ? document.querySelector("#top")
        : document.querySelector("#showcase-title")
      ).scrollIntoView({ behavior: "smooth" });
    }
  }

  function showProject(slug) {
    activeRoute = `project:${slug}`;
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    aboutMenuToggle.classList.remove("is-active");
    aboutMenuToggle.removeAttribute("aria-current");
    closeMenus();

    if (!onProjectChange(slug)) {
      showView("home", { clearRoute: true, scroll: false });
    }
  }

  function routeFromLocation() {
    if (window.location.hash === "#contact-section") {
      showView("home", { scroll: false });
      document
        .querySelector("#contact-section")
        .scrollIntoView({ behavior: "smooth" });
      return;
    }

    const departmentMatch = window.location.hash.match(/^#\/department\/([1-4])$/);
    const projectMatch = window.location.hash.match(/^#\/project\/([a-z0-9-]+)$/);
    const aboutMatch = window.location.hash.match(
      /^#\/about\/(swinburne|contributors)$/,
    );

    if (aboutMatch) {
      showAbout(aboutMatch[1]);
    } else if (departmentMatch) {
      showDepartment(Number(departmentMatch[1]));
    } else if (projectMatch) {
      showProject(projectMatch[1]);
    } else if (activeRoute !== null) {
      showView("home", { scroll: true });
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.tagName === "A") event.preventDefault();
      showView(link.dataset.view, { clearRoute: true });
    });
  });

  aboutMenuToggle.addEventListener("click", () => {
    const isOpen = aboutMenuToggle.getAttribute("aria-expanded") === "true";
    aboutMenuToggle.setAttribute("aria-expanded", String(!isOpen));
    aboutMenu.classList.toggle("is-open", !isOpen);
  });

  document.addEventListener("click", (event) => {
    if (aboutMenu.contains(event.target)) return;
    aboutMenu.classList.remove("is-open");
    aboutMenuToggle.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    aboutMenu.classList.remove("is-open");
    aboutMenuToggle.setAttribute("aria-expanded", "false");
    aboutMenuToggle.focus();
  });

  document.querySelectorAll("[data-department]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const departmentId = Number(link.dataset.department);
      const route = `#/department/${departmentId}`;
      if (window.location.hash !== route) {
        window.history.pushState(null, "", route);
      }
      showDepartment(departmentId);
    });
  });

  aboutLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.dataset.about;
      const route = `#/about/${page}`;
      if (window.location.hash !== route) {
        window.history.pushState(null, "", route);
      }
      showAbout(page);
    });
  });

  document.querySelector(".brand").addEventListener("click", (event) => {
    if (activeRoute === null) return;
    event.preventDefault();
    showView("home", { clearRoute: true, scroll: true });
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("is-open", !isOpen);
  });

  window.addEventListener("hashchange", routeFromLocation);
  window.addEventListener("popstate", routeFromLocation);

  routeFromLocation();
}
