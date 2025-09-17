
import { jwtDecode } from 'jwt-decode';


const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}


const decodedToken = jwtDecode(token);
const userRole = decodedToken.role;
const loggedInUserId = decodedToken.userId;



const referralForm = document.querySelector('#referral-form');
const candidateNameInput = document.querySelector('#candidate-name');
const candidateSkillsInput = document.querySelector('#candidate-skills');
const referralsListContainer = document.querySelector('#referrals-list');
const logoutButton = document.querySelector('#logout-button');



async function fetchAuthenticated(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        throw new Error('Sitzung ungültig oder abgelaufen.');
    }
    return response;
}

function addEventListenersToDynamicElements() {
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (event) => {
            const newStatus = event.target.value;
            const referralId = event.target.dataset.id;
            const response = await fetchAuthenticated(`http://localhost:3001/api/referrals/${referralId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) fetchAndDisplayReferrals();
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const referralId = event.target.dataset.id;
            if (!confirm('Bist du sicher?')) return;
            const response = await fetchAuthenticated(`http://localhost:3001/api/referrals/${referralId}`, { method: 'DELETE' });
            if (response.ok) fetchAndDisplayReferrals();
        });
    });
}

async function fetchAndDisplayReferrals() {
    if (!referralsListContainer) return;
    try {
        const response = await fetchAuthenticated('http://localhost:3001/api/referrals');
        if (!response.ok) throw new Error('Fehler beim Laden der Daten');
        const referrals = await response.json();
        referralsListContainer.innerHTML = '';
        if (referrals.length === 0) {
            referralsListContainer.innerHTML = '<p>Noch keine Empfehlungen vorhanden.</p>';
            return;
        }
        referrals.forEach(referral => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'referral-item';
            const infoDiv = document.createElement('div');
            const statusDiv = document.createElement('div');
            const nameLabel = document.createElement('strong');
            nameLabel.textContent = 'Kandidat: ';
            const nameText = document.createTextNode(referral.candidate_name || '');
            const skillsLabel = document.createElement('strong');
            skillsLabel.textContent = ' Skills: ';
            const skillsText = document.createTextNode(referral.candidate_skills || '');
            infoDiv.appendChild(nameLabel);
            infoDiv.appendChild(nameText);
            infoDiv.appendChild(skillsLabel);
            infoDiv.appendChild(skillsText);
            itemContainer.appendChild(infoDiv);
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
        referralsListContainer.innerHTML = '<p>Fehler beim Laden der Daten.</p>';
    }
}


if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}

if (referralForm) {
    referralForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = candidateNameInput.value;
        const skills = candidateSkillsInput.value;
        if (!name) return alert('Bitte gib einen Namen an.');
        const response = await fetchAuthenticated('http://localhost:3001/api/referrals', {
            method: 'POST',
            body: JSON.stringify({ candidateName: name, candidateSkills: skills })
        });
        if (response.ok) {
            fetchAndDisplayReferrals();
            candidateNameInput.value = '';
            candidateSkillsInput.value = '';
        } else {
            alert('Fehler beim Erstellen der Empfehlung.');
        }
    });
}


fetchAndDisplayReferrals();