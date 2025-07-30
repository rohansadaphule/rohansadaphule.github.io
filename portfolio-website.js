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
  try {
    const projectsList = document.getElementById('projects-list');
    const projectFilter = document.getElementById('project-filter');
    if (!projectsList || !projectFilter) return;

    projectsList.innerHTML = '<div class="col-span-full text-center">Loading projects...</div>';

    const response = await fetch('https://api.github.com/users/rohansadaphule/repos?sort=created&direction=desc');
    if (!response.ok) throw new Error('Failed to fetch projects');

    const repos = await response.json();

    // Define project categories and their keywords
    const categories = {
      python: ['python', 'django', 'flask', 'fastapi'],
      aiml: [
        'machine-learning', 'deep-learning', 'ai', 'ml',
        'tensorflow', 'pytorch', 'keras', 'jupyter',
        'notebook', 'ipynb', 'data-science', 'neural-network',
        'nlp', 'computer-vision', 'scikit-learn'
      ],
      web: ['web', 'html', 'css', 'javascript', 'react', 'vue', 'angular'],
      data: ['data-analysis', 'pandas', 'numpy', 'visualization', 'tableau', 'power-bi']
    };

    // Update the getProjectCategory function to return multiple categories
    function getProjectCategory(repo) {
      const searchText = (
        repo.name + ' ' +
        (repo.description || '') + ' ' +
        (repo.topics || []).join(' ') + ' ' +
        (repo.language || '')
      ).toLowerCase();

      // Get all matching categories
      const matchingCategories = Object.entries(categories).reduce((matches, [category, keywords]) => {
        if (keywords.some(keyword => searchText.includes(keyword))) {
          matches.push(category);
        }
        return matches;
      }, []);

      // Special case for Jupyter notebooks
      const hasJupyterFiles = repo.language === 'Jupyter Notebook' ||
        searchText.includes('jupyter') ||
        searchText.includes('ipynb');

      if (hasJupyterFiles && categories.aiml.some(keyword => searchText.includes(keyword))) {
        if (!matchingCategories.includes('aiml')) {
          matchingCategories.push('aiml');
        }
      }

      return matchingCategories.length > 0 ? matchingCategories : ['other'];
    }

    // Filter out your portfolio repository and process others
    const processedRepos = repos
      .filter(repo => {
        // Ignore specific repositories
        const ignoredRepos = ['rohansadaphule.github.io', '.github', 'config', 'dotfiles'];
        return !repo.fork && !repo.private && !ignoredRepos.includes(repo.name);
      })
      .map(repo => {
        // Get website URL from repository description or homepage
        let websiteUrl = null;
        const descriptionUrls = (repo.description || '').match(/https?:\/\/[^\s]+/g);
        if (repo.homepage) {
          websiteUrl = repo.homepage;
        } else if (descriptionUrls) {
          websiteUrl = descriptionUrls[0];
        }

        return {
          ...repo,
          categories: getProjectCategory(repo),
          websiteUrl
        };
      });

    // Add these constants at the top of your fetchProjects function
    const PROJECTS_PER_PAGE = {
      mobile: 3,    // for screens < 768px
      tablet: 6,    // for screens >= 768px and < 1024px
      desktop: 9    // for screens >= 1024px
    };

    // Fixed filterAndDisplayProjects function
    function filterAndDisplayProjects(category = 'all', showAll = false) {
      const filteredRepos = category === 'all'
        ? processedRepos
        : processedRepos.filter(repo => repo.categories.includes(category));

      // Determine how many projects to show based on screen width
      let projectsToShow;
      if (!showAll) {
        if (window.innerWidth < 768) {
          projectsToShow = PROJECTS_PER_PAGE.mobile;
        } else if (window.innerWidth < 1024) {
          projectsToShow = PROJECTS_PER_PAGE.tablet;
        } else {
          projectsToShow = PROJECTS_PER_PAGE.desktop;
        }
      }

      const visibleRepos = showAll ? filteredRepos : filteredRepos.slice(0, projectsToShow);
      const hasMoreProjects = filteredRepos.length > visibleRepos.length;

      // Fixed: Remove the extra container wrapper that was breaking the layout
      projectsList.innerHTML = filteredRepos.length
        ? `
      ${visibleRepos.map(repo => `
        <div class="flex flex-col h-full p-6 bg-gray-800 rounded-lg shadow-xl transform transition duration-300 hover:scale-105" data-aos="fade-up">
          <div class="flex-1">
            <h3 class="text-xl font-semibold mb-2 truncate">${repo.name}</h3>
            <p class="text-gray-400 mb-4 line-clamp-3">${repo.description || 'No description available'}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              ${repo.categories.map(cat => `
                <span class="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                  ${cat.toUpperCase()}
                </span>
              `).join('')}
            </div>
          </div>
          <div class="mt-auto">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap gap-3">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" 
                  class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition">
                  <i class="fab fa-github"></i> Code
                </a>
                ${repo.websiteUrl ? `
                  <a href="${repo.websiteUrl}" target="_blank" rel="noopener noreferrer" 
                    class="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition">
                    <i class="fas fa-external-link-alt"></i> Demo
                  </a>
                ` : ''}
              </div>
              <span class="text-sm text-gray-500">
                ${new Date(repo.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      `).join('')}
      ${hasMoreProjects ? `
        <div class="col-span-full flex justify-center mt-8">
          <button id="load-more" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Load More Projects
          </button>
        </div>
      ` : ''}
    `
        : '<div class="col-span-full text-center">No projects found in this category</div>';

      // Add event listener for Load More button
      const loadMoreBtn = document.getElementById('load-more');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          filterAndDisplayProjects(category, true);
        });
      }
    }

    // Initial display
    filterAndDisplayProjects();

    // Update the project filter event listener
    projectFilter.addEventListener('change', (e) => {
      filterAndDisplayProjects(e.target.value, false);
    });

    // Add window resize handler to adjust number of visible projects
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentCategory = document.getElementById('project-filter').value;
        filterAndDisplayProjects(currentCategory, false);
      }, 250);
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    document.getElementById('projects-list').innerHTML =
      '<div class="col-span-full text-center">Error loading projects. Please try again later.</div>';
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

