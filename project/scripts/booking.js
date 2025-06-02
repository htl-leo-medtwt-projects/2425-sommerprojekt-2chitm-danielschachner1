document.addEventListener('DOMContentLoaded', function() {

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksCenter = document.querySelector('.nav-links-center');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (navLinks) {
                navLinks.classList.toggle('active');
            }
            if (navLinksCenter) {
                navLinksCenter.classList.toggle('active');
            }
            menuToggle.textContent = (navLinks && navLinks.classList.contains('active')) || 
                                     (navLinksCenter && navLinksCenter.classList.contains('active')) 
                                     ? '✕' : '☰';
        });
    }

    let isLoggedIn = localStorage.getItem('isLoggedIn');
    console.log(isLoggedIn);

    if(isLoggedIn === 'true') {
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.textContent = 'Konto';
        loginBtn.href = '/project/sites/konto.html';
    }

    let placesData = [];
    const categoryFilter = document.getElementById('category-filter');
    const moodFilter = document.getElementById('mood-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const placesList = document.getElementById('places-list');

    applyFiltersBtn.addEventListener('click', applyFilters);

    fetch('../data/places.json')
        .then(response => response.json())
        .then(data => {
            placesData = data.places;
            renderPlaces(placesData);

            const urlParams = new URLSearchParams(window.location.search);
            const typeParam = urlParams.get('type');

            if (typeParam) {
                categoryFilter.value = typeParam;
                applyFilters();
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Orte:', error);
        });

    function applyFilters() {
        const selectedCategory = categoryFilter.value;
        const selectedMood = moodFilter.value;

        const filteredPlaces = placesData.filter(place => {
            const categoryMatch = selectedCategory === 'all' || place.type === selectedCategory;
            const moodMatch = selectedMood === 'all' || place.mood.includes(selectedMood);
            return categoryMatch && moodMatch;
        });

        renderPlaces(filteredPlaces);
    }

    function renderPlaces(places) {
        placesList.innerHTML = '';

        if (places.length === 0) {
            placesList.innerHTML = '<p class="text-center py-8">Keine Orte gefunden</p>';
            return;
        }

        places.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';
            placeCard.innerHTML = `
                <img src="../img/${place.image}" alt="${place.name}" class="place-image">
                <div class="place-content">
                    <div class="flex justify-between items-start">
                        <h3 class="text-xl font-semibold">${place.name}</h3>
                        <span class="place-rating">⭐ ${place.rating}</span>
                    </div>
                    <p class="text-gray-600 mt-2">${place.description}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <span class="text-sm text-gray-500">${getTypeName(place.type)}</span>
                        <button class="book-btn">Jetzt buchen</button>
                    </div>
                </div>
            `;
            placeCard.querySelector('.book-btn').addEventListener('click', () => {
                openBookingModal(place);
            });
            placesList.appendChild(placeCard);
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

    const placeModal = document.getElementById('place-modal');
    const closeModal = document.getElementById('close-modal');
    const favoriteBtn = document.getElementById('favorite-btn');
    const heartIcon = document.getElementById('heart-icon');
    let currentPlace = null;
    let moodAudio = null; // hier definieren, damit global zugreifbar

    function openBookingModal(place) {
        currentPlace = place;
        showPlaceModal(place);

        document.getElementById('book-btn').addEventListener('click', () => {
            redirectToCheckout(currentPlace);
        });
    }

    function redirectToCheckout(place) {
        const checkoutUrl = `../sites/checkout.html?place=${encodeURIComponent(place.name)}&id=${generateUniqueId()}`;
        window.location.href = checkoutUrl;
    }

    function generateUniqueId() {
        return 'booking_' + Math.random().toString(36).substr(2, 9);
    }

    function saveBookingToLocalStorage(placeName, bookingId) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const newBooking = {
            id: bookingId,
            place: placeName,
            date: new Date().toISOString()
        };
        bookings.push(newBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    function showPlaceModal(place) {
        currentPlace = place;

        document.getElementById('modal-place-name').textContent = place.name;
        document.getElementById('modal-place-image').src = `../img/${place.image}`;
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
            tag.className = 'px-3 py-1 bg-secondary rounded-full text-sm dark:bg-accent';
            tag.textContent = mood;
            moodsContainer.appendChild(tag);
        });

        if (moodAudio) {
            moodAudio.pause();
            moodAudio.currentTime = 0;
        }

        const moodMusicMap = {
            'gemütlich': 'cozy.mp3',
            'produktiv': 'productive.mp3',
            'kreativ': 'creative.mp3',
            'ruhig': 'calm.mp3',
            'lebendig': 'lively.mp3',
        };

        let selectedTrack = null;
        for (const mood of place.mood) {
            if (moodMusicMap[mood]) {
                selectedTrack = moodMusicMap[mood];
                break;
            }
        }

        if (selectedTrack) {
            moodAudio = new Audio(`../audioSrc/${selectedTrack}`);
            moodAudio.loop = true;
            moodAudio.play().catch(err => console.warn('Audio konnte nicht abgespielt werden:', err));
        }

        updateFavoriteIcon();
        placeModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closePlaceModal() {
        if (moodAudio) {
            moodAudio.pause();
            moodAudio.currentTime = 0;
        }
        placeModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

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

    closeModal.addEventListener('click', closePlaceModal);
    favoriteBtn.addEventListener('click', () => {
        toggleFavorite(currentPlace.name);
        updateFavoriteIcon();
    });

    placeModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closePlaceModal();
        }
    });

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

});
