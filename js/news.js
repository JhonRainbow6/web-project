document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    // Reemplaza con tu API key de NewsAPI. Puedes obtener una gratis en https://newsapi.org/
    const apiKey = 'c468383cdb1d45289e7586f57f420423'; 

    async function fetchNews() {
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayNews(data.articles); 
        } catch (error) {
            console.error('Error fetching news from NewsAPI:', error);
            newsContainer.innerHTML = '<p>No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.</p>';
        }
    }

    function displayNews(articles) {
        newsContainer.innerHTML = '';
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '<p>No hay noticias disponibles en este momento.</p>';
            return;
        }

        articles.forEach(article => {
            if (!article.urlToImage || !article.title) {
                return; // Omitir artículos sin imagen o título
            }
            const articleElement = document.createElement('div');
            articleElement.classList.add('news-article');

            articleElement.innerHTML = `
                <img src="${article.urlToImage}" alt="${article.title}">
                <h3>${article.title}</h3>
                <a href="${article.url}" target="_blank" rel="noopener noreferrer">Ver detalles</a>
            `;

            newsContainer.appendChild(articleElement);
        });
    }

    fetchNews();
});