// resume pop-up modal code
function openPDF(pdfPath) {
  const modal = document.getElementById('pdfModal');
  const pdfFrame = document.getElementById('pdfFrame');
  pdfFrame.src = pdfPath;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closePDF() {
  const modal = document.getElementById('pdfModal');
  const pdfFrame = document.getElementById('pdfFrame');
  modal.style.display = 'none';
  pdfFrame.src = '';
  document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('pdfModal');
  if (event.target == modal) {
    closePDF();
  }
}

// New code block starts here
document.addEventListener('DOMContentLoaded', function () {
  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Initialize particles.js
  particlesJS('particles-js', {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: ["#ffffff", "#87CEEB", "#ADD8E6"]  // Multiple colors for variety
      },
      shape: {
        type: ["circle", "triangle"],  // Multiple shapes
        stroke: {
          width: 0,
          color: "#000000"
        },
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "bounce",
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  });

  // Call fetchProjects to load GitHub projects
  fetchProjects();

  // Typing effect
  const texts = [
    'Data Scientist',
    'Gen AI Developer',
    'AI/ML Enthusiast',
    'Python Programmer',
    'Problem Solver'
  ];
  let textIndex = 0;
  let charIndex = 0;
  const typingDelay = 150;      // Slightly slower typing
  const erasingDelay = 75;      // Slightly slower erasing
  const newTextDelay = 2500;    // Longer pause between phrases
  const element = document.getElementById('changing-text');

  function type() {
    if (charIndex < texts[textIndex].length) {
      element.textContent += texts[textIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (charIndex > 0) {
      element.textContent = texts[textIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      textIndex = (textIndex + 1) % texts.length;
      setTimeout(type, typingDelay);
    }
  }

  setTimeout(type, newTextDelay);
});

