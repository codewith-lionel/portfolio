const username = "lionel-zodiac";

async function fetchGithub() {
  const res = await fetch(`https://api.github.com/users/${username}`);
  const user = await res.json();

  document.getElementById("avatar").src = user.avatar_url;
  document.getElementById("name").textContent = user.name || user.login;
  document.getElementById("bio").textContent = user.bio || "";

  const resumeUrl = user.blog || user.html_url;
  document.getElementById("resumeBtn").href = resumeUrl;

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated`
  );
  const repos = await reposRes.json();
  const top6 = repos.filter((r) => !r.fork).slice(0, 6);

  document.getElementById("projects-count").textContent = top6.length;
  const grid = document.getElementById("projects-list");
  top6.forEach((repo) => {
    const div = document.createElement("div");
    div.className = "project-card";
    div.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description || ""}</p>
      <a href="${repo.html_url}" target="_blank">View Repo</a>`;
    grid.appendChild(div);
  });

  // Skills – from topics
  const topicsRes = await fetch(
    `https://api.github.com/repos/${username}/${top6[0]?.name}/topics`,
    {
      headers: { Accept: "application/vnd.github.mercy-preview+json" },
    }
  );
  const topicsData = await topicsRes.json();
  const bar = document.getElementById("skills");
  topicsData.names?.slice(0, 10).forEach((skill) => {
    const span = document.createElement("span");
    span.textContent = skill;
    bar.appendChild(span);
  });
}

fetchGithub();
