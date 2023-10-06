function runNumbers() {
    console.log("===Average move count===");
    let config = {runs: 10000, critsOn: true, health: 400, minDmg: 5, maxDmg: 20};
    let averageMoveCount = getAverageMoveCount(config);
    console.log(config);
    console.log(averageMoveCount);  
    console.log("\n"); 

    config = {runs: 10000, critsOn: true, health: 500, minDmg: 5, maxDmg: 20};
    averageMoveCount = getAverageMoveCount(config);
    console.log(config);
    console.log(averageMoveCount);  
    console.log("\n"); 

    console.log("===Average Initiative Wins===");
    config = {runs: 10000, rolls: 60, useBalance: false};
    let averageInitiativeCounts = getInitiativeCounts(config);
    console.log(config);
    console.log(averageInitiativeCounts);  
    console.log("\n"); 
}

runNumbers();


function getAverageMoveCount(config) {
    let critSuccessCount = 0;
    let critFailureCount = 0;
    let hits = 0;
    let misses = 0;
    for(let run = 0; run < config.runs; run++) {
        let health = config.health;
        while(health > 0) {
            let damageRoll = Math.ceil(Math.random() * ((config.maxDmg+1) - config.minDmg) + config.minDmg)-1;
            let successRoll = Math.ceil(Math.random() * 20);
            if(successRoll === 1) {
                // crit fail
                critFailureCount++;
                misses++;
            } else if(successRoll === 20) {
                // crit success
                hits++;
                critSuccessCount++;
                health = health - (Math.floor(damageRoll*1.5));
            } else {
                hits++;
                health -= damageRoll;
            }
        }
    }

    return {
        avgCritSuccessCount: critSuccessCount/config.runs,
        avgCritFailureCount: critFailureCount/config.runs,
        avgHitCount: hits/config.runs,
        avgMissCount: misses/config.runs, 
    }


}

function getInitiativeCounts(config) {
    let personAWins = 0;
    let personBWins = 0;
    for(let run = 0; run < config.runs; run++) {
        for(let roll = 0; roll < config.rolls; roll++) {
            Math.ceil(Math.random()*10) > 5 ? personAWins++ : personBWins++; 
        }
    }

    return {
        personAWins: personAWins/config.runs,
        personBWins: personBWins/config.runs,
    }
}


