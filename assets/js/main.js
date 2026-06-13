const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const navLinks = document.querySelectorAll(".nav__link");
const header = document.getElementById("header");
const scrollUp = document.getElementById("scroll-up");
const themeButton = document.getElementById("theme-button");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

function trackEvent(eventName, label = "") {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      event_category: "portfolio",
      event_label: label || eventName,
    });
  }
}

function openMenu() {
  navMenu?.classList.add("show-menu");
  document.body.classList.add("nav-open");
}

function closeMenu() {
  navMenu?.classList.remove("show-menu");
  document.body.classList.remove("nav-open");
}

navToggle?.addEventListener("click", openMenu);
navClose?.addEventListener("click", closeMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
    trackEvent("nav_click", link.getAttribute("href") || link.textContent.trim());
  });
});

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => {
    trackEvent(element.dataset.track, element.textContent.trim());
  });
});

function updateHeaderAndScrollButton() {
  if (window.scrollY >= 40) {
    header?.classList.add("scroll-header");
  } else {
    header?.classList.remove("scroll-header");
  }

  if (window.scrollY >= 560) {
    scrollUp?.classList.add("show-scroll");
  } else {
    scrollUp?.classList.remove("show-scroll");
  }
}

window.addEventListener("scroll", updateHeaderAndScrollButton);
updateHeaderAndScrollButton();

function activateNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPosition = window.scrollY + 160;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");
    const navLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach((link) => link.classList.remove("active-link"));
      navLink?.classList.add("active-link");
    }
  });
}

window.addEventListener("scroll", activateNavLink);
activateNavLink();

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
  themeButton?.querySelector("i")?.classList.replace("uil-moon", "uil-sun");
}

themeButton?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");

  const icon = themeButton.querySelector("i");
  if (icon) {
    icon.classList.toggle("uil-moon", !isDark);
    icon.classList.toggle("uil-sun", isDark);
  }

  trackEvent("theme_toggle", isDark ? "dark" : "light");
});

const experienceTabs = document.querySelectorAll(".experience__tab");
const experiencePanels = document.querySelectorAll(".experience__panel");

experienceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    experienceTabs.forEach((item) => item.classList.remove("active"));
    experiencePanels.forEach((panel) => panel.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`${target}-panel`)?.classList.add("active");

    trackEvent("experience_tab", target);
  });
});

async function submitContactForm(event) {
  event.preventDefault();

  if (!contactForm || !formStatus) return;

  const submitButton = contactForm.querySelector("button[type='submit']");
  const formData = new FormData(contactForm);

  formStatus.textContent = "Sending your message...";
  formStatus.className = "form__status";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.style.opacity = "0.75";
  }

  try {
    const response = await fetch(contactForm.action, {
      method: contactForm.method,
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      contactForm.reset();
      formStatus.textContent = "Message sent successfully. I’ll get back to you soon.";
      formStatus.classList.add("success");
      trackEvent("contact_form_submit", "success");
    } else {
      const data = await response.json().catch(() => null);
      const message = data?.errors?.[0]?.message || "Something went wrong. Please try again.";
      formStatus.textContent = message;
      formStatus.classList.add("error");
      trackEvent("contact_form_submit", "error");
    }
  } catch (error) {
    formStatus.textContent = "Network error. Please email me directly instead.";
    formStatus.classList.add("error");
    trackEvent("contact_form_submit", "network_error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
    }
  }
}

contactForm?.addEventListener("submit", submitContactForm);
