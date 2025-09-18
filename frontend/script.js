import { jwtDecode } from 'jwt-decode';


const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}
const decodedToken = jwtDecode(token);
const userRole = decodedToken.role;
const loggedInUserId = decodedToken.userId;


const logoutButton = document.querySelector('#logout-button');
const referralsListContainer = document.querySelector('#referrals-list'); 
const referralForm = document.querySelector('#referral-form');


const firstNameInput = document.querySelector('#firstName');
const lastNameInput = document.querySelector('#lastName');
const emailInput = document.querySelector('#email');
const contactSourceInput = document.querySelector('#contactSource');
const preferredPositionInput = document.querySelector('#preferredPosition');
const yearsOfExperienceInput = document.querySelector('#yearsOfExperience');
const salaryExpectationInput = document.querySelector('#salaryExpectation');
const skillsInput = document.querySelector('#skills');


async function fetchAuthenticated(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        throw new Error('Sitzung ungültig oder abgelaufen.');
    }
    return response;
}

async function fetchAndDisplayReferrals() {
    if (!referralsListContainer) return;
    try {
        const response = await fetchAuthenticated('http://localhost:3001/api/referrals');
        const referrals = await response.json();
        referralsListContainer.innerHTML = '';
        if (referrals.length === 0) {
            referralsListContainer.textContent = 'Noch keine Empfehlungen vorhanden.';
            return;
        }

        referrals.forEach(referral => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'referral-item';
            const infoDiv = document.createElement('div');
            
            const nameElement = document.createElement('strong');

            nameElement.textContent = `${referral.first_name} ${referral.last_name || ''}`;

            const positionText = document.createTextNode(` | Position: ${referral.preferred_position || 'N/A'}`);
            
            infoDiv.appendChild(nameElement);
            infoDiv.appendChild(positionText);
            itemContainer.appendChild(infoDiv);
            
            const statusDiv = document.createElement('div');
            const statusLabel = document.createElement('strong');
            statusLabel.textContent = 'Status: ';
            statusDiv.appendChild(statusLabel);

            if (userRole === 'hr') {
                const statusSelect = document.createElement('select');
                statusSelect.dataset.id = referral.id;
                statusSelect.className = 'status-select';
                const statuses = ['Eingegangen', 'In Bearbeitung', 'Angenommen', 'Abgelehnt'];
                statuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    if (referral.status === status) option.selected = true;
                    statusSelect.appendChild(option);
                });
                statusDiv.appendChild(statusSelect);
            } else {
                const statusText = document.createTextNode(referral.status);
                statusDiv.appendChild(statusText);
            }
            itemContainer.appendChild(statusDiv);

            if (userRole === 'employee' && referral.user_id === loggedInUserId && referral.status === 'Eingegangen') {
                const withdrawButton = document.createElement('button');
                withdrawButton.textContent = 'Zurückziehen';
                withdrawButton.className = 'delete-button';
                withdrawButton.dataset.id = referral.id;
                itemContainer.appendChild(withdrawButton);
            }

            referralsListContainer.appendChild(itemContainer);
        });
        addEventListenersToDynamicElements();
    } catch (error) {
        console.error('Fehler beim Laden der Empfehlungen:', error);
        referralsListContainer.textContent = 'Fehler beim Laden der Daten.';
    }
}


function addEventListenersToDynamicElements() {
    
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (event) => {
            const newStatus = event.target.value;
            const referralId = event.target.dataset.id;
            await fetchAuthenticated(`http://localhost:3001/api/referrals/${referralId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const referralId = event.target.dataset.id;
            if (!confirm('Bist du sicher, dass du diese Empfehlung zurückziehen möchtest?')) return;
            const response = await fetchAuthenticated(`http://localhost:3001/api/referrals/${referralId}`, { method: 'DELETE' });
            if (response.ok) fetchAndDisplayReferrals();
        });
    });
}

if (referralForm) {
    referralForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const referralData = {
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            email: emailInput.value,
            contactSource: contactSourceInput.value,
            preferredPosition: preferredPositionInput.value,
            yearsOfExperience: parseInt(yearsOfExperienceInput.value, 10) || null,
            salaryExpectation: salaryExpectationInput.value,
            skills: {
            "general": skillsInput.value.split(',').map(skill => skill.trim()).filter(skill => skill)
            }
        };

        if (!referralData.firstName) {
            return alert('Bitte gib einen Vornamen an.');
        }

        try {
            const response = await fetchAuthenticated('http://localhost:3001/api/referrals', {
                method: 'POST',
                body: JSON.stringify(referralData)
            });
            
            if (response.ok) {
                fetchAndDisplayReferrals();
                referralForm.reset(); 
            } else {
                alert('Fehler beim Erstellen der Empfehlung.');
            }
              
        } catch (error) {
            console.error('Fehler beim Abschicken des Formulars:', error);
            alert('Ein Netzwerk-Fehler ist aufgetreten.');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}


fetchAndDisplayReferrals();