const prompt = require('prompt-sync')();

let bigGuy = {
    name: 'Big Guy',
    height: 75,
    weight: 240,
    hp: 300,
    stats: {
        speed: 5,
        agility: 3,
        power: 8,
        resilience: 7,
        technical: 4,
        dirty: 7,
        hardcore: 7,
        charisma: 5,
    }
}

let smallGuy = {
    name: 'Small Guy',
    height: 63,
    weight: 190,
    hp: 230,
    stats: {
        speed: 8,
        agility: 8,
        power: 2,
        resilience: 5,
        technical: 6,
        dirty: 2,
        hardcore: 5,
        charisma: 9,
    }
}

async function startMatch() {
    let play = true;
    while(play) {
        let bigGuyClone = {...bigGuy, stats: {...bigGuy.stats}};
        let smallGuyClone = {...smallGuy, stats: {...smallGuy.stats}};
        await update(bigGuyClone, smallGuyClone);
        // check if play again
        play = false;
    } 


}

startMatch();

async function update(big, small) {
    while(big.hp > 0 && small.hp > 0) {
        console.clear();
        // print screen
        printInitiativeScreen(big, small);
        // determine initiative
        // pick action
        // perform action
        // determine outcome
        // display results if match over
    }
    console.log(`The match is over!`);
    bigGuy.hp <= 0 ? console.log(`${small.name} has won!`) : console.log(`${big.name} has won!`);
}

function printInitiativeScreen(big, small) {
    let matchDisplay = buildMatchDisplay(big, small);
    matchDisplay.forEach(line => console.log(line));
}

function buildMatchDisplay(big, small) {
    let wrestlerDisplay = buildWrestlerDisplay(big, small);
    return wrestlerDisplay;
}

function buildWrestlerDisplay(big, small) {
    let bigNameDisplay = buildPaddedString(big.name, 28);
    let bigHpDisplay = buildPaddedString(`${big.hp}`, 28);
    
    let smallNameDisplay = buildPaddedString(small.name, 28);
    let smallHpDisplay = buildPaddedString(`${small.hp}`, 28);
    
    return [
        '==============================            ==============================',
        '|                            |            |                            |',
        `|${bigNameDisplay}|            |${smallNameDisplay}|`,
        `|${bigHpDisplay}|            |${smallHpDisplay}|`,
        '|                            |            |                            |',
        '|                            |            |                            |',
        '|                            |            |                            |',
        '==============================            ==============================',
    ]
}

function buildPaddedString(value, maxLength) {
    let paddedString = '';
    if(value.length <= maxLength-2) {
        let padding = maxLength-value.length;
        for(let leftPadIdx = 0; leftPadIdx < Math.floor(padding/2); leftPadIdx++) {
            paddedString += ' ';
        }
        paddedString += value;
        for(let rightPadIdx = 0; rightPadIdx < Math.ceil(padding/2); rightPadIdx++) {
            paddedString += ' ';
        }
    } else {
        paddedString = ` ${value.substring(0,maxLength-5)}... `;
    }

    return paddedString;
}