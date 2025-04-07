const textArray = [
  "Data Scientist",
  "Python Programmer",
  "AI/ML Enthusiast",
];
let index = 0;

const changingTextElement = document.getElementById("changing-text");

function updateText() {
  const currentText = changingTextElement.textContent;
  const nextText = textArray[index];

  if (currentText !== nextText) {
    // Fade-out effect
    changingTextElement.style.opacity = 0;

    setTimeout(() => {
      // Change the text after fading out
      changingTextElement.textContent = nextText;
      // Fade-in effect
      changingTextElement.style.opacity = 1;
      // Update the index
      index = (index + 1) % textArray.length;
    }, 500); // Matches the transition time in CSS
  } else {
    // Update the index if the text hasn't changed
    index = (index + 1) % textArray.length;
  }
}

document.querySelector('.scroll-hint').addEventListener('click', () => {
  window.scrollBy({
    top: window.innerHeight,
    behavior: 'smooth'
  });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Fetch GitHub projects (ignoring "rohansadaphule" repository and including website link below description)
async function fetchProjects() {
  const username = "rohansadaphule"; // Your GitHub username
  const projectsCount = 6; // Load top 4 projects (change to 3 if you prefer)
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=${projectsCount}`);
    if (!response.ok) throw new Error('Failed to fetch GitHub repos');
    const repos = await response.json();

    const projectsList = document.getElementById("projects-list");
    projectsList.innerHTML = "";  // Clear previous entries

    let projectCount = 0; // Counter for loaded projects

    repos.forEach(repo => {
      // Skip if the repo is named "rohansadaphule", is a fork, or has no description
      if (repo.name.toLowerCase() === "rohansadaphule" || repo.fork || !repo.description) return;

      if (projectCount < projectsCount) { // Ensure we only load up to 4 projects
        let websiteLink = '';
        if (repo.homepage && repo.homepage !== '') {
          websiteLink = `
                      <p class="mt-2 text-gray-400 text-sm">Website: <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="text-white hover:text-gray-300 transition">${repo.homepage}</a></p>
                  `;
        } else {
          websiteLink = `
                      <p class="mt-2 text-gray-400 text-sm">Website: Not available</p>
                  `;
        }

        const projectDiv = document.createElement("div");
        projectDiv.className = "p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2";
        projectDiv.innerHTML = `
                  <h3 class="text-2xl font-semibold mb-4">${repo.name}</h3>
                  <p class="mb-4 text-gray-300">${repo.description || 'No description available.'}</p>
                  <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="text-white hover:text-gray-300 transition">View on GitHub →</a>
                  ${websiteLink}
              `;
        projectsList.appendChild(projectDiv);
        projectCount++;
      }
    });

    // If no valid projects are found (after filtering), show a message
    if (projectCount === 0) {
      projectsList.innerHTML = '<p class="text-gray-300 text-center">No projects found. Please check your GitHub profile.</p>';
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    const projectsList = document.getElementById("projects-list");
    projectsList.innerHTML = '<p class="text-gray-300 text-center">Failed to load projects. Please try again later.</p>';
  }
}

document.addEventListener("DOMContentLoaded", function () {
  let user = "rohansadaphule";
  let domain = "gmail.com";
  let email = user + "@" + domain;
  let mailtoLink = `mailto:${email}`;

  let emailElement = document.getElementById("email-link");
  let emailText = document.getElementById("email-text");

  if (emailElement && emailText) {
    emailElement.href = mailtoLink; // Set the href dynamically
    emailText.textContent = email; // Set the text content
  }
});

// Toggle mobile navigation menu
document.getElementById('menu-toggle').addEventListener('click', () => {
  const navMenu = document.getElementById('nav-menu');
  navMenu.classList.toggle('active');
});

document.querySelectorAll('#nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 768) { // Only on mobile
      document.getElementById('nav-menu').classList.remove('active');
    }
  });
});

// Initialize the text and start the interval
changingTextElement.textContent = textArray[index];
setInterval(updateText, 2000); // Change every 2 seconds

// Call fetchProjects when the page loads
window.onload = fetchProjects;
