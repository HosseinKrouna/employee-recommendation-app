
const submitButton = document.querySelector('button');
const candidateNameInput = document.querySelector('#candidate-name');
const candidateSkillsInput = document.querySelector('#candidate-skills');


submitButton.addEventListener('click', function() {

    
    const name = candidateNameInput.value;
    const skills = candidateSkillsInput.value;

  
    console.log('Button wurde geklickt!');
    console.log('Eingegebener Name:', name);
    console.log('Eingegebene Skills:', skills);

    alert('Empfehlung wurde (simuliert) abgeschickt! Schau in die Konsole.');
});