const username = "codewith-lionel";
const excludedRepo = username;
const projectNames = {
  portfolio: "Portfolio Studio",
  AcademicX: "Academic X",
  Cookify: "Cookify AI",
  "TIME-TABLE-GENERATOR": "Timetable Generator",
  AcademicPerformanceAnalyzer: "Performance Atlas",
  RELEVA: "Releva Clinic"
};

function getProjectName(repositoryName) {
  return projectNames[repositoryName] || repositoryName
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character]));

async function fetchGithub() {
  const projectList = document.getElementById("projects-list");
  try {
    const profileResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!profileResponse.ok) throw new Error(`GitHub profile request failed (${profileResponse.status})`);
    const profile = await profileResponse.json();
    const avatar = document.getElementById("avatar");
    if (profile.avatar_url) avatar.src = profile.avatar_url;
    document.getElementById("follower-count").textContent = profile.followers ?? "0";
    document.getElementById("repo-count").textContent = profile.public_repos ?? "0";
    if (profile.bio) document.getElementById("bio").textContent = profile.bio;

    const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    if (!repoResponse.ok) throw new Error(`Repository request failed (${repoResponse.status})`);
    const repositories = (await repoResponse.json())
      .filter((repo) => !repo.fork && repo.name !== excludedRepo)
      .sort((first, second) => (second.stargazers_count - first.stargazers_count) || (new Date(second.updated_at) - new Date(first.updated_at)))
      .slice(0, 6);

    if (!repositories.length) {
      projectList.innerHTML = `<p class="loading-card">No public projects found yet. <a href="https://github.com/${username}" target="_blank" rel="noreferrer">Visit GitHub ↗</a></p>`;
      return;
    }
    projectList.innerHTML = repositories.map((repo, index) => `
      <article class="project-card">
        <span class="project-number">0${index + 1}</span>
        <h3>${escapeHtml(getProjectName(repo.name))}</h3>
        <p>${escapeHtml(repo.description || "A small experiment in making useful things for the web.")}</p>
        <div class="project-meta">
          ${repo.language ? `<span class="project-lang">${escapeHtml(repo.language)}</span>` : ""}
          <span>${repo.stargazers_count} ★</span>
          <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">Open ↗</a>
        </div>
      </article>`).join("");

    const topics = [...new Set(repositories.flatMap((repo) => repo.topics || []))].slice(0, 6);
    if (topics.length) document.getElementById("skills").innerHTML = [...topics, ...topics].map((topic) => `<span>${escapeHtml(topic)}</span><b>✳</b>`).join("");
  } catch (error) {
    console.error(error);
    projectList.innerHTML = `<p class="loading-card">The live archive is taking a pause. <a href="https://github.com/${username}?tab=repositories" target="_blank" rel="noreferrer">Browse GitHub ↗</a></p>`;
  }
}

function updateZoom() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  document.getElementById("scroll-progress-bar").style.height = `${(progress * 100).toFixed(2)}%`;
}
window.addEventListener("scroll", updateZoom, { passive: true });
window.addEventListener("resize", updateZoom);
updateZoom();

const projectList = document.getElementById("projects-list");

const scrollTop = document.getElementById("scroll-top");
window.addEventListener("scroll", () => scrollTop.classList.toggle("visible", window.scrollY > 500), { passive: true });
scrollTop.addEventListener("click", () => window.scrollTo({ top: 0 }));

const footerLinks = [...document.querySelectorAll(".site-footer a[href^='#']")];
const footerSections = [...document.querySelectorAll("main section[id]")];
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".zoom-section").forEach((section) => revealObserver.observe(section));

const footerSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    footerLinks.forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { threshold: 0.5 });
footerSections.forEach((section) => footerSectionObserver.observe(section));

document.getElementById("current-year").textContent = new Date().getFullYear();
fetchGithub();
