/**
 * News Feed Component
 * Displays and filters news articles dynamically
 */

import { newsData } from '../data/news-articles.js';

class NewsFeed {
  constructor() {
    this.container = document.getElementById('news-feed');
    this.emptyState = document.getElementById('empty-state');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.currentFilter = 'all';
    
    if (!this.container) return;
    
    this.init();
  }

  init() {
    this.setupFilters();
    this.renderArticles();
  }

  setupFilters() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.setActiveFilter(filter);
        this.filterArticles(filter);
      });
    });
  }

  setActiveFilter(filter) {
    this.currentFilter = filter;
    this.filterButtons.forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('filter-btn--active');
      } else {
        btn.classList.remove('filter-btn--active');
      }
    });
  }

  filterArticles(filter) {
    const articles = this.container.querySelectorAll('.news-article');
    let visibleCount = 0;

    articles.forEach(article => {
      const category = article.dataset.category;
      
      if (filter === 'all' || category === filter) {
        article.style.display = 'flex';
        visibleCount++;
      } else {
        article.style.display = 'none';
      }
    });

    // Show/hide empty state
    if (visibleCount === 0) {
      this.emptyState.style.display = 'block';
    } else {
      this.emptyState.style.display = 'none';
    }
  }

  renderArticles() {
    if (!newsData || newsData.length === 0) {
      this.emptyState.style.display = 'block';
      return;
    }

    // Sort by date (newest first)
    const sortedNews = [...newsData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    sortedNews.forEach((article, index) => {
      const articleElement = this.createArticleElement(article, index === 0);
      this.container.appendChild(articleElement);
    });
  }

  createArticleElement(article, isFeatured = false) {
    const articleEl = document.createElement('article');
    articleEl.className = 'news-article';
    if (isFeatured && article.featured) {
      articleEl.classList.add('news-article--featured');
    }
    articleEl.dataset.category = article.category;

    // Format date
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Category labels
    const categoryLabels = {
      'aankondiging': 'Aankondiging',
      'voortgang': 'Voortgang',
      'technisch': 'Technisch',
      'evenement': 'Evenement'
    };

    articleEl.innerHTML = `
      <header class="news-article__header">
        <div class="news-article__meta">
          <time class="news-article__date" datetime="${article.date}">
            ${formattedDate}
          </time>
          <span class="news-article__category" data-category="${article.category}">
            ${categoryLabels[article.category] || article.category}
          </span>
        </div>
      </header>

      <h2 class="news-article__title">${article.title}</h2>
      
      <p class="news-article__summary">${article.summary}</p>

      ${article.content ? `
        <div class="news-article__content">
          ${article.content}
        </div>
      ` : ''}

      ${(article.tags && article.tags.length > 0) || article.link ? `
        <footer class="news-article__footer">
          ${article.tags && article.tags.length > 0 ? `
            <div class="news-article__tags">
              ${article.tags.map(tag => `
                <span class="news-article__tag">${tag}</span>
              `).join('')}
            </div>
          ` : '<div></div>'}
          
          ${article.link ? `
            <a href="${article.link}" class="news-article__read-more">
              Lees meer
            </a>
          ` : ''}
        </footer>
      ` : ''}
    `;

    return articleEl;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new NewsFeed());
} else {
  new NewsFeed();
}

export default NewsFeed;
