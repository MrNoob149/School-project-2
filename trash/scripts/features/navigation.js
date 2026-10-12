export function initializeNavigation({ onViewChange, onDepartmentChange }) {
  const navLinks = document.querySelectorAll("[data-view]");
  const mainNav = document.querySelector("#main-nav");
  const menuToggle = document.querySelector("#menu-toggle");
  const aboutMenu = document.querySelector(".about-menu");
  const aboutMenuToggle = document.querySelector(".about-menu-toggle");
  let activeDepartment = null;

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
    activeDepartment = departmentId;
    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    aboutMenuToggle.classList.add("is-active");
    aboutMenuToggle.setAttribute("aria-current", "page");
    closeMenus();
    onDepartmentChange(departmentId);
  }

  function showView(view, { clearRoute = false, scroll = true } = {}) {
    activeDepartment = null;
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

    if (scroll) {
      (view === "home"
        ? document.querySelector("#top")
        : document.querySelector("#showcase-title")
      ).scrollIntoView({ behavior: "smooth" });
    }
  }

  function routeFromLocation() {
    const match = window.location.hash.match(/^#\/department\/([1-4])$/);
    if (match) {
      showDepartment(Number(match[1]));
    } else if (activeDepartment !== null) {
      showView("home", { scroll: true });
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      showView(link.dataset.view, { clearRoute: true });
    });
  });

  aboutMenuToggle.addEventListener("click", () => {
    const isOpen = aboutMenuToggle.getAttribute("aria-expanded") === "true";
    aboutMenuToggle.setAttribute("aria-expanded", String(!isOpen));
    aboutMenu.classList.toggle("is-open", !isOpen);
    if (isOpen) aboutMenuToggle.blur();
  });

  aboutMenu.addEventListener("focusin", () => {
    aboutMenuToggle.setAttribute("aria-expanded", "true");
  });

  aboutMenu.addEventListener("focusout", (event) => {
    if (aboutMenu.contains(event.relatedTarget)) return;
    aboutMenu.classList.remove("is-open");
    aboutMenuToggle.setAttribute("aria-expanded", "false");
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

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("is-open", !isOpen);
  });

  window.addEventListener("hashchange", routeFromLocation);
  window.addEventListener("popstate", routeFromLocation);

  routeFromLocation();
}
