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

      const nameElement = document.createElement('strong');
      nameElement.textContent = 'Kandidat: ';

      const nameText = document.createTextNode(referral.candidate_name);

      const skillsElement = document.createElement('span');
      skillsElement.textContent = 'Skills: '; 

      const skillsText = document.createTextNode(referral.candidate_skills); 

    
      itemContainer.appendChild(nameElement);
      itemContainer.appendChild(nameText);
      itemContainer.appendChild(document.createElement('br'));
      itemContainer.appendChild(skillsElement);
      itemContainer.appendChild(skillsText);

      referralsListContainer.appendChild(itemContainer);

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