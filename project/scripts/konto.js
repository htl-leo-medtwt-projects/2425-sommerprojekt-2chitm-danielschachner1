document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    const userName = localStorage.getItem('userName') || 'Gast';
    const welcomeSection = document.getElementById('welcome-section');
    if (welcomeSection) {
        welcomeSection.textContent = `Willkommen zurück, ${userName}!`;
    }
    
    if (!localStorage.getItem('bookings')) {
        const sampleBookings = [
            {
                place: "Büroraum A01",
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                time: "14:00",
                cancelled: false
            },
            {
                place: "Konferenzraum C",
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                time: "10:00",
                cancelled: false
            }
        ];
        localStorage.setItem('bookings', JSON.stringify(sampleBookings));
        console.log("Sample bookings created");
    }
    
    initAccountSettings();
    
    loadBookings();

    initLogout();
    
    initTabFunctionality();
});

function initTabFunctionality() {
    console.log("Initializing tab functionality");
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
   
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log(`Tab clicked: ${tabName}`);
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            tabPanels.forEach(panel => {
                if (panel.id === `${tabName}-tab`) {
                    panel.classList.add('active');

                    
                    if (tabName === 'bookings') {
                        console.log("Reloading bookings on tab switch");
                        loadBookings();
                    }
                } else {
                    panel.classList.remove('active');
                }
            });
            
            // Close sidebar on mobile after tab change
            if (window.innerWidth < 768 && typeof window.closeSidebarFunc === 'function') {
                window.closeSidebarFunc();
            }
        });
    });
}

// Account settings functionality
function initAccountSettings() {
    console.log("Initializing account settings");
    const userForm = document.getElementById('user-settings-form');
    
    if (!userForm) return;
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const feedbackContainer = document.getElementById('feedback-container');
    
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
        
        if (!newEmail || !newPassword) {
            showFeedback('Bitte füllen Sie alle Felder aus.', 'error');
            return;
        }
        
        const emailExists = userDatabase[newEmail] && newEmail !== originalEmail;
        const isSamePassword = userDatabase[originalEmail]?.password === newPassword && newEmail === originalEmail;
        
        if (emailExists) {
            showFeedback('Diese E-Mail ist bereits vergeben.', 'error');
            return;
        }
        
        if (isSamePassword) {
            showFeedback('Bitte wählen Sie ein neues Passwort.', 'error');
            return;
        }
        
        // Update user data
        if (newEmail !== originalEmail) {
            delete userDatabase[originalEmail];
        }
        
        userDatabase[newEmail] = { password: newPassword };
        localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
        localStorage.setItem('userName', newEmail.split('@')[0]);
        
        showFeedback('Änderungen erfolgreich gespeichert!', 'success');
        
        if (window.innerWidth < 768 && typeof window.closeSidebarFunc === 'function') {
            window.closeSidebarFunc();
        }
    });
    
    // Clear feedback on input
    if (emailInput && passwordInput) {
        [emailInput, passwordInput].forEach(input => {
            input.addEventListener('input', () => {
                feedbackContainer.innerHTML = '';
            });
        });
    }
}

function initLogout() {
    console.log("Initializing logout functionality");
    
    const logoutButton = document.querySelector('.sidebar-menu-item:has(i.fas.fa-sign-out-alt)');
    
    if (logoutButton) {
        console.log("Logout button found, adding click event");
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Logout clicked");
            
            localStorage.clear();
            
            window.location.href = '../index.html';
        });
    } else {
        console.log("Logout button not found");
    }
}

function showFeedback(message, type) {
    const feedbackContainer = document.getElementById('feedback-container');
    if (!feedbackContainer) return;
    
    feedbackContainer.innerHTML = '';
    
    const feedbackEl = document.createElement('div');
    feedbackEl.className = type === 'success' 
        ? 'bg-mint text-green-800 p-3 rounded-lg flex items-center gap-2'
        : 'bg-rose text-red-800 p-3 rounded-lg flex items-center gap-2';
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    feedbackEl.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    feedbackContainer.appendChild(feedbackEl);
    
    if (type === 'success') {
        setTimeout(() => {
            feedbackEl.classList.add('opacity-0');
            feedbackEl.style.transition = 'opacity 0.5s ease';
            setTimeout(() => feedbackContainer.innerHTML = '', 500);
        }, 5000);
    }
}

