var project = {};
var risks = [];
var currentTurn = 0;
var gameOver = false;

var budgetData = [];
var qualityData = [];
var turnLabels = [];

var budgetChart;
var qualityChart;
var startGameButton;
var gameInProgress = false; // Flag to track if game is in progress

window.onload = function() {
    setDefaultProjectName();
    addRiskResponseListener();
    updateBaselineCost();
    setupHelpModal();
    // Add event listeners for all back buttons
    setupBackButtons();
    const divsToHide = ['simulation', 'finalResult', 'game'];
    
    divsToHide.forEach(function(divId) {
      const div = document.getElementById(divId);
      if (div) {
        div.style.display = 'none';
      }
    });

    // Add this at the very end of your window.onload function
setTimeout(function() {
    console.log("Forcibly hiding divs");
    const divsToHide = ['simulation', 'finalResult', 'game'];
    
    divsToHide.forEach(function(divId) {
        const div = document.getElementById(divId);
        if (div) {
            console.log("Hiding div:", divId);
            div.style.display = 'none';
        } else {
            console.log("Div not found:", divId);
        }
    });
}, 1000); // Delay by 1 second to ensure it runs after other scripts
};

// New function to set up back button event listeners
function setupBackButtons() {
    // Back button from game to setup
    document.getElementById('gameBackButton').addEventListener('click', function() {
        // Only allow going back if the game is not in progress
        if (!gameInProgress) {
            document.getElementById('game').classList.add('hidden');
            document.getElementById('setup').classList.remove('hidden');
        }
    });
    
    // Back button from simulation to game
    document.getElementById('simulationBackButton').addEventListener('click', function() {
        // Only allow going back if the game is not in progress
        if (!gameInProgress) {
            document.getElementById('simulation').classList.add('hidden');
            document.getElementById('game').classList.remove('hidden');
        }
    });
    
    // Back button from final result to setup (restart game)
    document.getElementById('finalResultBackButton').addEventListener('click', function() {
        document.getElementById('finalResult').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
        resetGame();
    });
}

// New function to toggle back button state
function toggleBackButtons(enabled) {
    document.getElementById('gameBackButton').disabled = !enabled;
    document.getElementById('simulationBackButton').disabled = !enabled;
    
    // Update the visual appearance based on state
    if (enabled) {
        document.getElementById('gameBackButton').classList.remove('button-disabled');
        document.getElementById('simulationBackButton').classList.remove('button-disabled');
    } else {
        document.getElementById('gameBackButton').classList.add('button-disabled');
        document.getElementById('simulationBackButton').classList.add('button-disabled');
    }
}

// New function to reset the game state
function resetGame() {
    project = {};
    risks = [];
    currentTurn = 0;
    gameOver = false;
    gameInProgress = false;
    budgetData = [];
    qualityData = [];
    turnLabels = [];
    
    // Enable back buttons
    toggleBackButtons(true);
    
    // Reset form values
    setDefaultProjectName();
    document.getElementById('projectBudget').value = '';
    document.getElementById('projectDuration').value = '';
    document.getElementById('baselineCost').value = '';
    document.getElementById('riskContingencyPercentage').value = '10';
}

function setDefaultProjectName() {
    var projectNames = ["Turing", "Ada", "Grace", "Linus", "Jobs", "Gates", "Von Neumann", "Tesla", "Dijkstra", "Knuth"];
    var randomName = projectNames[Math.floor(Math.random() * projectNames.length)];
    var currentDate = new Date();
    var dateString = formatDate(currentDate);
    var timeString = formatTime(currentDate);
    var defaultProjectName = randomName + " " + dateString + " " + timeString;
    document.getElementById('projectName').value = defaultProjectName;
}

function formatDate(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + "." + month + "." + year;
}

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return hours + ":" + minutes;
}

function updateBaselineCost() {
    // Convert project budget from €k to €
    var projectBudget = parseFloat(document.getElementById('projectBudget').value) * 1000;
    var projectDuration = parseInt(document.getElementById('projectDuration').value);
    if (isNaN(projectBudget) || isNaN(projectDuration) || projectDuration === 0) {
        document.getElementById('baselineCost').value = "";
        return;
    }
    // Calculate baseline cost per turn then convert back to €k for display
    var baselineCostPerTurn = (projectBudget / projectDuration) - (0.01 * projectBudget);
    baselineCostPerTurn = baselineCostPerTurn / 1000;
    document.getElementById('baselineCost').value = baselineCostPerTurn.toFixed(2);
}


