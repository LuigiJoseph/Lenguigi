let dictionary;

// Fetch the category dictionary
fetch('../data/categ.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    dictionary = data;
    initGame();
  })
  .catch(error => {
    console.error('Error fetching the JSON:', error);
  });

// Shuffle the array elements
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate a sentence with correct gender particles
function generateSentence() {
  let subjects = Object.keys(dictionary).filter(word => dictionary[word].syntax === "N");
  let objects = Object.keys(dictionary).filter(word => dictionary[word].syntax === "N");
  let verbs = Object.keys(dictionary).filter(word => dictionary[word].syntax === "(S\\NP)/NP");

  let subject = subjects[Math.floor(Math.random() * subjects.length)];
  let object = objects[Math.floor(Math.random() * objects.length)];
  let verb = verbs[Math.floor(Math.random() * verbs.length)];

  // Adding particles based on gender
  let subjectParticle = dictionary[subject].gender === "masc" ? "el" : "la";
  let objectParticle = dictionary[object].gender === "masc" ? "el" : "la";

  let sentence = `${subjectParticle} ${subject} ${verb} ${objectParticle} ${object}`;

  return sentence;
}


let nounCount = 0;
// Initialize the game with sentence generation
function initGame() {
  const correctSentence = generateSentence().split(' ');
  const randomizedBlocks = shuffleArray(correctSentence.slice());

  document.getElementById('wordBlocks').innerHTML = randomizedBlocks.map(word => {
    let syntax = dictionary[word] ? dictionary[word].syntax : "particle"; // Get the syntax, default to "particle"
    let displayType;

    // Assign displayType based on syntax and nounCount
    if (syntax === "NP") {
      displayType = nounCount === 0 ? "subject" : "object";
      nounCount++; // Increment the counter for each noun encountered
    } else if (syntax === "(S\\NP)/NP") {
      displayType = "verb";
    } else {
      displayType = "particle"; // Default for anything not a noun or verb
    }

    return `<div class="block" data-type="${displayType}">${word}</div>`;
  }).join('');

  const blocks = document.querySelectorAll('.block');
  blocks.forEach(block => {
    block.addEventListener('click', function() {
      if (block.parentNode.id === 'constructedSentence') {
        document.getElementById('wordBlocks').appendChild(block);
      } else {
        document.getElementById('constructedSentence').appendChild(block);
      }
    });
  });

  document.getElementById('confirmButton').addEventListener('click', function() {
    const blocksInSentence = document.querySelectorAll('#constructedSentence .block');
    let constructedSentenceText = Array.from(blocksInSentence).map(block => block.textContent).join(' ');

    if (constructedSentenceText === correctSentence.join(' ')) {
      document.getElementById('message').textContent = 'Correct!';
    } else {
      document.getElementById('message').textContent = 'Try again!';
    }
  });
}

