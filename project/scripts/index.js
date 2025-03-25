 var map = L.map('map').setView([52.52, 13.405], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var places = [
            { name: "Café Bliss", type: "Gemütliches Café", lat: 52.52, lng: 13.405, rating: 4.7 },
            { name: "Quiet Study Hub", type: "Lernort", lat: 52.515, lng: 13.4, rating: 4.5 }
        ];

        places.forEach(place => {
            L.marker([place.lat, place.lng]).addTo(map)
                .bindPopup(`<strong>${place.name}</strong><br>${place.type}<br>⭐ ${place.rating}`);
        });

        var placesContainer = document.getElementById('places-container');
        places.forEach(place => {
            var placeElement = document.createElement('div');
            placeElement.classList.add("bg-secondary", "p-6", "rounded-xl", "shadow-md", "text-white");
            placeElement.innerHTML = `<h3 class="text-2xl font-semibold">${place.name}</h3>
                                      <p>${place.type}</p>
                                      <p>⭐ ${place.rating}</p>`;
            placesContainer.appendChild(placeElement);
        });
