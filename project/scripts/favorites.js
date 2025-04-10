document.addEventListener('DOMContentLoaded', function() {
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkIcon = document.getElementById('dark-icon');
    const lightIcon = document.getElementById('light-icon');

    if (localStorage.getItem('darkMode') === 'enabled') {
        document.documentElement.classList.add('dark');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
    }

    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('darkMode', 'enabled');
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        }
    });

    // Modal Funktionen
    const placeModal = document.getElementById('place-modal');
    const closeModal = document.getElementById('close-modal');
    const favoriteBtn = document.getElementById('favorite-btn');
    const heartIcon = document.getElementById('heart-icon');

    let currentPlace = null;

    closeModal.addEventListener('click', () => {
        placeModal.classList.add('hidden');
    });

    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(currentPlace.name);
        updateFavoriteIcon();

        setTimeout(() => {
            loadFavorites();
        }, 300);
    });

    function toggleFavorite(placeName) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.indexOf(placeName);
        
        if (index === -1) {
            favorites.push(placeName);
        } else {
            favorites.splice(index, 1);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function updateFavoriteIcon() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favorites.includes(currentPlace.name);
        heartIcon.textContent = isFavorite ? '♥' : '♡';
    }

    function showPlaceModal(place) {
        currentPlace = place;
        document.getElementById('modal-place-name').textContent = place.name;
        document.getElementById('modal-place-image').src = place.image;
        document.getElementById('modal-place-image').alt = place.name;
        document.getElementById('modal-place-rating').textContent = place.rating;
        document.getElementById('modal-place-description').textContent = place.description;
        
        const starsContainer = document.getElementById('modal-place-stars');
        starsContainer.innerHTML = '';
        const fullStars = Math.floor(place.rating);
        const hasHalfStar = place.rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            if (i < fullStars) {
                star.textContent = '★';
            } else if (i === fullStars && hasHalfStar) {
                star.textContent = '½';
            } else {
                star.textContent = '☆';
            }
            starsContainer.appendChild(star);
        }
        
        const moodsContainer = document.getElementById('modal-place-moods');
        moodsContainer.innerHTML = '';
        place.mood.forEach(mood => {
            const tag = document.createElement('span');
            tag.className = 'px-3 py-1 bg-accent rounded-full text-sm dark:bg-primary dark:text-light';
            tag.textContent = mood;
            moodsContainer.appendChild(tag);
        });
        
        updateFavoriteIcon();
        placeModal.classList.remove('hidden');
    }

    const favoritesContainer = document.getElementById('favorites-container');
    const noFavorites = document.getElementById('no-favorites');

    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.length === 0) {
            noFavorites.classList.remove('hidden');
            favoritesContainer.innerHTML = '';
            return;
        }
        
        fetch('../data/places.json')
            .then(response => response.json())
            .then(data => {
                const favoritePlaces = data.places.filter(place => 
                    favorites.includes(place.name)
                );
                
                if (favoritePlaces.length === 0) {
                    noFavorites.classList.remove('hidden');
                    favoritesContainer.innerHTML = '';
                    return;
                }
                
                noFavorites.classList.add('hidden');
                favoritesContainer.innerHTML = '';
                
                favoritePlaces.forEach(place => {
                    const placeCard = document.createElement('div');
                    placeCard.className = 'place-card dark:bg-white';
                    placeCard.innerHTML = `
                        <img src="../img/${place.image}" alt="${place.name}" class="place-image">
                        <div class="place-content">
                            <h3 class="text-xl font-semibold dark:text-dark">${place.name}</h3>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-sm text-gray-500 dark:text-gray-600">${getTypeName(place.type)}</span>
                                <span class="place-rating">⭐ ${place.rating}</span>
                            </div>
                            <button class="book-btn mt-4">Details anzeigen</button>
                        </div>
                    `;
                    
                    placeCard.querySelector('.book-btn').addEventListener('click', () => {
                        showPlaceModal(place);
                    });
                    
                    favoritesContainer.appendChild(placeCard);
                });
            })
            .catch(error => {
                console.error('Fehler beim Laden der Orte:', error);
            });
    }

    function getTypeName(type) {
        const typeNames = {
            'cafe': 'Café',
            'library': 'Bibliothek',
            'coworking': 'Co-Working Space',
            'park': 'Park'
        };
        return typeNames[type] || type;
    }



    
    loadFavorites();
});