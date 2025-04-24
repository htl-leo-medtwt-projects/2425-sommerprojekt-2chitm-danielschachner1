        // URL-Parameter auslesen
        const urlParams = new URLSearchParams(window.location.search);
        const placeName = decodeURIComponent(urlParams.get('place'));
        const bookingId = urlParams.get('id');

        // Ort und Buchungs-ID anzeigen
        document.getElementById('place-name').textContent = placeName;
        document.getElementById('booking-id').textContent = bookingId;

        // Formular absenden
        document.getElementById('booking-form').addEventListener('submit', function (e) {
            e.preventDefault();

            // Datum und Uhrzeit auslesen
            const bookingDate = document.getElementById('booking-date').value;
            const bookingTime = document.getElementById('booking-time').value;

            if (!bookingDate || !bookingTime) {
                alert('Bitte wählen Sie ein Datum und eine Uhrzeit aus.');
                return;
            }

            // Buchung speichern
            saveBookingToLocalStorage(placeName, bookingId, bookingDate, bookingTime);

            // Erfolgsmeldung anzeigen
            document.getElementById('success-message').classList.remove('hidden');
            document.getElementById('booking-form').classList.add('hidden');

            // Countdown für Weiterleitung
            let countdown = 3;
            const countdownElement = document.getElementById('countdown');
            const interval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;

                if (countdown === 0) {
                    clearInterval(interval);
                    window.location.href = '../sites/booking.html'; // Zurück zur Booking-Seite
                }
            }, 1000);
        });

        // Buchung im localStorage speichern
        function saveBookingToLocalStorage(placeName, bookingId, bookingDate, bookingTime) {
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            const newBooking = {
                id: bookingId,
                place: placeName,
                date: bookingDate,
                time: bookingTime,
                timestamp: new Date().toISOString()
            };
            bookings.push(newBooking);
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
