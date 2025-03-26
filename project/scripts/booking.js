document.addEventListener('DOMContentLoaded', function() {
    // ===== MOBILE NAVIGATION =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });

    let placesData = [];
    const categoryFilter = document.getElementById('category-filter');
    const moodFilter = document.getElementById('mood-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const placesList = document.getElementById('places-list');

    // Daten laden
    fetch('../data/places.json')
        .then(response => response.json())
        .then(data => {
            placesData = data.places;
            renderPlaces(placesData);
            
            // URL-Parameter auswerten
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

    // Filter anwenden
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

    // Orte anzeigen
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

    // Hilfsfunktionen
    function getTypeName(type) {
        const typeNames = {
            'cafe': 'Café',
            'library': 'Bibliothek',
            'coworking': 'Co-Working Space',
            'park': 'Park'
        };
        return typeNames[type] || type;
    }

    function openBookingModal(place) {
        console.log('Buchung gestartet für:', place.name);
    }

    function getPriceForType(type) {
        const prices = {
            'cafe': 5,
            'library': 3,
            'coworking': 15,
            'park': 0
        };
        return prices[type] || 10;
    }

    applyFiltersBtn.addEventListener('click', applyFilters);
});