const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const year = document.querySelector("#current-year");
const projectGrid = document.querySelector("#project-grid");
const projectsStatus = document.querySelector("#projects-status");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");

year.textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }
});

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createExternalLink(url, label, className = "") {
  if (!url) {
    return null;
  }

  let destination;
  try {
    destination = new URL(url);
  } catch {
    return null;
  }
  if (destination.protocol !== "https:") {
    return null;
  }

  const link = createTextElement("a", className, label);
  link.href = destination.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(createTextElement("span", "", "↗"));
  link.lastElementChild.setAttribute("aria-hidden", "true");
  return link;
}

function createProjectCard(project, index) {
  const themes = ["lilac", "yellow", "mint"];
  const visuals = ["orbit", "grid", "wave"];
  const theme = themes.includes(project.theme) ? project.theme : themes[index % themes.length];
  const visual = visuals.includes(project.visual) ? project.visual : visuals[index % visuals.length];
  const card = document.createElement("article");
  card.className = `project-card project-card-${theme}`;

  const artwork = document.createElement("div");
  artwork.className = `project-visual visual-${visual}`;
  artwork.setAttribute("aria-hidden", "true");
  artwork.append(createTextElement("span", "", String(index + 1).padStart(2, "0")));
  artwork.append(document.createElement("i"), document.createElement("b"));

  const meta = document.createElement("div");
  meta.className = "project-meta";
  meta.append(createTextElement("span", "", `${String(index + 1).padStart(2, "0")} — ${project.category}`));
  meta.append(createTextElement("span", "project-arrow", "↗"));
  meta.lastElementChild.setAttribute("aria-hidden", "true");

  card.append(
    artwork,
    meta,
    createTextElement("h3", "", project.title),
    createTextElement("p", "", project.description),
  );

  const tags = document.createElement("div");
  tags.className = "tag-list";
  if (Array.isArray(project.technologies)) {
    for (const technology of project.technologies) {
      tags.append(createTextElement("span", "", technology));
    }
  }

  const links = document.createElement("div");
  links.className = "project-links";
  const sourceLink = createExternalLink(project.repo_url, "Source code");
  const demoLink = createExternalLink(project.demo_url, "Live demo", "project-demo-link");
  if (sourceLink) {
    links.append(sourceLink);
  }
  if (demoLink) {
    links.append(demoLink);
  }
  card.append(tags, links);
  return card;
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    const result = await response.json();
    if (!response.ok || !Array.isArray(result.projects)) {
      throw new Error(result.error || "The projects could not be loaded.");
    }

    projectGrid.replaceChildren(...result.projects.map(createProjectCard));
    projectsStatus.textContent = result.projects.length ? "" : "No projects are available yet.";
  } catch {
    projectGrid.replaceChildren();
    projectsStatus.textContent = "Projects could not be loaded. Check that the portfolio server is running.";
  }
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formValues = new FormData(contactForm);
  submitButton.disabled = true;
  contactStatus.textContent = "Sending your message…";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formValues)),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Your message could not be sent.");
    }

    contactForm.reset();
    contactStatus.textContent = result.message;
  } catch (error) {
    contactStatus.textContent = error instanceof Error
      ? error.message
      : "Your message could not be sent. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});

loadProjects();
