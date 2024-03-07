

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
    // call displaywords function
    displayWords();
  })
  .catch(error => {
    console.error('Error fetching the JSON:', error);
  });


// Display the words in the dictionary
function displayWords() {
  let words = Object.keys(dictionary);
  let wordBlocks = document.getElementById('wordBlocks');
  wordBlocks.innerHTML = words.map(word => {
      let syntax = dictionary[word].syntax;
      let displayType;
      
      // Assign displayType based on syntax
      if (syntax === "NP") {
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

// function getDisplayType(syntax) {
//   switch(syntax) {
//     case "NP":
//       return "noun"; // will apply the noun class
//     case "(S\\NP)/NP":
//       return "verb"; // will apply the verb class
//     case "NP/N":
//       return "particle"; // will apply the particle class
//     default:
//       return "other"; // will apply the other class if none of the above matches
//   }
// }


function selectWord(word) {
  // Find the block that was clicked
  let block = document.querySelector(`.block[data-word='${word}']`);
  // Move the block to the constructed sentence or back to word blocks
  if (block.parentNode.id === 'constructedSentence') {
    document.getElementById('wordBlocks').appendChild(block);
  } else {
    document.getElementById('constructedSentence').appendChild(block);
  }
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
// function checkSentence() {
//   let sentenceBlocks = document.querySelectorAll('#constructedSentence .block');
//   let sentenceStructure = Array.from(sentenceBlocks).map(block => block.getAttribute('data-type'));
//   // Simple check for a structure "particle - noun - verb - particle - noun"
//   let correctStructure = sentenceStructure.join(' ') === 'particle noun verb particle noun';

//   //check gender 
//   let genderAgreement = checkGenderAgreement(sentenceBlocks);

//   if (correctStructure && genderAgreement)  {

//     document.getElementById('message').textContent = 'Correct!';
//   } else {
//     document.getElementById('message').textContent = 'Incorrect structure!';
//   }
// }


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