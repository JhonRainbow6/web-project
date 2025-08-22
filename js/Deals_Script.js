document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results');
    const searchForm = document.getElementById('search-form');
    const gameTitleInput = document.getElementById('game-title');

    // Función para cargar y mostrar juegos de Ubisoft
    async function loadUbisoftGames() {
        resultsContainer.innerHTML = '<p class="loading-message">...Cargando juegos de Ubisoft...</p>';
        const deals = await fetchUbisoftGames();
        displayDeals(deals);
    }

    async function fetchUbisoftGames() {
        // El ID de tienda para Uplay/Ubisoft Store es 13
        const storeID = 13;
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=${storeID}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            const games = data.reduce((acc, deal) => {
                const gameKey = deal.steamAppID || deal.internalName;
                if (!acc[gameKey]) {
                    acc[gameKey] = {
                        title: deal.title,
                        thumb: deal.thumb,
                        stores: []
                    };
                }
                acc[gameKey].stores.push({
                    storeID: deal.storeID,
                    price: deal.salePrice,
                    dealID: deal.dealID
                });
                return acc;
            }, {});

            return Object.values(games);

        } catch (error) {
            console.error('Error fetching Ubisoft games:', error);
            resultsContainer.innerHTML = '<p>Error al cargar los juegos de Ubisoft. Inténtalo de nuevo más tarde.</p>';
            return [];
        }
    }

    async function searchDealsByTitle(title) {
        resultsContainer.innerHTML = `<p class="loading-message">...Buscando ofertas para ${title}...</p>`;
        const url = `https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(title)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            const games = data.reduce((acc, deal) => {
                const gameKey = deal.steamAppID || deal.internalName;
                if (!acc[gameKey]) {
                    acc[gameKey] = {
                        title: deal.title,
                        thumb: deal.thumb,
                        stores: []
                    };
                }
                acc[gameKey].stores.push({
                    storeID: deal.storeID,
                    price: deal.salePrice,
                    dealID: deal.dealID
                });
                return acc;
            }, {});

            return Object.values(games);

        } catch (error) {
            console.error(`Error fetching deals for ${title}:`, error);
            resultsContainer.innerHTML = `<p>Error al buscar ofertas para ${title}. Inténtalo de nuevo más tarde.</p>`;
            return [];
        }
    }

    async function getStores() {
        const url = 'https://www.cheapshark.com/api/1.0/stores';
        try {
            let storesMap = JSON.parse(sessionStorage.getItem('storesMap'));
            if (storesMap) {
                return storesMap;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const storesData = await response.json();
            storesMap = storesData.reduce((acc, store) => {
                acc[store.storeID] = store.storeName;
                return acc;
            }, {});
            sessionStorage.setItem('storesMap', JSON.stringify(storesMap));
            return storesMap;
        } catch (error) {
            console.error('Error fetching stores:', error);
            return {};
        }
    }

    async function displayDeals(deals, searchTerm = null) {
        resultsContainer.innerHTML = '';
        if (deals.length === 0) {
            if (searchTerm) {
                resultsContainer.innerHTML = `<p class="no-found-message">No se encontraron ofertas para "${searchTerm}".</p>`;
            } else {
                resultsContainer.innerHTML = '<p class="no-found-message">No se encontraron juegos de Ubisoft.</p>';
            }
            return;
        }

        const stores = await getStores();

        deals.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('deal');

            let storesHtml = '<ul>';
            game.stores.forEach(storeInfo => {
                const storeName = stores[storeInfo.storeID] || `Tienda ID: ${storeInfo.storeID}`;
                const dealLink = `https://www.cheapshark.com/redirect?dealID=${storeInfo.dealID}`;
                storesHtml += `<li><a href="${dealLink}" target="_blank" rel="noopener noreferrer">${storeName}: <strong>$${storeInfo.price}</strong></a></li>`;
            });
            storesHtml += '</ul>';

            gameElement.innerHTML = `
                <img src="${game.thumb}" alt="${game.title}">
                <h3>${game.title}</h3>
                ${storesHtml}
            `;
            resultsContainer.appendChild(gameElement);
        });
    }

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = gameTitleInput.value.trim();
        if (searchTerm) {
            const deals = await searchDealsByTitle(searchTerm);
            displayDeals(deals, searchTerm);
        } else {
            // Si la búsqueda está vacía, carga los juegos de Ubisoft por defecto
            loadUbisoftGames();
        }
    });

    // Cargar los juegos de Ubisoft al iniciar
    loadUbisoftGames();
});