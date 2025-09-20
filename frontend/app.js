import { apiService } from './services/apiService.js';
import { getDomElements, createReferralItem } from './utils/domUtils.js';
import { jwtDecode } from 'jwt-decode';


const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const decodedToken = jwtDecode(token);
const config = {
    userRole: decodedToken.role,
    userId: decodedToken.userId
};
const dom = getDomElements();



async function refreshReferrals() {
    if (!dom.listContainer) return;
    try {
        const response = await apiService.getReferrals();
        const referrals = await response.json();
        
        dom.listContainer.innerHTML = '';
        if (referrals.length === 0) {
            dom.listContainer.textContent = 'Noch keine Empfehlungen vorhanden.';
            return;
        }
        referrals.forEach(referral => {
            const item = createReferralItem(referral, config);
            dom.listContainer.appendChild(item);
        });
        
        addDynamicListeners();
    } catch (e) {
        console.error("Konnte Empfehlungen nicht laden", e);
        dom.listContainer.textContent = "Fehler beim Laden der Daten.";
    }
}

function addDynamicListeners() {
    dom.listContainer.querySelectorAll('.status-select').forEach(el => el.addEventListener('change', async (e) => {
        await apiService.updateReferralStatus(e.target.dataset.id, e.target.value);
        refreshReferrals();
    }));

    dom.listContainer.querySelectorAll('.delete-button').forEach(el => el.addEventListener('click', async (e) => {
        if (!confirm('Bist du sicher?')) return;
        const response = await apiService.deleteReferral(e.target.dataset.id);
        if (response.ok) refreshReferrals();
    }));

    dom.listContainer.querySelectorAll('.pdf-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const referralId = event.target.dataset.id;
            try {
                const response = await apiService.getReferralPdf(referralId);
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    
                    const contentDisposition = response.headers.get('content-disposition');
                    let fileName = `empfehlung_${referralId}.pdf`; // Fallback-Name
                    if (contentDisposition) {
                        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                        if (fileNameMatch && fileNameMatch.length === 2)
                            fileName = fileNameMatch[1];
                    }
                    a.download = fileName;
                    
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                } else {
                    alert('PDF konnte nicht erstellt werden.');
                }
            } catch (error) {
                console.error('Fehler beim PDF-Download:', error);
            }
        });
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const data = {
        firstName: dom.inputs.firstName.value,
        lastName: dom.inputs.lastName.value,
        email: dom.inputs.email.value,
        contactSource: dom.inputs.contactSource.value,
        preferredPosition: dom.inputs.preferredPosition.value,
        yearsOfExperience: parseInt(dom.inputs.yearsOfExperience.value, 10) || null,
        salaryExpectation: dom.inputs.salaryExpectation.value,
        skills: { "general": dom.inputs.skills.value.split(',').map(s => s.trim()).filter(Boolean) }
    };
    if (!data.firstName) return alert('Bitte Vornamen angeben.');
    
    const response = await apiService.createReferral(data);
    if (response.ok) {
        refreshReferrals();
        dom.form.reset();
    } else {
        alert('Fehler beim Erstellen.');
    }
}



function init() {
    if (dom.logoutButton) dom.logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    if (dom.form) dom.form.addEventListener('submit', handleFormSubmit);
    refreshReferrals();
}

init();