/**
 * ArXiv API Integration
 * Fetches publication abstracts from arXiv based on paper IDs
 */

class ArxivFetcher {
  constructor() {
    this.baseUrl = 'https://export.arxiv.org/api/query';
    console.log('ArxivFetcher initialized');
  }

  /**
   * Fetch a publication's details from arXiv
   * @param {string} arxivId - The arXiv ID (e.g., "2104.08821")
   * @returns {Promise} - Promise containing publication data
   */
  async fetchPublication(arxivId) {
    console.log(`Fetching publication with ID: ${arxivId}`);
    try {
      const response = await fetch(`${this.baseUrl}?id_list=${arxivId}`);
      const data = await response.text();
      const result = this.parseArxivResponse(data);
      console.log(`Fetched data for ${arxivId}:`, result);
      return result;
    } catch (error) {
      console.error(`Error fetching arXiv data for ${arxivId}:`, error);
      return null;
    }
  }

  /**
   * Parse the XML response from arXiv
   * @param {string} xmlString - XML response from arXiv API
   * @returns {Object} - Parsed publication data
   */
  parseArxivResponse(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Check if there's an error in the response
    const error = xmlDoc.querySelector("error");
    if (error) {
      console.error("Error in arXiv response:", error.textContent);
      return null;
    }

    const entry = xmlDoc.querySelector("entry");
    if (!entry) {
      console.error("No entry found in arXiv response");
      return null;
    }

    return {
      title: entry.querySelector("title")?.textContent.trim() || "",
      abstract: entry.querySelector("summary")?.textContent.trim() || "",
      authors: Array.from(entry.querySelectorAll("author name")).map(author => author.textContent.trim()),
      published: entry.querySelector("published")?.textContent || "",
      link: entry.querySelector("link[title='pdf']")?.getAttribute("href") || "",
      doi: entry.querySelector("arxiv\\:doi")?.textContent || ""
    };
  }
}

// Initialize and run when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded in arxiv.js');
  
  // Wait for components to be loaded
  document.addEventListener('componentLoaded', (e) => {
    console.log(`Component loaded event: ${e.detail.id}`);
    
    if (e.detail.id === 'publications') {
      console.log('Publications component loaded, initializing abstract buttons');
      const arxivFetcher = new ArxivFetcher();
      
      // Add toggle functionality for abstracts
      const abstractButtons = document.querySelectorAll('.show-abstract-btn');
      console.log(`Found ${abstractButtons.length} abstract buttons`);
      
      abstractButtons.forEach(button => {
        button.addEventListener('click', function() {
          console.log('Abstract button clicked');
          const card = this.closest('.publication-card');
          const abstractContainer = card.querySelector('.publication-abstract');
          const arxivId = card.getAttribute('data-arxiv-id');
          
          console.log(`Toggle abstract for ${arxivId}`);
          
          if (abstractContainer.style.display === 'none' || !abstractContainer.style.display) {
            abstractContainer.style.display = 'block';
            this.textContent = 'Hide Abstract';
            
            // Fetch abstract if it hasn't been loaded yet
            if (abstractContainer.innerHTML === '' || abstractContainer.innerHTML === '<p>Abstract not available</p>') {
              console.log(`Fetching abstract for ${arxivId}`);
              abstractContainer.innerHTML = '<p>Loading abstract...</p>';
              
              if (arxivId) {
                arxivFetcher.fetchPublication(arxivId).then(publication => {
                  if (publication && publication.abstract) {
                    abstractContainer.innerHTML = `<p>${publication.abstract}</p>`;
                  } else {
                    abstractContainer.innerHTML = '<p>Abstract not available</p>';
                  }
                });
              }
            }
          } else {
            abstractContainer.style.display = 'none';
            this.textContent = 'Show Abstract';
          }
        });
      });
    }
  });
});
