// Benutzername aus dem localStorage laden
const userName = localStorage.getItem('userName') || 'Gast';
document.getElementById('welcome-section').textContent = `Willkommen zurück, ${userName}!`;

// Buchungen aus dem localStorage laden
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const currentDate = new Date();

    // Aktuelle und vergangene Buchungen trennen
    const currentBookings = bookings.filter(booking => new Date(booking.date) >= currentDate && !booking.cancelled);
    const pastBookings = bookings.filter(booking => new Date(booking.date) < currentDate || booking.cancelled);

    displayBookings(currentBookings, 'current-bookings');
    displayBookings(pastBookings, 'past-bookings');
}

// Buchungen anzeigen
function displayBookings(bookings, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-gray-600">Keine Buchungen gefunden.</p>';
        return;
    }

    bookings.forEach((booking, index) => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        // Status (aktuell, storniert, vergangen)
        let statusText = '';
        if (booking.cancelled) {
            statusText = '<span class="status-cancelled">(Storniert)</span>';
        } else if (new Date(booking.date) < new Date()) {
            statusText = '<span class="text-gray-600">(Vergangen)</span>';
        }

        card.innerHTML = `
            <p><strong>Ort:</strong> ${booking.place}</p>
            <p><strong>Datum:</strong> ${booking.date} ${statusText}</p>
            <p><strong>Uhrzeit:</strong> ${booking.time}</p>
            <div class="flex gap-2 mt-2">
                <button class="button-style edit-btn" data-index="${index}">Bearbeiten</button>
                <button class="button-style cancel-btn" data-index="${index}">Stornieren</button>
            </div>
            <form class="edit-form" data-index="${index}">
                <input type="date" class="edit-date" value="${booking.date}">
                <input type="time" class="edit-time" value="${booking.time}">
                <button type="button" class="save-edit-btn">Speichern</button>
            </form>
        `;

        // EventListener für Stornieren
        card.querySelector('.cancel-btn')?.addEventListener('click', () => {
            cancelBooking(index);
        });

        // EventListener für Bearbeiten
        const editButton = card.querySelector('.edit-btn');
        const editForm = card.querySelector('.edit-form');

        editButton.addEventListener('click', () => {
            editForm.style.display = 'flex';
            editButton.style.display = 'none';
        });

        // EventListener für Speichern
        const saveEditButton = card.querySelector('.save-edit-btn');
        saveEditButton.addEventListener('click', () => {
            const newDate = editForm.querySelector('.edit-date').value;
            const newTime = editForm.querySelector('.edit-time').value;

            if (newDate && newTime) {
                editBooking(index, newDate, newTime);
                editForm.style.display = 'none';
                editButton.style.display = 'inline-block';
            }
        });

        container.appendChild(card);
    });
}

// Buchung stornieren
function cancelBooking(index) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings[index].cancelled = true;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadBookings(); // Aktualisiere die Anzeige
}

// Buchung bearbeiten
function editBooking(index, newDate, newTime) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings[index];

    booking.date = newDate;
    booking.time = newTime;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadBookings(); // Aktualisiere die Anzeige
}

// Beim Laden der Seite die Buchungen anzeigen
window.addEventListener('DOMContentLoaded', loadBookings);