function loadBookings() {
    console.log("Loading bookings");
    const currentBookingsContainer = document.getElementById('current-bookings');
    const pastBookingsContainer = document.getElementById('past-bookings');
    
    console.log("Current bookings container found:", !!currentBookingsContainer);
    console.log("Past bookings container found:", !!pastBookingsContainer);
    
    if (!currentBookingsContainer && !pastBookingsContainer) {
        console.log("Booking containers not found, exiting loadBookings()");
        return;
    }
    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    console.log(`Found ${bookings.length} bookings in localStorage`);
    
    const now = new Date();
    
    const current = bookings.filter(b => new Date(b.date) >= now && !b.cancelled);
    const past = bookings.filter(b => new Date(b.date) < now || b.cancelled);
    
    console.log(`Current bookings: ${current.length}, Past bookings: ${past.length}`);
    
    if (currentBookingsContainer) displayBookings(current, 'current-bookings');
    if (pastBookingsContainer) displayBookings(past, 'past-bookings');
}

function displayBookings(bookings, containerId) {
    console.log(`Displaying ${bookings.length} bookings in ${containerId}`);
    const container = document.getElementById(containerId);
    if (!container) {
        console.log(`Container ${containerId} not found`);
        return;
    }
    
    container.innerHTML = '';
    
    if (bookings.length === 0) {
        container.innerHTML = '<div class="text-gray-500 italic p-4 text-center">Keine Buchungen gefunden.</div>';
        return;
    }
    
    bookings.forEach((booking, index) => {
        const card = document.createElement('div');
        card.className = 'booking-card bg-white p-4 md:p-5 shadow-sm mb-4 hover:shadow-md';
        
        let statusText = '';
        let statusClass = '';
        let statusIcon = '';
        
        if (booking.cancelled) {
            statusText = 'Storniert';
            statusClass = 'text-rose-500 bg-rose-100';
            statusIcon = 'fa-ban';
        } else if (new Date(booking.date) < new Date()) {
            statusText = 'Vergangen';
            statusClass = 'text-gray-500 bg-gray-100';
            statusIcon = 'fa-clock';
        } else {
            statusText = 'Aktiv';
            statusClass = 'text-emerald-500 bg-emerald-100';
            statusIcon = 'fa-check-circle';
        }
        
        const bookingDate = new Date(booking.date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = bookingDate.toLocaleDateString('de-DE', options);
        
        card.innerHTML = `
            <div class="flex flex-wrap items-start justify-between">
                <div class="flex-1">
                    <h3 class="font-medium text-lg text-primary">${booking.place}</h3>
                    <div class="text-gray-600 mt-1">
                        <div class="flex items-center gap-1 mb-1">
                            <i class="fas fa-calendar-day text-accent"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i class="fas fa-clock text-accent"></i>
                            <span>${booking.time} Uhr</span>
                        </div>
                    </div>
                </div>
                
                <div class="mt-2 md:mt-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                        <i class="fas ${statusIcon} mr-1"></i>
                        ${statusText}
                    </span>
                </div>
            </div>
            
            <div class="mt-4 flex flex-wrap gap-2">
                <button class="button-style bg-accent text-dark px-3 py-2 rounded-lg flex items-center gap-1 edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                    <span>Bearbeiten</span>
                </button>
                
                <button class="button-style bg-rose-400 text-white px-3 py-2 rounded-lg flex items-center gap-1 cancel-btn" data-index="${index}" ${booking.cancelled ? 'disabled' : ''}>
                    <i class="fas fa-calendar-times"></i>
                    <span>Stornieren</span>
                </button>
                
                <button class="button-style bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 delete-btn" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                    <span>Löschen</span>
                </button>
            </div>
            
            <form class="edit-form mt-4 hidden bg-gray-50 p-3 rounded-lg" data-index="${index}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                        <input type="date" class="edit-date w-full p-2 border border-gray-300 rounded-lg" value="${booking.date}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
                        <input type="time" class="edit-time w-full p-2 border border-gray-300 rounded-lg" value="${booking.time}">
                    </div>
                </div>
                <div class="mt-3 flex justify-end">
                    <button type="button" class="save-edit-btn bg-mint px-3 py-2 rounded-lg text-dark font-medium flex items-center gap-1">
                        <i class="fas fa-save"></i>
                        <span>Speichern</span>
                    </button>
                </div>
            </form>
        `;
        
        card.querySelector('.cancel-btn').addEventListener('click', () => {
            if (!booking.cancelled) {
                cancelBooking(index);
            }
        });
        
        card.querySelector('.delete-btn').addEventListener('click', () => {
            deleteBooking(index);
        });
        
        const editBtn = card.querySelector('.edit-btn');
        const editForm = card.querySelector('.edit-form');
        
        editBtn.addEventListener('click', () => {

            document.querySelectorAll('.edit-form').forEach(form => {
                if (form !== editForm) form.classList.add('hidden');
            });
            
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