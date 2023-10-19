document.getElementById('confirmButton').addEventListener('click', function() {
    const blocks = document.querySelectorAll('.block');
    let constructedSentence = '';
    blocks.forEach(block => constructedSentence += block.textContent + ' ');
    constructedSentence = constructedSentence.trim(); // remove trailing space

    if (constructedSentence === 'yo como tacos') {
        document.getElementById('message').textContent = 'Correct!';
    } else {
        document.getElementById('message').textContent = 'Try again!';
    }
});



const blocks = document.querySelectorAll('.block');

blocks.forEach(block => {
    // Add a click event listener for each block.
    block.addEventListener('click', function() {
        // If the block is currently in the sentence (constructedSentence div), move it back to wordBlocks.
        if (block.parentNode.id === 'constructedSentence') {
            document.getElementById('wordBlocks').appendChild(block);
        } 
        // If the block is not in the sentence, move it to constructedSentence.
        else {
            document.getElementById('constructedSentence').appendChild(block);
        }
    });
});

function updateDisplay(){
    //empty the worldBlocks div
    document.getElementById('wordBlocks').innerHTML = ''

    //show all blocks in their original order
    blocks.forEach(block => document.getElementById('wordBlocks').appendChild(block))

    //Display the sentence
    message.innerHTML = sentence.map(block => block.textContent).join('')
}

