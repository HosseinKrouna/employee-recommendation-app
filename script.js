const submitButton = document.querySelector('button');
const candidateNameInput = document.querySelector('#candidate-name');
const candidateSkillsInput = document.querySelector('#candidate-skills');

submitButton.addEventListener('click', function() {

    const name = candidateNameInput.value;
    const skills = candidateSkillsInput.value;


    const referralData = {
        candidateName: name,
        candidateSkills: skills
    };

  
    fetch('http://localhost:3001/api/referrals', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(referralData)
    })
    .then(response => response.json()) 
    .then(data => {
        
        console.log('Antwort vom Server:', data);
        alert(`Erfolg! Server sagt: "${data.message}"`);
    })
    .catch(error => {

        console.error('Fehler beim Senden der Daten:', error);
        alert('Oh nein, ein Fehler ist aufgetreten!');
    });
});