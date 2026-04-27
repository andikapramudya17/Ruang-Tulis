const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");
const navMenu = document.getElementById("navMenu");
const menuToggle = document.getElementById("menuToggle");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const filterButtons = document.querySelectorAll(".filter-btn");
const archiveItems = document.querySelectorAll(".archive-group li");

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(pageId);

  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.classList.remove("active");

    if (link.dataset.page === pageId) {
      link.classList.add("active");
    }
  });

  navMenu.classList.remove("open");
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const pageId = link.dataset.page;

    if (pageId) {
      event.preventDefault();
      history.pushState(null, "", `#${pageId}`);
      showPage(pageId);
    }
  });
});

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeIcon.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeIcon.textContent = "🌙";
  }

  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    archiveItems.forEach((item) => {
      const category = item.dataset.category;

      if (filter === "all" || category === filter) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });
  });
});

window.addEventListener("popstate", () => {
  const pageId = window.location.hash.replace("#", "") || "home";
  showPage(pageId);
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? "dark" : "light");
  }

  const pageId = window.location.hash.replace("#", "") || "home";
  showPage(pageId);
});
