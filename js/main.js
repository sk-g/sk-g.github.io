/**
 * Main JavaScript file for loading modular components
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing components');
  
  // Load all components
  loadComponent('header', 'components/header.html').then(() => {
    // Initialize dark mode after header is loaded
    initDarkMode();
  });
  loadComponent('about', 'components/about.html');
  loadComponent('experience', 'components/experience.html');
  loadComponent('publications', 'components/publications.html');
  loadComponent('contact', 'components/contact.html');
  loadComponent('footer', 'components/footer.html');
});

/**
 * Load HTML component into a container
 * @param {string} id - ID of the container element
 * @param {string} url - URL of the component HTML file
 * @returns {Promise} - Promise that resolves when the component is loaded
 */
async function loadComponent(id, url) {
  try {
    console.log(`Loading component: ${id} from ${url}`);
    const container = document.getElementById(id);
    if (!container) {
      console.error(`Container #${id} not found`);
      return Promise.reject(`Container #${id} not found`);
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    
    const html = await response.text();
    container.innerHTML = html;
    
    // Dispatch event when component is loaded
    const event = new CustomEvent('componentLoaded', { detail: { id } });
    document.dispatchEvent(event);
    console.log(`Component loaded: ${id}`);
    return Promise.resolve();
  } catch (error) {
    console.error(`Error loading component ${id}:`, error);
    return Promise.reject(error);
  }
}

/**
 * Initialize dark mode toggle functionality
 */
function initDarkMode() {
  const darkModeToggle = document.getElementById('theme-toggle');
  if (!darkModeToggle) {
    console.warn('Dark mode toggle not found');
    return;
  }
  
  console.log('Dark mode toggle found, initializing');
  
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    const themeIcon = darkModeToggle.querySelector('i');
    if (themeIcon) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
  }
  
  // Toggle dark mode when the button is clicked
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    // Update icon
    const themeIcon = darkModeToggle.querySelector('i');
    if (themeIcon) {
      if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
  });
}
