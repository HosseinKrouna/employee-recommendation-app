export function getDomElements() {
    return {
        logoutButton: document.querySelector('#logout-button'),
        listContainer: document.querySelector('#referrals-list'),
        form: document.querySelector('#referral-form'),
        inputs: {
            firstName: document.querySelector('#firstName'),
            lastName: document.querySelector('#lastName'),
            email: document.querySelector('#email'),
            contactSource: document.querySelector('#contactSource'),
            preferredPosition: document.querySelector('#preferredPosition'),
            yearsOfExperience: document.querySelector('#yearsOfExperience'),
            salaryExpectation: document.querySelector('#salaryExpectation'),
            skills: document.querySelector('#skills')
        }
    };
}

export function createReferralItem(referral, config) {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'referral-item';

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<strong>${referral.first_name} ${referral.last_name || ''}</strong><br><span>Position: ${referral.preferred_position || 'N/A'}</span>`;

    const statusDiv = document.createElement('div');
    statusDiv.innerHTML = `<strong>Status: </strong>`;

    const pdfButton = document.createElement('button');
    pdfButton.textContent = 'PDF';
    pdfButton.className = 'pdf-button';
    pdfButton.dataset.id = referral.id;


    if (config.userRole === 'hr') {
        const select = document.createElement('select');
        select.dataset.id = referral.id;
        select.className = 'status-select';
        ['Eingegangen', 'In Bearbeitung', 'Angenommen', 'Abgelehnt'].forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            if (s === referral.status) opt.selected = true;
            select.appendChild(opt);
        });
        statusDiv.appendChild(select);
    } else {
        statusDiv.appendChild(document.createTextNode(referral.status));
    }

    itemContainer.appendChild(infoDiv);
    itemContainer.appendChild(statusDiv);
    itemContainer.appendChild(pdfButton);

    if (config.userRole === 'employee' && referral.user_id === config.userId && referral.status === 'Eingegangen') {
        const button = document.createElement('button');
        button.textContent = 'Zurückziehen';
        button.className = 'delete-button';
        button.dataset.id = referral.id;
        itemContainer.appendChild(button);
    }
    return itemContainer;
}