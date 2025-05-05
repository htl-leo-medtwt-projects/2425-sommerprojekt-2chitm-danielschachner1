  const userName = localStorage.getItem('userName') || 'Gast';
  document.getElementById('welcome-section').textContent = `Willkommen zurück, ${userName}!`;

  const userForm = document.getElementById('user-settings-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const statusMessage = document.getElementById('save-status');

  // Hinweis-Box
  const feedbackBox = document.createElement('div');
  feedbackBox.className = 'text-sm p-2 mt-2 rounded hidden';
  userForm.appendChild(feedbackBox);

  let userDatabase = JSON.parse(localStorage.getItem('userDatabase')) || {};
  const originalEmail = Object.keys(userDatabase)[0] || '';
  if (originalEmail) {
    emailInput.value = originalEmail;
    passwordInput.value = userDatabase[originalEmail]?.password || '';
  }

  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newEmail = emailInput.value.trim();
    const newPassword = passwordInput.value.trim();

    if (!newEmail || !newPassword) return;

    const emailExists = userDatabase[newEmail] && newEmail !== originalEmail;
    const isSamePassword = userDatabase[originalEmail]?.password === newPassword;

    feedbackBox.classList.remove('hidden');

    if (emailExists) {
      feedbackBox.textContent = 'Diese E-Mail ist bereits vergeben.';
      feedbackBox.className = 'text-red-600 bg-red-100 p-2 mt-2 rounded';
      return;
    }

    if (isSamePassword && newEmail === originalEmail) {
      feedbackBox.textContent = 'Das neue Passwort darf nicht dem alten entsprechen.';
      feedbackBox.className = 'text-red-600 bg-red-100 p-2 mt-2 rounded';
      return;
    }

    // Wenn sich E-Mail geändert hat, alten Eintrag löschen
    if (newEmail !== originalEmail) {
      delete userDatabase[originalEmail];
    }

    userDatabase[newEmail] = { password: newPassword };
    localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
    localStorage.setItem('userName', newEmail.split('@')[0]); 

    feedbackBox.textContent = 'Änderungen erfolgreich gespeichert!';
    feedbackBox.className = 'text-green-700 bg-green-100 p-2 mt-2 rounded';
  });

  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      feedbackBox.classList.add('hidden');
    });
  });

  function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const now = new Date();
    const current = bookings.filter(b => new Date(b.date) >= now && !b.cancelled);
    const past = bookings.filter(b => new Date(b.date) < now || b.cancelled);
    displayBookings(current, 'current-bookings');
    displayBookings(past, 'past-bookings');
  }

  function displayBookings(bookings, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (bookings.length === 0) {
      container.innerHTML = '<p class="text-gray-600 italic">Keine Buchungen gefunden.</p>';
      return;
    }

    bookings.forEach((booking, index) => {
      const card = document.createElement('div');
      card.className = 'booking-card bg-white p-4 rounded-lg border border-primary shadow-md transition';

      let statusText = '';
      if (booking.cancelled) statusText = '<span class="text-red-500 font-semibold">(Storniert)</span>';
      else if (new Date(booking.date) < new Date()) statusText = '<span class="text-gray-500">(Vergangen)</span>';

      card.innerHTML = `
        <p><strong>Ort:</strong> ${booking.place}</p>
        <p><strong>Datum:</strong> ${booking.date} ${statusText}</p>
        <p><strong>Uhrzeit:</strong> ${booking.time}</p>
        <div class="flex flex-wrap gap-2 mt-3">
          <button class="button-style bg-accent text-dark px-3 py-1 rounded edit-btn" data-index="${index}">Bearbeiten</button>
          <button class="button-style bg-rose-400 text-white px-3 py-1 rounded cancel-btn" data-index="${index}">Stornieren</button>
          <button class="button-style bg-red-600 text-white px-3 py-1 rounded delete-btn" data-index="${index}">Löschen</button>
        </div>
        <form class="edit-form mt-3 hidden flex flex-wrap gap-2 items-center" data-index="${index}">
          <input type="date" class="edit-date border p-1 rounded" value="${booking.date}">
          <input type="time" class="edit-time border p-1 rounded" value="${booking.time}">
          <button type="button" class="save-edit-btn bg-mint px-3 py-1 rounded text-dark font-semibold">Speichern</button>
        </form>
      `;

      card.querySelector('.cancel-btn').addEventListener('click', () => cancelBooking(index));
      card.querySelector('.delete-btn').addEventListener('click', () => deleteBooking(index));

      const editBtn = card.querySelector('.edit-btn');
      const editForm = card.querySelector('.edit-form');
      editBtn.addEventListener('click', () => {
        editForm.classList.toggle('hidden');
      });

      card.querySelector('.save-edit-btn').addEventListener('click', () => {
        const newDate = editForm.querySelector('.edit-date').value;
        const newTime = editForm.querySelector('.edit-time').value;
        if (newDate && newTime) {
          editBooking(index, newDate, newTime);
        }
      });

      container.appendChild(card);
    });
  }

  function cancelBooking(index) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings[index].cancelled = true;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadBookings();
  }

  function deleteBooking(index) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.splice(index, 1);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadBookings();
  }

  function editBooking(index, newDate, newTime) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings[index].date = newDate;
    bookings[index].time = newTime;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    loadBookings();
  }

  window.addEventListener('DOMContentLoaded', loadBookings);
