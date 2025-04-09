document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
            menuToggle.textContent = navLinks.classList.contains('hidden') ? '☰' : '✕';
        });
    }

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
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        darkIcon.classList.toggle('hidden', !isDark);
        lightIcon.classList.toggle('hidden', isDark);
    });

    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([52.52, 13.405], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    const placeModal = document.getElementById('place-modal');
    const closeModal = document.getElementById('close-modal');
    const favoriteBtn = document.getElementById('favorite-btn');
    const heartIcon = document.getElementById('heart-icon');
    let currentPlace = null;

    // Modal anzeigen
    function showPlaceModal(place) {
        currentPlace = place;
        document.getElementById('modal-place-name').textContent = place.name;
        document.getElementById('modal-place-image').src = `./img/${place.image}`;
        document.getElementById('modal-place-image').alt = place.name;
        document.getElementById('modal-place-rating').textContent = place.rating;
        document.getElementById('modal-place-description').textContent = place.description;

        const starsContainer = document.getElementById('modal-place-stars');
        starsContainer.innerHTML = '';
        const fullStars = Math.floor(place.rating);
        const hasHalfStar = place.rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            if (i < fullStars) star.textContent = '★';
            else if (i === fullStars && hasHalfStar) star.textContent = '½';
            else star.textContent = '☆';
            starsContainer.appendChild(star);
        }

        const moodsContainer = document.getElementById('modal-place-moods');
        moodsContainer.innerHTML = '';
        place.mood.forEach(mood => {
            const tag = document.createElement('span');
            tag.className = 'px-3 py-1 bg-pink-300 rounded-full text-sm';
            tag.textContent = mood;
            moodsContainer.appendChild(tag);
        });

        updateFavoriteIcon();
        placeModal.classList.remove('hidden');
        placeModal.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
    }

    // Modal schließen
    function closePlaceModal() {
        placeModal.classList.remove('modal-visible');
        placeModal.classList.add('hidden');
        document.body.style.overflow = ''; 
    }


    function toggleFavorite(placeName) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.indexOf(placeName);
        if (index === -1) favorites.push(placeName);
        else favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }


    function updateFavoriteIcon() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favorites.includes(currentPlace.name);
        heartIcon.textContent = isFavorite ? '♥' : '♡';
    }


    closeModal.addEventListener('click', closePlaceModal);
    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(currentPlace.name);
        updateFavoriteIcon();
    });

    // Klick außerhalb des Modals zum Schließen
    placeModal.addEventListener('click', function (e) {
        if (e.target === this) {
            closePlaceModal();
        }
    });

    // Orte aus einer JSON-Datei laden und auf der Karte anzeigen
    fetch('./data/places.json')
        .then(response => response.json())
        .then(data => {
            const placesContainer = document.getElementById('places-container');
            const markerGroup = L.featureGroup();

            data.places.forEach(place => {
                const marker = L.marker([place.lat, place.lng], {
                    riseOnHover: true
                }).addTo(map)
                    .bindPopup(`<b>${place.name}</b><br><small>${getTypeName(place.type)}</small><br>⭐ ${place.rating}`, {
                        className: 'custom-popup',
                        autoClose: false,
                        closeOnClick: false
                    });

                markerGroup.addLayer(marker);

                marker.on('click', function (e) {
                    map.flyTo(e.latlng, 16, { duration: 0.8 });
                    setTimeout(() => showPlaceModal(place), 300);
                });
            });

            map.fitBounds(markerGroup.getBounds());

            data.places.slice(0, 4).forEach(place => {
                const placeCard = document.createElement('div');
                placeCard.className = 'place-card';
                placeCard.innerHTML = `
                    <img src="./img/${place.image}" alt="${place.name}" class="place-image">
                    <div class="place-content mt-2">
                        <h3 class="text-xl font-semibold">${place.name}</h3>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-sm text-gray-500">${getTypeName(place.type)}</span>
                            <span class="place-rating">⭐ ${place.rating}</span>
                        </div>
                        <button class="book-btn mt-4">Details anzeigen</button>
                    </div>
                `;
                placeCard.querySelector('.book-btn').addEventListener('click', () => {
                    map.flyTo([place.lat, place.lng], 16, { duration: 0.8 });
                    setTimeout(() => showPlaceModal(place), 800);
                });
                placesContainer.appendChild(placeCard);
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der Orte:', error);
        });

    function getTypeName(type) {
        const typeNames = {
            'cafe': 'Café',
            'library': 'Bibliothek',
            'coworking': 'Co-Working Space',
            'park': 'Park'
        };
        return typeNames[type] || type;
    }
});
