document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const apiKey = API_KEY; 

    async function fetchNews() {
        const url = `https://api.rawg.io/api/games?key=${apiKey}&publishers=918&ordering=-updated&page_size=30`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayNews(data.results); 
        } catch (error) {
            console.error('Error fetching news from RAWG:', error);
            newsContainer.innerHTML = '<p>No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.</p>';
        }
    }

    function displayNews(games) {
        newsContainer.innerHTML = '';
        if (!games || games.length === 0) {
            newsContainer.innerHTML = '<p>No hay noticias disponibles en este momento.</p>';
            return;
        }

        games.forEach(game => {
            const articleElement = document.createElement('div');
            articleElement.classList.add('news-article');

            articleElement.innerHTML = `
                <img src="${game.background_image}" alt="${game.name}">
                <h3>${game.name}</h3>
                <a href="https://rawg.io/games/${game.slug}" target="_blank" rel="noopener noreferrer">Ver detalles</a>
            `;

            newsContainer.appendChild(articleElement);
        });
    }

    fetchNews();
});