document.addEventListener("DOMContentLoaded", function() {
    startGameButton = document.getElementById("startGameButton");  // Assign button
    if (startGameButton) {
        startGameButton.addEventListener("click", startGame);
        console.log("Start Game button found and event listener added.");
    } else {
        console.log("⚠️ Error: Start Game button NOT found!");
    }
    // startGameButton.disabled = true; // Disable the button
    // console.log("Button disabled status:", startGameButton.disabled);

    // console.log("Game should start now");
});


function startGame(event) {
    event.preventDefault();
    console.log("Start game function triggered");

    if (startGameButton) {
        console.log("Button disabled status:", startGameButton.disabled);
    } else {
        console.log("startGameButton is not defined");
    }

    var projectNameInput = document.getElementById('projectName').value;
    var projectBudget = parseFloat(document.getElementById('projectBudget').value) * 1000;
    var projectDuration = parseInt(document.getElementById('projectDuration').value);
    var baselineCostPerTurn = parseFloat(document.getElementById('baselineCost').value) * 1000;
    var riskContingencyPercentage = parseFloat(document.getElementById('riskContingencyPercentage').value);

    if (projectNameInput === "") {
        console.log("Project name is empty, showing Swal");
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a project name.',
            icon: 'error',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
    }

    if (isNaN(baselineCostPerTurn) || baselineCostPerTurn <= 0) {
        console.log("Invalid Baseline Cost per Turn, showing Swal");
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Baseline Cost per Turn. Please check your Project budget and duration.',
            icon: 'error',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
    }

    console.log("Game should start now");
    console.log("Button disabled status:", startGameButton.disabled);


    // Cheat function activation (if project name is "risk")
    if (projectNameInput.trim().toLowerCase() === "risk") {
        var currentDate = new Date();
        var dateString = formatDate(currentDate);
        var timeString = formatTime(currentDate);
        projectNameInput += " " + dateString + " " + timeString;
        generateCheatRisks();
    }

    var riskContingencyBudget = (riskContingencyPercentage / 100) * projectBudget;

    project = {
        name: projectNameInput,
        budget: projectBudget,
        originalBudget: projectBudget,
        riskContingencyBudget: riskContingencyBudget,
        originalRiskContingencyBudget: riskContingencyBudget,
        baselineCostPerTurn: baselineCostPerTurn,
        duration: projectDuration,
        originalDuration: projectDuration,
        quality: 100
    };

    
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    updateRiskTable();
}

// Move these functions outside of startGame
function generateCheatRisks() {
    var cheatRisks = [
        {
            name: "Requirement Creep",
            type: "Scope",
            likelihood: 4,
            impact: 3,
            minCost: 5000,
            costPercentage: 5,
            responseDescription: "Implement agile practices and regular backlog reviews to control scope."
        },
        {
            name: "Technical Debt Accumulation",
            type: "Technical",
            likelihood: 3,
            impact: 4,
            minCost: 4000,
            costPercentage: 4,
            responseDescription: "Plan refactoring cycles and enforce code reviews to reduce technical debt."
        },
        {
            name: "Integration Issues",
            type: "Technical",
            likelihood: 3,
            impact: 3,
            minCost: 3000,
            costPercentage: 3,
            responseDescription: "Conduct early prototyping and thorough integration testing."
        },
        {
            name: "Security Vulnerability",
            type: "Security",
            likelihood: 2,
            impact: 5,
            minCost: 6000,
            costPercentage: 6,
            responseDescription: "Perform regular security audits and implement robust security measures."
        },
        {
            name: "Team Turnover",
            type: "Operational",
            likelihood: 4,
            impact: 2,
            minCost: 2000,
            costPercentage: 2,
            responseDescription: "Enhance team retention through competitive incentives and a positive culture."
        }
    ];

    cheatRisks.forEach(function(riskData) {
        var riskScore = riskData.likelihood * riskData.impact;
        var riskLevel = getRiskLevel(riskScore);

        var risk = {
            name: riskData.name,
            type: riskData.type,
            likelihood: riskData.likelihood,
            impact: riskData.impact,
            minCost: riskData.minCost,
            costPercentage: riskData.costPercentage,
            score: riskScore,
            level: riskLevel,
            occurred: false,
            responseDescription: riskData.responseDescription
        };

        risks.push(risk);
    });
}

