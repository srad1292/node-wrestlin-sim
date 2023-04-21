// @ts-nocheck
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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function statsToString(stats) {
    let statsStr = ' ';
    Object.entries(stats).forEach((stat) => {
        statsStr += stat[0] + ":" + stat[1] + ', ';
    });
    return statsStr;
}

function buildCenterPaddedString(value, maxLength) {
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

function buildRightPaddedString(value, maxLength, whiteSpaceCount) {
    let paddedString = value;
    if(paddedString.length > maxLength) {
        paddedString = paddedString.substring(0,maxLength);
    }
    let numSpaces = whiteSpaceCount + (maxLength-paddedString.length);
    for(let rightPadIdx = 0; rightPadIdx < numSpaces; rightPadIdx++) {
        paddedString += ' ';
    }

    return paddedString;
}

async function update(big, small) {
    while(big.hp > 0 && small.hp > 0) {
        console.clear();
        // Determine initiative
        let inControl = determineInitiative(big, small);
        let selectedAbility = abilitySelection(big,small,inControl);
        // Show who wins ability contest
        let contestWinner = await determineContestWinner(big,small,inControl,selectedAbility);
        // pick action
        let action = pickAction(big,small,selectedAbility,contestWinner); 
        // perform action
        // determine outcome
        // display results if match over
    }
    // console.log(`The match is over!`);
    // bigGuy.hp <= 0 ? console.log(`${small.name} has won!`) : console.log(`${big.name} has won!`);
}

function determineInitiative(big, small) {
    return Math.ceil(Math.random()*10) >= 5 ? big : small; 
}

function abilitySelection(big, small, inControl) {
    let abilitySelected = false;
    let abilityInputFailed = false;
    let selectedAbility = '';
    do {
        printInitiativeScreen(big, small, inControl);
        if(abilityInputFailed) {
            console.log("Last input was invalid.  Try again.");
        }
        try {
            let userInput = prompt('Select Ability(1-8) or Quit(q): ').trim().toLowerCase();
            if(userInput === 'q') {
                process.exit();
            }
            userInput = parseInt(userInput);
            if(userInput >= 1 && userInput <= 8) {
                abilitySelected = true;
                if(userInput === 1) {
                    selectedAbility = 'speed';
                } else if(userInput === 2) {
                    selectedAbility = 'agility';
                } else if(userInput === 3) {
                    selectedAbility = 'power';
                } else if(userInput === 4) {
                    selectedAbility = 'resilience';
                } else if(userInput === 5) {
                    selectedAbility = 'technical';
                } else if(userInput === 6) {
                    selectedAbility = 'dirty';
                } else if(userInput === 7) {
                    selectedAbility = 'hardcore';
                } else if(userInput === 8) {
                    selectedAbility = 'charisma';
                }
            } else {
                abilityInputFailed = true;
            }
        } catch (e) {
            abilityInputFailed = true;
        }
    } while(!abilitySelected);

    return selectedAbility;
}

function printInitiativeScreen(big, small, inControl) {
    console.clear();
    let matchDisplay = buildMatchDisplay(big, small);
    matchDisplay.forEach(line => console.log(line));
    let initiativeDisplay = buildInitiativeDisplay(big, small);
    console.log("");
    initiativeDisplay.forEach(line => console.log(line));
    console.log("");
    console.log(`${inControl.name} has the initiative! Which ability will they use?`);
    console.log("Speed=1 Agility=2 Power=3 Resilience=4 Technical=5 Dirty=6 Hardcore=7 Charisma=8");    
}

function buildMatchDisplay(big, small) {
    let wrestlerDisplay = buildWrestlerDisplay(big, small);
    return wrestlerDisplay;
}

function buildWrestlerDisplay(big, small) {
    let bigNameDisplay = buildCenterPaddedString(big.name, 28);
    let bigHpDisplay = buildCenterPaddedString(`${big.hp}`, 28);
    
    let smallNameDisplay = buildCenterPaddedString(small.name, 28);
    let smallHpDisplay = buildCenterPaddedString(`${small.hp}`, 28);
    
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

function buildInitiativeDisplay(big, small) {
    let maxSize = Math.min(14, Math.max(big.name.length, small.name.length));
    let bigStatsStr = `${buildRightPaddedString(big.name, maxSize, 1)} - {${statsToString(big.stats)}}`;
    let smallStatsStr = `${buildRightPaddedString(small.name, maxSize, 1)} - {${statsToString(small.stats)}}`;
    return [
        bigStatsStr,
        smallStatsStr
    ];
}

async function determineContestWinner(big,small,inControl,selectedAbility) {
    console.clear();
    let matchDisplay = buildMatchDisplay(big, small);
    matchDisplay.forEach(line => console.log(line));
    console.log("There is struggle of " + selectedAbility + " going on!");
    await delay(800);
    let statTotal = big.stats[selectedAbility] + small.stats[selectedAbility];
    let rolled = Math.ceil(Math.random() * statTotal);
    let winner = rolled <= big.stats[selectedAbility] ? big : small;
    try {
        let userInput = prompt(`${winner.name} comes out on top! (Q to quit):`).trim().toLowerCase();
        if(userInput === 'q') {
            process.exit();
        } else {
            return winner;
        }
    } catch(e) {
        return winner;
    }
}

function pickAction(big,small,selectedAbility,contestWinner) {
    
}

