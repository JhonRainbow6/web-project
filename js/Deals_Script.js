document.addEventListener('DOMContentLoaded', () => {
    // Obtencion de referencias a los elementos del DOM (Index.html)
    const searchForm = document.getElementById('search-form');
    const gameTitleInput = document.getElementById('game-title');
    const resultsContainer = document.getElementById('results');

    // Evento de 'submit' para el formulario de búsqueda.
    searchForm.addEventListener('submit', async (e) => { //Este evento se disparara una vez se hace clic en un boton de de Buscar o presiona la tecla Enter
        e.preventDefault(); // Evita que el formulario se envie de la manera tradicional.
        const gameTitle = gameTitleInput.value.trim(); 
        if (gameTitle === '') {
            return; 
        }

        resultsContainer.innerHTML = '<p class="loading-message">...Buscando ofertas...</p>'; 
        const deals = await searchDeals(gameTitle); // Busca ofertas
        displayDeals(deals); // Ofertas encontradas
    });

    async function searchDeals(title) {
        // Construccion del URL de la API para la busqueda
        const url = `https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(title)}&exact=0`;
        try {
            const response = await fetch(url); // Peticion a la API
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Convierte la respuesta a JSON
            
            // Agrupa las multiples ofertas por juego para evitar duplicados en la visualizacion
            const games = data.reduce((acc, deal) => {
                // Usa steamAppID o internalName como clave unica para agrupar
                const gameKey = deal.steamAppID || deal.internalName;
                if (!acc[gameKey]) {
                    acc[gameKey] = {
                        title: deal.title,
                        thumb: deal.thumb,
                        stores: []
                    };
                }
                // Agrega la informacion de la tienda a la lista del juego correspondiente
                acc[gameKey].stores.push({
                    storeID: deal.storeID,
                    price: deal.salePrice,
                    dealID: deal.dealID
                });
                return acc;
            }, {});

            return Object.values(games); // Devuelve un array con los juegos agrupados

        } catch (error) {
            console.error('Error fetching deals:', error);
            resultsContainer.innerHTML = '<p>Error al buscar ofertas. Inténtalo de nuevo mas tarde.</p>';
            return [];
        }
    }

    async function getStores() {
        const url = 'https://www.cheapshark.com/api/1.0/stores';
        try {
            // Revisa si el mapa de tiendas ya esta en sessionStorage para no volver a pedirlo
            let storesMap = JSON.parse(sessionStorage.getItem('storesMap'));
            if (storesMap) {
                return storesMap;
            }
            // Si no esta en sessionStorage, hace la peticion a la API hasta que obtenga el listado de tiendas
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const storesData = await response.json();
            // Convierte el array de tiendas a un objeto para un acceso mas fácil por ID
            storesMap = storesData.reduce((acc, store) => {
                acc[store.storeID] = store.storeName;
                return acc;
            }, {});
            // Guarda el mapa de tiendas en sessionStorage para futuras busquedas   
            sessionStorage.setItem('storesMap', JSON.stringify(storesMap));
            return storesMap;
        } catch (error) {
            console.error('Error fetching stores:', error);
            return {};
        }
    }

    // Muestra las ofertas encontradas en el contenedor de resultados
    async function displayDeals(deals) {
        resultsContainer.innerHTML = ''; // Limpia los resultados anteriores
        if (deals.length === 0) {
            resultsContainer.innerHTML = '<p class="no-found-message">No se encontraron ofertas para este juego.</p>';
            return;
        }

        const stores = await getStores(); // Obtiene el mapa de tiendas

        // Itera sobre cada juego encontrado
        deals.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('deal');

            // Crea una lista HTML con las tiendas y precios para el juego
            let storesHtml = '<ul>';
            game.stores.forEach(storeInfo => {
                const storeName = stores[storeInfo.storeID] || `Tienda ID: ${storeInfo.storeID}`;
                const dealLink = `https://www.cheapshark.com/redirect?dealID=${storeInfo.dealID}`;
                // Cada tienda es un enlace que redirige a la oferta
                storesHtml += `<li><a href="${dealLink}" target="_blank" rel="noopener noreferrer">${storeName}: <strong>$${storeInfo.price}</strong></a></li>`;
            });
            storesHtml += '</ul>';

            // Construye el HTML para la tarjeta del juego y sus derivados
            gameElement.innerHTML = `
                <img src="${game.thumb}" alt="${game.title}">
                <h3>${game.title}</h3>
                ${storesHtml}
            `;
            resultsContainer.appendChild(gameElement); // Agrega la tarjeta del juego al contenedor
        });
    }
});