function addRisk() {
    var riskName = document.getElementById('riskName').value;
    var riskType = document.getElementById('riskType').value;
    var likelihood = parseInt(document.getElementById('likelihood').value);
    var impact = parseInt(document.getElementById('impact').value);
    var minCost = parseFloat(document.getElementById('minCost').value);
    var costPercentage = parseFloat(document.getElementById('costPercentage').value);
    var riskResponseDescription = document.getElementById('riskResponseDescription').value;

    if (riskName === "") {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a risk name.',
            icon: 'error',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
        // alert("Please enter a risk name.");
        // return;
    }

    if (riskResponseDescription.trim() === "") {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a risk response description.',
            icon: 'error',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
        // alert("Please enter a risk response description.");
        // return;
    }

    var riskScore = likelihood * impact;
    var riskLevel = getRiskLevel(riskScore);

    var risk = {
        name: riskName,
        type: riskType,
        likelihood: likelihood,
        impact: impact,
        minCost: minCost,
        costPercentage: costPercentage,
        score: riskScore,
        level: riskLevel,
        occurred: false,
        responseDescription: riskResponseDescription
    };

    risks.push(risk);
    updateRiskTable();
    document.getElementById('riskName').value = "";
    document.getElementById('minCost').value = "5000";
    document.getElementById('costPercentage').value = "5";
    document.getElementById('riskResponseDescription').value = "";
}

function getRiskLevel(score) {
    if (score <= 4) return "Low";
    else if (score <= 9) return "Medium";
    else if (score <= 15) return "High";
    else return "Critical";
}

function updateRiskTable() {
    var table = document.getElementById('riskTable');
    table.innerHTML = `
        <tr>
            <th>Risk Name</th>
            <th>Type</th>
            <th>Likelihood</th>
            <th>Impact</th>
            <th>Min Cost (€)</th>
            <th>Cost (% of Budget)</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Risk Response Description</th>
        </tr>
    `;

    risks.forEach(function(risk) {
        var row = table.insertRow();
        row.innerHTML = `
            <td class="left-align">${risk.name}</td>
            <td>${risk.type}</td>
            <td>${risk.likelihood}</td>
            <td>${risk.impact}</td>
            <td class="right-align">${risk.minCost.toLocaleString()}</td>
            <td>${risk.costPercentage}%</td>
            <td>${risk.score}</td>
            <td>${risk.level}</td>
            <td class="left-align">${risk.responseDescription}</td>
        `;
        row.classList.add(getRiskLevelClass(risk.level));
    });
}

function getRiskLevelClass(level) {
    switch(level) {
        case "Low": return "low";
        case "Medium": return "medium";
        case "High": return "high";
        case "Critical": return "critical";
        default: return "";
    }
}

