document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    const map = L.map('map').setView([52.52, 13.405], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    fetch('./data/places.json')
        .then(response => response.json())
        .then(data => {
            const placesContainer = document.getElementById('places-container');
            
            data.places.slice(0, 4).forEach(place => {
                const marker = L.marker([place.lat, place.lng]).addTo(map)
                    .bindPopup(`
                        <b>${place.name}</b><br>
                        <small>${place.type}</small><br>
                        ⭐ ${place.rating}
                    `);

                const placeCard = document.createElement('div');
                placeCard.className = 'place-card';
                placeCard.innerHTML = `
                    <img src="./img/${place.image}" alt="${place.name}" class="place-image">
                    <div class="place-content">
                        <h3 class="text-xl font-semibold">${place.name}</h3>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-sm text-gray-500">${place.type}</span>
                            <span class="place-rating">⭐ ${place.rating}</span>
                        </div>
                        <button class="book-btn mt-4">Jetzt buchen</button>
                    </div>
                `;
                
                // Event Listener für Buchungsbutton
                placeCard.querySelector('.book-btn').addEventListener('click', () => {
                    window.location.href = `./sites/booking.html?id=${place.name.toLowerCase().replace(/\s+/g, '-')}`;
                });
                
                placesContainer.appendChild(placeCard);
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der Orte:', error);
        });
});