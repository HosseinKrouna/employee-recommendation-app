
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

const referralForm = document.querySelector('#referral-form');
const candidateNameInput = document.querySelector('#candidate-name');
const candidateSkillsInput = document.querySelector('#candidate-skills');
const referralsListContainer = document.querySelector('#referrals-list');
const logoutButton = document.querySelector('#logout-button');


async function fetchAuthenticated(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            throw new Error('Token ist ungültig oder abgelaufen.');
        }

        return response; 

    } catch (error) {
        console.error('API-Anfrage fehlgeschlagen:', error);
        throw error; 
    }
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
            const statusDiv = document.createElement('div');

            const nameLabel = document.createElement('strong');
            nameLabel.textContent = 'Kandidat: ';
            const nameText = document.createTextNode(referral.candidate_name);
            const skillsLabel = document.createElement('strong');
            skillsLabel.textContent = 'Skills: ';
            const skillsText = document.createTextNode(referral.candidate_skills);

            infoDiv.appendChild(nameLabel);
            infoDiv.appendChild(nameText);
            infoDiv.appendChild(document.createElement('br'));
            infoDiv.appendChild(skillsLabel);
            infoDiv.appendChild(skillsText);

            const statusLabel = document.createElement('strong');
            statusLabel.textContent = 'Status: ';
            const statusSelect = document.createElement('select');
            statusSelect.dataset.id = referral.id;
            statusSelect.className = 'status-select';
            
            const statuses = ['Eingegangen', 'In Bearbeitung', 'Angenommen', 'Abgelehnt'];
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (referral.status === status) {
                    option.selected = true;
                }
                statusSelect.appendChild(option);
            });

            statusDiv.appendChild(statusLabel);
            statusDiv.appendChild(statusSelect);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.className = 'delete-button';
            deleteButton.dataset.id = referral.id;

            itemContainer.appendChild(infoDiv);
            itemContainer.appendChild(statusDiv);
            itemContainer.appendChild(deleteButton);

            referralsListContainer.appendChild(itemContainer);
        });
        
        
        addEventListenersToDynamicElements();

    } catch (error) {
        referralsListContainer.textContent = 'Fehler beim Laden der Daten.';
    }
}



function addEventListenersToDynamicElements() {
    document.querySelectorAll('.status-select').forEach(selectElement => {
        selectElement.addEventListener('change', async (event) => {
            const newStatus = event.target.value;
            const referralId = event.target.dataset.id;
            try {
                await fetchAuthenticated(`http://localhost:3001/api/referrals/${referralId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: newStatus })
                });
            } catch (error) {
                console.error('Fehler beim Updaten des Status:', error);
            }
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const referralId = event.target.dataset.id;
            if (!confirm('Bist du sicher, dass du diese Empfehlung löschen möchtest?')) {
                return;
            }
            try {
                const response = await fetchAuthenticated(`http://localhost:3001/api/referrals/${referralId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchAndDisplayReferrals();
                }
            } catch (error) {
                alert('Löschen fehlgeschlagen.');
            }
        });
    });
}

if (referralForm) {
    referralForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = candidateNameInput.value;
        const skills = candidateSkillsInput.value;

        if (!name) {
            return alert('Bitte gib einen Namen an.');
        }

        const referralData = { candidateName: name, candidateSkills: skills };

        try {
            const response = await fetchAuthenticated('http://localhost:3001/api/referrals', {
                method: 'POST',
                body: JSON.stringify(referralData)
            });
            
            if(response.ok) {
                fetchAndDisplayReferrals();
                candidateNameInput.value = '';
                candidateSkillsInput.value = '';
            } else {
                const errorData = await response.json();
                alert(`Fehler: ${errorData.message}`);
            }
        } catch (error) {
            alert('Ein Fehler ist aufgetreten.');
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