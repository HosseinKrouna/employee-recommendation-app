const referralForm = document.querySelector('#referral-form');
const candidateNameInput = document.querySelector('#candidate-name');
const candidateSkillsInput = document.querySelector('#candidate-skills');
const referralsListContainer = document.querySelector('#referrals-list');


async function fetchAndDisplayReferrals() {
  try {
    const response = await fetch('http://localhost:3001/api/referrals');
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

    
      const statusDiv = document.createElement('div');

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

      itemContainer.appendChild(infoDiv);
      itemContainer.appendChild(statusDiv);

      referralsListContainer.appendChild(itemContainer);

     
    });


    document.querySelectorAll('.status-select').forEach(selectElement => {
      selectElement.addEventListener('change', async (event) => {
        const newStatus = event.target.value;
        const referralId = event.target.dataset.id;
        try {
          await fetch(`http://localhost:3001/api/referrals/${referralId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
        } catch (error) {
          console.error('Fehler beim Updaten des Status:', error);
        }
      });
    });

  } catch (error) {
    console.error('Fehler beim Laden der Empfehlungen:', error);
    referralsListContainer.textContent = 'Fehler beim Laden der Daten.';
  }
}

referralForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = candidateNameInput.value;
  const skills = candidateSkillsInput.value;

  if (!name) {
    alert('Bitte gib einen Namen an.');
    return;
  }

  const referralData = { candidateName: name, candidateSkills: skills };

  try {
    const response = await fetch('http://localhost:3001/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referralData)
    });
    const result = await response.json();

    console.log('Antwort vom Server:', result);
    alert(`Erfolg! Server sagt: "${result.message}"`);

    fetchAndDisplayReferrals(); 

    candidateNameInput.value = '';
    candidateSkillsInput.value = '';

  } catch (error) {
    console.error('Fehler beim Senden der Daten:', error);
    alert('Oh nein, ein Fehler ist aufgetreten!');
  }
});

document.addEventListener('DOMContentLoaded', fetchAndDisplayReferrals);