function proceedToSimulation() {
    if (risks.length < 5) {
        Swal.fire({
            title: 'Error!',
            text: 'Please add at least 5 risks before proceeding.',
            icon: 'error',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
        // alert("Please add at least 5 risks before proceeding.");
        // return;
    }
    document.getElementById('game').classList.add('hidden');
    document.getElementById('simulation').classList.remove('hidden');
    updateProjectStatus();
    document.getElementById('simulationInfo').innerText = `Managing Software Project: ${project.name}`;
    initializeCharts();
}

function nextTurn() {
    if (gameOver) return;
    
    // Set the game in progress flag
    gameInProgress = true;
    
    // Disable back buttons once gameplay begins
    toggleBackButtons(false);

    currentTurn++;
    if (currentTurn > project.duration) {
        checkWinCondition();
        return;
    }

    project.budget -= project.baselineCostPerTurn;
    var riskEvent = checkForRiskEvent();
    if (riskEvent) {
        document.getElementById('riskEvent').classList.remove('hidden');
        document.getElementById('riskEventDescription').innerHTML = `
            <p>Risk "<strong>${riskEvent.name}</strong>" has occurred!</p>
            <p>Type: ${riskEvent.type}</p>
            <p>Likelihood: ${riskEvent.likelihood}</p>
            <p>Impact: ${riskEvent.impact}</p>
            <p>Minimum Cost if Occurs: €${riskEvent.minCost.toLocaleString()}</p>
            <p>Cost as % of Budget: ${riskEvent.costPercentage}%</p>
            <p>Risk Response Description: ${riskEvent.responseDescription}</p>
        `;
        document.getElementById('nextTurnButton').disabled = true;
        currentRiskEvent = riskEvent;
    } else {
        updateProjectStatus();
        updateCharts();
        checkWinCondition();
    }
}

var currentRiskEvent = null;

function checkForRiskEvent() {
    var shuffledRisks = risks.slice().sort(() => 0.5 - Math.random());
    for (var i = 0; i < shuffledRisks.length; i++) {
        var risk = shuffledRisks[i];
        if (!risk.occurred) {
            var probability = risk.likelihood / 5;
            if (Math.random() < probability) {
                risk.occurred = true;
                return risk;
            }
        }
    }
    return null;
}

function respondToRisk() {
    var response = document.getElementById('riskResponse').value;
    if (response === "") {
        Swal.fire({
            title: 'Error!',
            text: 'Please select a risk response action.',
            icon: 'error',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
        // alert("Please select a risk response action.");
        // return;
    }

    var costFromMin = currentRiskEvent.minCost;
    var costFromPercentage = (currentRiskEvent.costPercentage / 100) * project.originalBudget;
    var costImpact = Math.max(costFromMin, costFromPercentage);

    switch (response) {
        case "Mitigate":
            costImpact *= 0.5;
            break;
        case "Avoid":
            costImpact *= 0.75;
            break;
        case "Transfer":
            costImpact *= 0.25;
            break;
        case "Accept":
            break;
    }

    if (project.riskContingencyBudget >= costImpact) {
        project.riskContingencyBudget -= costImpact;
    } else {
        var remainingCost = costImpact - project.riskContingencyBudget;
        project.riskContingencyBudget = 0;
        project.budget -= remainingCost;
    }

    var timeImpact = currentRiskEvent.impact * 0.02 * project.originalDuration;
    switch (response) {
        case "Mitigate":
            project.duration += timeImpact * 0.5;
            break;
        case "Avoid":
            project.duration += timeImpact * 0.75;
            break;
        case "Transfer":
            project.duration += timeImpact * 0.25;
            break;
        case "Accept":
            project.duration += timeImpact;
            break;
    }

    project.quality -= currentRiskEvent.impact * 2;

    document.getElementById('riskEvent').classList.add('hidden');
    document.getElementById('nextTurnButton').disabled = false;
    updateProjectStatus();
    updateCharts();
    checkWinCondition();
}

function updateProjectStatus() {
    var budgetPercent = (project.budget / project.originalBudget) * 100;
    var qualityPercent = project.quality;
    var riskContingencyPercent = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;

    document.getElementById('budgetProgress').style.width = budgetPercent + '%';
    document.getElementById('qualityProgress').style.width = qualityPercent + '%';
    document.getElementById('riskContingencyProgress').style.width = riskContingencyPercent + '%';

    var timeRemaining = Math.max(project.duration - currentTurn, 0);
    timeRemaining = timeRemaining.toFixed(1);

    var status = `
        <p>Turn: ${currentTurn} / ${project.originalDuration}</p>
        <p>Budget Remaining: €${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Risk Contingency Remaining: €${project.riskContingencyBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Time Remaining: ${timeRemaining} months</p>
        <p>Quality: ${project.quality}%</p>
    `;
    document.getElementById('projectStatus').innerHTML = status;

    if (project.budget <= 0 || project.quality <= 0) {
        gameOver = true;
        finalizeGame(false);
    }
}

function checkWinCondition() {
    if (currentTurn >= project.duration) {
        if (project.budget > 0 && project.quality > 50) {
            finalizeGame(true);
        } else {
            finalizeGame(false);
        }
    }
}

function finalizeGame(isSuccess) {
    document.getElementById('simulation').classList.add('hidden');
    
    // Game is over, we can reset the flag
    gameInProgress = false;

    let finalScore = calculateFinalScore();

    let budgetRemaining = (project.budget / project.originalBudget) * 100;
    let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;
    let finalInfo = `
        <p><strong>Final Budget Remaining:</strong> €${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${budgetRemaining.toFixed(2)}%)</p>
        <p><strong>Final Risk Contingency Remaining:</strong> €${project.riskContingencyBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${riskContingencyRemaining.toFixed(2)}%)</p>
        <p><strong>Final Quality Percentage:</strong> ${project.quality}%</p>
    `;

    let message;
    if (isSuccess) {
        message = `
            <h2>Congratulations! Project Completed Successfully</h2>
            <p>You delivered the software project on budget and maintained high quality.</p>
            <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnd2d3lrZGhxbm5zZDdkYmI1Zng5Y2VjZGdjYW02dHc3eDdiaHk5cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hcnh1VGMNW3Sb8c5aX/giphy.gif" alt="Success GIF">
        `;
    } else {
        var failureReason = '';
        if (project.budget <= 0 && project.quality <= 50) {
            failureReason = 'Your project ran out of budget and quality fell below acceptable levels.';
        } else if (project.budget <= 0) {
            failureReason = 'Your project ran out of budget before completion.';
        } else if (project.quality <= 50) {
            failureReason = 'Your project quality was too low.';
        } else {
            failureReason = 'Your project could not be completed successfully.';
        }

        message = `
            <h2>Game Over: Project Failed</h2>
            <p>${failureReason}</p>
            <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnRqcmNzZGhoc2ZidGs5bWN2MWI0MXVucjVqcWozM294a3Vid3NvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BGlGy3pD9THOFVzdtf/giphy.gif" alt="Failure GIF">
        `;
    }

    document.getElementById('finalResult').innerHTML = `
        <h2>Simulation Results</h2>
        ${finalInfo}
        <h3>Your Overall Score</h3>
        <p><strong>${finalScore}%</strong></p>
        ${message}
        <button class="button-action" onclick="window.print()">Print Results</button>
        <button id="finalResultBackButton" class="button-secondary">New Game</button>
    `;
    document.getElementById('finalResult').classList.remove('hidden');
    
    // Add event listener for the back button in the final result section
    document.getElementById('finalResultBackButton').addEventListener('click', function() {
        document.getElementById('finalResult').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
        resetGame();
    });
}

function calculateFinalScore() {
    let budgetRemaining = (project.budget / project.originalBudget) * 100;
    let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;
    let qualityRemaining = project.quality;

    let score = (budgetRemaining * 0.4) + (qualityRemaining * 0.4) + (riskContingencyRemaining * 0.2);
    return Math.min(score.toFixed(2), 100);
}

function initializeCharts() {
    turnLabels.push("0");
    budgetData.push(project.budget);
    qualityData.push(project.quality);

    var ctxBudget = document.getElementById('budgetChart').getContext('2d');
    budgetChart = new Chart(ctxBudget, {
        type: 'line',
        data: {
            labels: turnLabels,
            datasets: [{
                label: 'Budget Remaining (€)',
                data: budgetData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, title: { display: true, text: 'Turn' } },
                y: { display: true, title: { display: true, text: 'Budget (€)' }, beginAtZero: true }
            }
        }
    });

    var ctxQuality = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(ctxQuality, {
        type: 'line',
        data: {
            labels: turnLabels,
            datasets: [{
                label: 'Project Quality (%)',
                data: qualityData,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, title: { display: true, text: 'Turn' } },
                y: { display: true, title: { display: true, text: 'Quality (%)' }, min: 0, max: 100 }
            }
        }
    });
}

function updateCharts() {
    turnLabels.push(currentTurn.toString());
    budgetData.push(project.budget);
    qualityData.push(project.quality);
    budgetChart.update();
    qualityChart.update();
}

function addRiskResponseListener() {
    
        var riskResponseSelect = document.getElementById('riskResponse');
        riskResponseSelect.addEventListener('change', function() {
            var response = riskResponseSelect.value;
            var explanationDiv = document.getElementById('responseExplanation');
            var explanation = getResponseExplanation(response);
            explanationDiv.innerHTML = explanation;
        });
}

function getResponseExplanation(response) {
    switch(response) {
        case "Mitigate":
            return `
                <strong>Mitigate:</strong> Take actions to reduce the likelihood or impact of the risk.<br>
                <em>Example:</em> Implement code reviews and refactoring sessions.
            `;
        case "Avoid":
            return `
                <strong>Avoid:</strong> Change plans to eliminate the risk entirely.<br>
                <em>Example:</em> Modify project scope to exclude high-risk features.
            `;
        case "Transfer":
            return `
                <strong>Transfer:</strong> Shift the risk to a third party, such as outsourcing or insurance.<br>
                <em>Example:</em> Outsource non-core functionalities to mitigate risk.
            `;
        case "Accept":
            return `
                <strong>Accept:</strong> Acknowledge the risk and decide to manage it if it occurs.<br>
                <em>Example:</em> Proceed without additional measures for minor risks.
            `;
        default:
            return "";
    }
}

function exportRiskRegister() {
    if (risks.length === 0) {
        Swal.fire({
            title: 'Error!',
            text: 'No risks to export.',
            icon: 'question',
            confirmButtonText: 'Cool'
        }).then(() => {
            console.log("Swal modal closed");
        });
        return;
        // alert("No risks to export.");
        // return;
    }

    var ws_data = [
        ["Risk Name", "Type", "Likelihood", "Impact", "Min Cost (€)", "Cost (% of Budget)", "Risk Score", "Risk Level", "Risk Response Description"]
    ];

    risks.forEach(function(risk) {
        ws_data.push([
            risk.name,
            risk.type,
            risk.likelihood,
            risk.impact,
            risk.minCost,
            risk.costPercentage + "%",
            risk.score,
            risk.level,
            risk.responseDescription
        ]);
    });

    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risk Register");
    var timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, "risk_register_" + timestamp + ".xlsx");
}

function setupHelpModal() {
    var modal = document.getElementById('helpModal');
    var btn = document.getElementById('helpButton');
    var span = document.getElementsByClassName('close')[0];

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}