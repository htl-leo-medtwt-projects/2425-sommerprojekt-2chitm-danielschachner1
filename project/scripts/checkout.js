// URL-Parameter auslesen
const urlParams = new URLSearchParams(window.location.search);
const placeName = decodeURIComponent(urlParams.get('place'));
const bookingId = urlParams.get('id');

document.getElementById('place-name').textContent = placeName;
document.getElementById('booking-id').textContent = bookingId;

document.getElementById('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const bookingDate = document.getElementById('booking-date').value;
    const timeFrom = document.getElementById('booking-time-from').value;
    const timeTo = document.getElementById('booking-time-to').value;

    if (!bookingDate || !timeFrom || !timeTo) {
        alert('Bitte wählen Sie Datum sowie Start- und Endzeit aus.');
        return;
    }

    if (timeFrom >= timeTo) {
        alert('Die Endzeit muss nach der Startzeit liegen.');
        return;
    }

    saveBookingToLocalStorage(placeName, bookingId, bookingDate, timeFrom, timeTo);

    document.getElementById('success-message').classList.remove('hidden');
    document.getElementById('booking-form').classList.add('hidden');

    // Countdown für Weiterleitung
    let countdown = 3;
    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = countdown;
    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown === 0) {
            clearInterval(interval);
            window.location.href = '../sites/booking.html'; 
        }
    }, 1000);
});

function saveBookingToLocalStorage(placeName, bookingId, bookingDate, timeFrom, timeTo) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const newBooking = {
        id: bookingId,
        place: placeName,
        date: bookingDate,
        timeFrom: timeFrom,
        timeTo: timeTo,
        timestamp: new Date().toISOString()
    };
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}
