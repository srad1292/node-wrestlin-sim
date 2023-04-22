// @ts-nocheck
const prompt = require('prompt-sync')();

let bigGuy = {
    id: 0,
    name: 'Big Guy',
    height: 75,
    weight: 240,
    hp: 30,
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
    id: 1,
    name: 'Small Guy',
    height: 63,
    weight: 190,
    hp: 30,
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
        // display results if match over
        play = askToPlayAgain(bigGuyClone, smallGuyClone);
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
    let inControl;
    while(big.hp > 0 && small.hp > 0) {
        console.clear();
        // Determine initiative
        if(!inControl) {
            inControl = determineInitiative(big, small);
        }
        let selectedAbility = abilitySelection(big,small,inControl);
        // Show who wins ability contest
        let contestWinner = await determineContestWinner(big,small,inControl,selectedAbility);
        // pick action
        let action = pickAction(big,small,selectedAbility,contestWinner); 
        // perform action
        inControl = await performAction(big,small,contestWinner,action);
    }
    
    
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
    let moves = getTestMoves();
    let moveSelected = false;
    let moveInputFailed = false;
    let selectedMove = '';
    do {
        printPickActionScreen(big, small, contestWinner, moves);
        if(moveInputFailed) {
            console.log("Last input was invalid.  Try again.");
        }
        try {
            let userInput = prompt(`Select Move(1-${moves.length}) or Quit(q): `).trim().toLowerCase();
            if(userInput === 'q') {
                process.exit();
            }
            userInput = parseInt(userInput);
            if(userInput >= 1 && userInput <= moves.length) {
                moveSelected = true;
                selectedMove = moves[userInput - 1];
            } else {
                moveInputFailed = true;
            }
        } catch (e) {
            moveInputFailed = true;
        }
    } while(!moveSelected);

    return selectedMove;
}

function printPickActionScreen(big, small, contestWinner, moves) {
    console.clear();
    let matchDisplay = buildMatchDisplay(big, small);
    matchDisplay.forEach(line => console.log(line));
    let matchListDisplay = buildMoveListDisplay(moves);
    console.log("");
    matchListDisplay.forEach(line => console.log(line));
    console.log("");
    console.log(`${contestWinner.name}, what move will you attempt?`);
}

function buildMoveListDisplay(moves) {
    // 60
    let lines = [
        '============================================================',
        '|  Input  |  Move Name            |  Move Type             |',
        '|---------|-----------------------|------------------------|',

    ];
    moves.forEach(move => {
        lines.push(`|  ${move.id+1}:     |  ${buildRightPaddedString(move.name, 19, 2)}|  ${buildRightPaddedString(move.type, 19, 3)}|`);
        lines.push('|---------|-----------------------|------------------------|');
    });
    lines.push('============================================================');
    return lines;
}


function getTestMoves() {
    return [
        {
            id: 0,
            name: 'Clothesline',
            type: 'Running Strike',
            damage: [12,20],
        },
        {
            id: 1,
            name: 'Headlock',
            type: 'Grapple',
            damage: [5,7],
        },
        {
            id: 2,
            name: 'Drop Kick',
            type: 'Jumping Strike',
            damage: [10,20],
        },
        {
            id: 3,
            name: 'Chops',
            type: 'Strike',
            damage: [8,15],
        },
        {
            id: 4,
            name: 'Elbow Slam',
            type: 'Strike',
            damage: [12,24],
        },
    ]
}

async function performAction(big,small,contestWinner,action) {
    console.clear();
    let matchDisplay = buildMatchDisplay(big, small);
    matchDisplay.forEach(line => console.log(line));
    console.log(`${contestWinner.name} is attempting: ${action.name}`);
    await delay(500);
    let outcome = determineOutcome(big,small,contestWinner,action);

    try {
        if(outcome.isCriticalFailure) { console.log(`A critical miss!\n${outcome.whoTookDamage.name} takes ${outcome.damageRoll} points of damage!`); }
        else if(outcome.isCriticalSuccess) { console.log(`A critical hit!\n${outcome.whoTookDamage.name} takes ${outcome.damageRoll} points of damage!`); }
        else { console.log(`A hit! \n${outcome.whoTookDamage.name} takes ${outcome.damageRoll} points of damage!`); }
        
        let userInput = prompt(`Continue (Q to quit):`).trim().toLowerCase();
        if(userInput === 'q') {
            process.exit();
        } else {
            big.hp = big.id === outcome.whoTookDamage.id ? Math.max(0, big.hp-outcome.damageRoll) : big.hp;
            small.hp = small.id === outcome.whoTookDamage.id ? Math.max(0, small.hp-outcome.damageRoll) : small.hp;
            outcome.whoTakesControl;
        }
    } catch(e) {
        return winner;
    }
}

function determineOutcome(big,small,contestWinner,action) {
    let damageRoll = Math.ceil(Math.random() * ((action.damage[1]+1) - action.damage[0]) + action.damage[0])-1;
    let successRoll = Math.ceil(Math.random() * 20);
    let whoTookDamage, whoTakesControl;
    let bigPerforming = big.id === contestWinner.id;
    if(successRoll === 1) {
        // crit fail
        damageRoll = Math.ceil(damageRoll/2);
        whoTookDamage = bigPerforming ? big : small;
        whoTakesControl = bigPerforming ? small : big;
    } else if(successRoll === 20) {
        // crit success
        damageRoll = Math.floor(damageRoll*1.5);
        whoTookDamage = bigPerforming ? small : big;
        whoTakesControl = bigPerforming ? big : small;
    } else {
        whoTookDamage = bigPerforming ? small : big;
    }

    return {
        whoTookDamage,
        whoTakesControl,
        damageRoll,
        isCriticalFailure: successRoll === 1,
        isCriticalSuccess: successRoll === 20
    };
}

function askToPlayAgain(big, small) {
    let validInput = false;
    let input = '';
    while(!validInput) {
        console.clear();
        let matchDisplay = buildMatchDisplay(big, small);
        matchDisplay.forEach(line => console.log(line));
        console.log(`The match is over!`);
        bigGuy.hp <= 0 ? console.log(`${small.name} has won!`) : console.log(`${big.name} has won!`);
        console.log("");
        let userInput = prompt('Play Again?(y/n): ').trim().toLowerCase();
        if(userInput === 'y') {
            validInput = true;
            input = userInput;
        }
        else if(userInput === 'n') {
            process.exit();
        }
    }
    return input === 'y';
    
}

