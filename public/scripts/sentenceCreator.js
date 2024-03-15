let dictionary;


fetch('../data/categ.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    dictionary = data;
    // call displaywords function
    displayWords();
  })
  .catch(error => {
    console.error('Error fetching the JSON:', error);
  });



function displayWords() {
  let words = Object.keys(dictionary);
  let wordBlocks = document.getElementById('wordBlocks');
  wordBlocks.innerHTML = words.map(word => {
      let syntax = dictionary[word].syntax;
      let displayType;
      
      // Assign displayType based on syntax
      if (syntax === "N") {
          displayType = "noun";
      } else if (syntax === "(S\\NP)/NP") {
          displayType = "verb";
      } else if (syntax === "NP/N") {
          displayType = "particle";
      } else {
          displayType = "other";
      }

      // Return the HTML for the word block with the appropriate data-type and class
      return `<div class="block ${displayType}" data-type="${displayType}" data-word="${word}" onclick="selectWord('${word}')">${word}</div>`;

  }).join('');
}


function canCombine(word1, word2) {
  let type1 = dictionary[word1].syntax;
  let type2 = dictionary[word2].syntax;

  // Here you'll add the logic to determine if two types can combine
  // For now, we will just check for NP/N and N as an example
  if (type1 === 'NP/N' && type2 === 'N') {
    return { canCombine: true, newType: 'NP' };
  }

  // Add more CCG combination rules here

  // If no valid combination is found
  return { canCombine: false, newType: null };
}

function createCombinedBlock(word1, word2, newType) {
  let combinedWord = `${word1} ${word2}`;
  let combinedBlock = document.createElement('div');
  combinedBlock.classList.add('block', newType);
  combinedBlock.dataset.type = newType;
  combinedBlock.dataset.word = combinedWord;
  combinedBlock.textContent = combinedWord;

  // Update the visual appearance based on the new type
  updateBlockVisual(combinedBlock);
  
  return combinedBlock;
}


function updateBlockVisual(block) {
  switch(block.dataset.type) {
    case 'NP':
      block.style.backgroundColor = 'orange';
      break;
    // Handle other types if necessary
  }
}


function selectWord(word) {
  // Get the clicked block
  let block = document.querySelector(`.block[data-word='${word}']`);

  // Get the container where the sentence is being constructed
  let constructedSentence = document.getElementById('constructedSentence');

  // Check if there is a block in the sentence that can be combined with the clicked block
  let lastBlock = constructedSentence.lastElementChild;
  if (lastBlock) {
    let lastWord = lastBlock.dataset.word;
    let canCombineResult = canCombine(lastWord, word);

    if (canCombineResult.canCombine) {
      // Remove the individual blocks
      lastBlock.remove();
      block.remove();

      // Create a new block that combines both words
      let newBlock = createCombinedBlock(lastWord, word, canCombineResult.newType);
      constructedSentence.appendChild(newBlock);
    } else {
      // If they can't be combined, just move the block to the sentence container
      constructedSentence.appendChild(block);
    }
  } else {
    // If there are no other blocks, just move the block to the sentence container
    constructedSentence.appendChild(block);
  }

  // Reattach event listeners to blocks after any DOM updates
  attachBlockListeners();
}



// Reusable function to attach event listeners to blocks
function attachBlockListeners() {
  const blocks = document.querySelectorAll('#wordBlocks .block, #constructedSentence .block');
  blocks.forEach(block => {
      block.removeEventListener('click', blockClickHandler); // Remove any old listeners
      block.addEventListener('click', blockClickHandler); // Add new listener
  });
}


function blockClickHandler() {
  // Your existing logic to move blocks between wordBlocks and constructedSentence
  if (this.parentNode.id === 'constructedSentence') {
      document.getElementById('wordBlocks').appendChild(this);
  } else {
      document.getElementById('constructedSentence').appendChild(this);
  }
}

// Call displayWords when the page is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
  if (dictionary) {
      displayWords();
  }
  document.getElementById('confirmButton').addEventListener('click', checkSentence);
});


function checkGenderAgreement(blocks) {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].getAttribute('data-type') === 'noun') {
      // Find the preceding particle
      let particle = blocks[i - 1];
      if (particle && particle.getAttribute('data-type') === 'particle') {
        let nounGender = blocks[i].getAttribute('data-gender');
        let particleGender = particle.getAttribute('data-gender');
        // Check if the noun and particle genders match
        if (nounGender !== particleGender) {
          return false; // Gender mismatch
        }
      }
    }
  }
  return true; // All genders match
}


function ccgReduce(sentenceArray) {
  let stack = [];

  sentenceArray.forEach(word => {
      let wordType = dictionary[word].syntax;
      console.log(`Processing word: ${word}, Syntax: ${wordType}`); 

      while (stack.length > 0) {
          let topStackType = stack[stack.length - 1].type;

          // Forward Application
          if (topStackType.endsWith(`/${wordType}`)) {
              let reducedType = topStackType.replace(`/${wordType}`, '');
              console.log(`Reducing (Forward): ${topStackType} with ${wordType} to ${reducedType}`); // Log the reduction
              stack.pop(); // 
              wordType = reducedType; // Set the reduced type as the new word type
          } 
          // Backward Application
          else if (wordType.endsWith(`${topStackType}`)) {
              let reducedType = wordType.replace(`\\${topStackType}`, '');
              console.log(`Reducing (Backward): ${wordType} with ${topStackType} to ${reducedType}`); 
              stack.pop(); 
              wordType = reducedType; // Set the reduced type as the new word type
            
          } 
          else {
              break; 
          }
      }
      console.log(`Pushing word: ${word} with type: ${wordType}`);
      stack.push({ word, type: wordType }); // Push the word with its (possibly reduced) type onto the stack
      
  });

  return stack.length === 1 && (stack[0].type === 'S' || '(S)'); // Return true if the stack contains a single item of type S
}



function checkSentence() {
  let sentenceBlocks = document.querySelectorAll('#constructedSentence .block');
  let sentenceWords = Array.from(sentenceBlocks).map(block => block.dataset.word);
  let isCorrect = ccgReduce(sentenceWords);

  if (isCorrect) {
      document.getElementById('message').textContent = 'Correct CCG structure!';
      console.log(`Submitted sentence: ${sentenceWords.join(' ')}`);
  } else {
      document.getElementById('message').textContent = 'Incorrect CCG structure!';
      console.log(`Submitted sentence: ${sentenceWords.join(' ')}`);
  }
}



//Notes to do :
//Create categ for que and other realtive pronouns
//Create categ for adjectives
//Create categ for adverbs
//Create categ for prepositions
//Create categ for conjunctions