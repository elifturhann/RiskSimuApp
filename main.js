var project = {};
var risks = [];
var currentTurn = 0;
var gameOver = false;
var budgetData = [];
var qualityData = [];
var turnLabels = [];
var currentRiskEvent = null;
var performanceLog = [];
var budgetChartInstance = null;
var qualityChartInstance = null;
var simulatorName = "";
var simulatorStudent = "";
var editRiskIndex = -1;

window.onload = function() {
    setDefaultProjectName();
    addRiskResponseListener();
    updateBaselineCost();
    setupHelpModal();
};

function setDefaultProjectName() {
    var projectNames = ["Turing", "Ada", "Grace", "Linus", "Jobs", "Gates", "Von Neumann", "Tesla", "Dijkstra", "Knuth"];
    var randomName = projectNames[Math.floor(Math.random() * projectNames.length)];
    var currentDate = new Date();
    var dateString = formatDate(currentDate);
    var timeString = formatTime(currentDate);
    document.getElementById('projectName').value = randomName + " " + dateString + " " + timeString;
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
    var projectBudget = parseFloat(document.getElementById('projectBudget').value) * 1000;
    var projectDuration = parseInt(document.getElementById('projectDuration').value);
    if (isNaN(projectBudget) || isNaN(projectDuration) || projectDuration === 0) {
        document.getElementById('baselineCost').value = "";
        return;
    }
    var baselineCostPerTurn = (projectBudget / projectDuration) - (0.01 * projectBudget);
    document.getElementById('baselineCost').value = (baselineCostPerTurn / 1000).toFixed(2);
}

function startGame() {
    let projectNameInput = document.getElementById('projectName');
    let simulatorNameInput = document.getElementById('simulatorName');
    let simulatorStudentInput = document.getElementById('simulatorStudent');
    let projectBudget = document.getElementById('projectBudget');
    let projectDuration = document.getElementById('projectDuration');
    let baselineCostPerTurn = document.getElementById('baselineCost');
    let riskContingencyPercentage = document.getElementById('riskContingencyPercentage');

    let projectNameValue = projectNameInput.value.trim().toLowerCase();
    let simulatorNameValue = simulatorNameInput.value.trim();
    let simulatorStudentValue = simulatorStudentInput.value.trim();
    let projectBudgetValue = parseFloat(projectBudget.value) * 1000;
    let projectDurationValue = parseInt(projectDuration.value);
    let baselineCostPerTurnValue = parseFloat(baselineCostPerTurn.value) * 1000;
    let riskContingencyPercentageValue = parseFloat(riskContingencyPercentage.value); 

    simulatorName = simulatorNameInput.value.trim();
    simulatorStudent = simulatorStudentInput.value.trim();

    if (projectNameValue === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops... Error',
            text: 'Please enter a project name.',
        });
        return;
    }
    if (simulatorNameValue === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops... Error',
            text: 'Please enter your name.',
        });
        return;
    }
    if (simulatorStudentValue === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops... Error',
            text: 'Please enter your student number.',
        });
        return;
    }
    
    if (isNaN(projectBudgetValue) || projectBudgetValue <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Invalid Project Budget. Please enter a positive number.',
        });
        return;
    }

    if (projectNameValue === "tv" || projectNameValue === "risk") {
        let currentDate = new Date();
        let dateString = formatDate(currentDate);
        let timeString = formatTime(currentDate);
        projectNameValue = "Demo " + dateString + " " + timeString;
        if (risks.length === 0) {
            generateCheatRisks();
        }
    }

    var riskContingencyBudget = (riskContingencyPercentageValue / 100) * projectBudgetValue;

    project = {
        name: projectNameValue,
        simulatorName: simulatorNameValue,
        simulatorStudent: simulatorStudentValue,
        budget: projectBudgetValue,
        originalBudget: projectBudgetValue,
        riskContingencyBudget: riskContingencyBudget,
        originalRiskContingencyBudget: riskContingencyBudget,
        baselineCostPerTurn: baselineCostPerTurnValue,
        duration: projectDurationValue,
        originalDuration: projectDurationValue,
        quality: 100
    };

    document.getElementById('setup').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('gameBackButton').disabled = false;
    document.getElementById('gameBackButton').style.display = 'inline-block';
    updateRiskTable();
    if (risks.length >= 3) {
        document.getElementById('exportButton').classList.remove('hidden');
    }
}

function generateCheatRisks() {
    risks = [];
    var cheatRisks = [
        { name: "Requirement Creep", type: "Scope", likelihood: 4, impact: 3, minCost: 5000, costPercentage: 5, responseDescription: "Implement agile practices." },
        { name: "Technical Debt", type: "Technical", likelihood: 3, impact: 4, minCost: 4000, costPercentage: 4, responseDescription: "Plan refactoring cycles." },
        { name: "Integration Issues", type: "Technical", likelihood: 3, impact: 3, minCost: 3000, costPercentage: 3, responseDescription: "Conduct early testing." },
        { name: "Security Breach", type: "Security", likelihood: 2, impact: 5, minCost: 6000, costPercentage: 6, responseDescription: "Perform security audits." },
        { name: "Team Turnover", type: "Operational", likelihood: 4, impact: 2, minCost: 2000, costPercentage: 2, responseDescription: "Enhance team culture." },
        { name: "Meeting Delays", type: "Management", likelihood: 3, impact: 1, minCost: 1000, costPercentage: 1, responseDescription: "Improve scheduling processes." },
        { name: "Software Glitches", type: "Technical", likelihood: 2, impact: 2, minCost: 1500, costPercentage: 1, responseDescription: "Run frequent software updates." },
        { name: "Mild Miscommunication", type: "Management", likelihood: 3, impact: 1, minCost: 500, costPercentage: 1, responseDescription: "Hold daily sync-up meetings." },
        { name: "Late Documentation", type: "Operational", likelihood: 4, impact: 2, minCost: 1200, costPercentage: 1, responseDescription: "Set earlier deadlines for documentation tasks." },
        { name: "Minor Security Flaws", type: "Security", likelihood: 2, impact: 3, minCost: 2000, costPercentage: 2, responseDescription: "Perform light security patches." },
        { name: "Budget Adjustment", type: "Operational", likelihood: 2, impact: 3, minCost: 3500, costPercentage: 3, responseDescription: "Reassess financial allocations." },
        { name: "Limited Team Availability", type: "Operational", likelihood: 3, impact: 2, minCost: 2500, costPercentage: 2, responseDescription: "Optimize resource planning." },
        { name: "Non-Critical Hardware Issue", type: "Technical", likelihood: 4, impact: 2, minCost: 2500, costPercentage: 2, responseDescription: "Increase inventory for spare hardware." },
        { name: "Public Feedback Oversight", type: "Scope", likelihood: 2, impact: 3, minCost: 3000, costPercentage: 3, responseDescription: "Collect additional surveys." },
        { name: "Vendor Coordination Delays", type: "Operational", likelihood: 3, impact: 2, minCost: 2000, costPercentage: 2, responseDescription: "Use better coordination tools." },
        { name: "Cyber Attack", type: "Security", likelihood: 2, impact: 5, minCost: 9000, costPercentage: 9, responseDescription: "Increase cybersecurity measures." },
        { name: "Market Changes", type: "Scope", likelihood: 2, impact: 4, minCost: 4000, costPercentage: 4, responseDescription: "Adapt to market trends." },
        { name: "Natural Disaster", type: "External", likelihood: 1, impact: 5, minCost: 10000, costPercentage: 10, responseDescription: "Create a disaster recovery plan." },
        { name: "Contractor Unavailability", type: "Operational", likelihood: 3, impact: 3, minCost: 3500, costPercentage: 3, responseDescription: "Maintain a pool of backup contractors." },
        { name: "Data Loss", type: "Technical", likelihood: 3, impact: 5, minCost: 7000, costPercentage: 7, responseDescription: "Implement data backups and security." }
    ];    

    for (let i = cheatRisks.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cheatRisks[i], cheatRisks[j]] = [cheatRisks[j], cheatRisks[i]];
    }

    let randomCheatRisks = cheatRisks.slice(0, 5);

    randomCheatRisks.forEach(function(riskData) {
        var riskScore = riskData.likelihood * riskData.impact;
        var riskLevel = getRiskLevel(riskScore);
        risks.push({
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
        });
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
            icon: 'error',
            title: 'Missing Input',
            text: 'Please enter a risk name.',
        });
        return;
    }
    if (riskResponseDescription.trim() === "") {
        Swal.fire({
            icon: 'error',
            title: 'Missing Input',
            text: 'Please enter a risk response description.',
        });
        return;
    }
    if (isNaN(likelihood) || likelihood <= 0 || likelihood > 5) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Input',
            text: 'Please specify the risk likelihood. It must be between 1 and 5.',
        });
        return;
    }
    if (isNaN(impact) || impact <= 0 || impact > 5) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Input',
            text: 'Please specify the impact level. It must be between 1 and 5.',
        });
        return;
    }
    if (isNaN(minCost) || minCost <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Input',
            text: 'Please specify the Minimum Cost if Occurs.',
        });
        return;
    }
    if (isNaN(costPercentage) || costPercentage <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Input',
            text: 'Please specify the Cost as % of Budget.',
        });
        return;
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

    if (editRiskIndex === -1) {
        risks.push(risk);
    } else {
        risks[editRiskIndex] = risk;
        editRiskIndex = -1;
        document.querySelector('.risk-group button').textContent = "Add Risk";
    }

    updateRiskTable();
    document.getElementById('riskName').value = "";
    document.getElementById('riskType').value = "Technical";
    document.getElementById('likelihood').value = "3";
    document.getElementById('impact').value = "3";
    document.getElementById('minCost').value = "5000";
    document.getElementById('costPercentage').value = "5";
    document.getElementById('riskResponseDescription').value = "";

    if (risks.length >= 3) {
        document.getElementById('exportButton').classList.remove('hidden');
    }
}

function editRisk(index) {
    var risk = risks[index];
    document.getElementById('riskName').value = risk.name;
    document.getElementById('riskType').value = risk.type;
    document.getElementById('likelihood').value = risk.likelihood;
    document.getElementById('impact').value = risk.impact;
    document.getElementById('minCost').value = risk.minCost;
    document.getElementById('costPercentage').value = risk.costPercentage;
    document.getElementById('riskResponseDescription').value = risk.responseDescription;

    editRiskIndex = index;
    document.querySelector('.risk-group button').textContent = "Save Risk";
}

function removeRisk(index) {
    risks.splice(index, 1);
    updateRiskTable();
    if (risks.length < 3) {
        document.getElementById('exportButton').classList.add('hidden');
    }
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
            <th>Cost (%)</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Risk Response</th>
            <th>Action</th>
        </tr>
    `;
    risks.forEach(function(risk, index) {
        var row = table.insertRow();
        var riskLevelClass = getRiskLevelClass(risk.level);
        row.innerHTML = `
            <td class="left-align">${risk.name}</td>
            <td>${risk.type}</td>
            <td>${risk.likelihood}</td>
            <td>${risk.impact}</td>
            <td class="right-align">${risk.minCost.toLocaleString()}</td>
            <td class="right-align">${risk.costPercentage}%</td>
            <td>${risk.score}</td>
            <td class="${riskLevelClass}">${risk.level}</td>
            <td class="left-align">${risk.responseDescription}</td>
            <td>
                <i class="fas fa-pencil-alt edit-button" onclick="editRisk(${index})"></i>
                <i class="fas fa-trash remove-button" onclick="removeRisk(${index})"></i>
            </td>
        `;
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
            icon: 'warning',
            title: 'Incomplete Risks',
            text: 'Please add at least 5 risks before proceeding.',
        });
        return;
    }
    document.getElementById('game').classList.add('hidden');
    document.getElementById('simulation').classList.remove('hidden');
    updateProjectStatus();
    document.getElementById('simulationInfo').innerText = `Managing Software Project: ${project.name}`;
    initializeCharts();
}

function exportRiskRegisterToExcel() {
    if (risks.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Data',
            text: 'No risks to export.',
        });
        return;
    }
    
    const ws_data = [
        ["Name:", simulatorName || "Not Provided"],
        ["Student ID:", simulatorStudent || "Not Provided"],
        [],
        ["Risk Name", "Type", "Likelihood", "Impact", "Min Cost (€)", "Cost (% of Budget)", "Risk Score", "Risk Level", "Risk Response Description"]
    ];
    
    risks.forEach(risk => {
        ws_data.push([
            risk.name,
            risk.type,
            risk.likelihood,
            risk.impact,
            risk.minCost,
            `${risk.costPercentage}%`,
            risk.score,
            risk.level,
            risk.responseDescription
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risk Register");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, `risk_register_${timestamp}.xlsx`);
}

function nextTurn() {
    if (gameOver) return;
    
    if (currentTurn === 0) {
        document.getElementById('nextTurnButton').innerHTML = "Next Turn";
        currentTurn++;
    } else {
        currentTurn++;
        
        if (currentTurn > project.duration) {
            checkWinCondition();
            return;
        }
        
        project.budget -= project.baselineCostPerTurn;
    }
    
    updateProjectStatus();
    updateCharts();
    
    var riskEvent = checkForRiskEvent();
    if (riskEvent) {
        document.getElementById('riskEvent').classList.remove('hidden');
        document.getElementById('riskEventDescription').innerHTML = `
            <div class="status-line"><span class="label">Risk:</span><span class="value"><strong>${riskEvent.name}</strong> has occurred!</span></div>
            <div class="status-line"><span class="label">Type:</span><span class="value">${riskEvent.type}</span></div>
            <div class="status-line"><span class="label">Likelihood:</span><span class="value">${riskEvent.likelihood}</span></div>
            <div class="status-line"><span class="label">Impact:</span><span class="value">${riskEvent.impact}</span></div>
            <div class="status-line"><span class="label">Min Cost if Occurs:</span><span class="value">€${riskEvent.minCost.toLocaleString()}</span></div>
            <div class="status-line"><span class="label">Cost as % of Budget:</span><span class="value">${riskEvent.costPercentage}%</span></div>
            <div class="status-line"><span class="label">Response:</span><span class="value">${riskEvent.responseDescription}</span></div>
        `;
        document.getElementById('nextTurnButton').disabled = true;
        currentRiskEvent = riskEvent;
    } else {
        checkWinCondition();
    }
}

function checkForRiskEvent() {
    var pendingRisks = risks.filter(risk => !risk.occurred);
    if (pendingRisks.length === 0) return null;
    
    var selectedRiskIndex = Math.floor(Math.random() * pendingRisks.length);
    var risk = pendingRisks[selectedRiskIndex];
    
    var probability;
    switch(risk.likelihood) {
        case 5: probability = 0.90; break;
        case 4: probability = 0.70; break;
        case 3: probability = 0.50; break;
        case 2: probability = 0.30; break;
        case 1: probability = 0.10; break;
        default: probability = 0.10;
    }
    
    if (Math.random() < probability) {
        risk.occurred = true;
        return risk;
    }
    
    return null;
}

function respondToRisk() {
    var response = document.getElementById('riskResponse').value;
    if (response === "") {
        Swal.fire({
            icon: 'error',
            title: 'No Action Selected',
            text: 'Please select a risk response action.',
        });
        return;
    }

    var costFromMin = currentRiskEvent.minCost;
    var costFromPercentage = (currentRiskEvent.costPercentage / 100) * project.originalBudget;
    var costImpact = Math.max(costFromMin, costFromPercentage);

    switch (response) {
        case "Mitigate": costImpact *= 0.5; break;
        case "Avoid": costImpact *= 0.75; break;
        case "Transfer": costImpact *= 0.25; break;
        case "Accept": break;
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
        case "Mitigate": project.duration += timeImpact * 0.5; break;
        case "Avoid": project.duration += timeImpact * 0.75; break;
        case "Transfer": project.duration += timeImpact * 0.25; break;
        case "Accept": project.duration += timeImpact; break;
    }

    project.quality -= currentRiskEvent.impact * 2;
    performanceLog.push({
        turn: currentTurn,
        risk: currentRiskEvent.name,
        response: response,
        costImpact: costImpact,
        quality: project.quality,
        timeImpact: timeImpact
    });
    
    document.getElementById('riskEvent').classList.add('hidden');
    document.getElementById('nextTurnButton').disabled = false;
    updateProjectStatus();
    updateCharts();
    checkWinCondition();
    document.getElementById('riskResponse').value = "";
}

function updateProjectStatus() {
    var budgetPercent = (project.budget / project.originalBudget) * 100;
    var qualityPercent = project.quality;
    var riskContingencyPercent = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;

    document.getElementById('budgetProgress').style.width = budgetPercent + '%';
    document.getElementById('qualityProgress').style.width = qualityPercent + '%';
    document.getElementById('riskContingencyProgress').style.width = riskContingencyPercent + '%';

    var timeRemaining = Math.max(project.duration - currentTurn, 0).toFixed(1);
    document.getElementById('projectStatus').innerHTML = `
        <div class="status-line"><span class="label">Turn:</span><span class="value">${currentTurn} / ${project.originalDuration}</span></div>
        <div class="status-line"><span class="label">Budget Remaining:</span><span class="value">€${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="status-line"><span class="label">Risk Contingency Remaining:</span><span class="value">€${project.riskContingencyBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
        <div class="status-line"><span class="label">Time Remaining:</span><span class="value">${timeRemaining} months</span></div>
        <div class="status-line"><span class="label">Quality:</span><span class="value">${project.quality}%</span></div>
    `;

    var realTimeScore = calculateFinalScore();
    document.getElementById('scoreValue').innerText = realTimeScore + "%";
    var emoji = realTimeScore > 80 ? "🎉" : realTimeScore > 50 ? "👍" : "⚠️";
    document.getElementById('realTimeScore').innerHTML = `Current Score: <span id="scoreValue">${realTimeScore}%</span> ${emoji}`;

    if (currentTurn === 0) {
        document.getElementById('nextTurnButton').innerHTML = "Proceed to Simulation";
    } else {
        document.getElementById('nextTurnButton').innerHTML = "Next Turn";
    }

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
    let finalScore = calculateFinalScore();
    let grade = getGrade(finalScore);
    let budgetRemaining = (project.budget / project.originalBudget) * 100;
    let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;

    let finalInfo = `
        <div class="table-row">
            <span class="label">Final Budget:</span>
            <span class="value">€${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${budgetRemaining.toFixed(2)}%)</span>
        </div>
        <div class="table-row">
            <span class="label">Final Contingency:</span>
            <span class="value">€${project.riskContingencyBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${riskContingencyRemaining.toFixed(2)}%)</span>
        </div>
        <div class="table-row">
            <span class="label">Final Quality:</span>
            <span class="value">${project.quality}%</span>
        </div>
    `;

    let message = isSuccess ?
        `<h2>Congratulations! Project Completed</h2><p>You delivered the project successfully.</p><img src="https://media0.giphy.com/media/hcnh1VGMNW3Sb8c5aX/giphy.gif" alt="Success">` :
        `<h2>Game Over: Project Failed</h2><p>${project.budget <= 0 ? "Out of budget" : "Quality too low"}</p><img src="https://media1.giphy.com/media/BGlGy3pD9THOFVzdtf/giphy.gif" class='result-img' alt="Failure">`;

    let logHtml = `
        <h3 style="text-align:center;">Performance Log</h3>
        <div class="performance-log-container">
            <table class="performance-log-table">
                <thead>
                    <tr>
                        <th>Turn</th>
                        <th>Risk</th>
                        <th>Response</th>
                        <th>Cost</th>
                        <th>Quality</th>
                        <th>Time Impact</th>
                    </tr>
                </thead>
                <tbody>
    `;

    performanceLog.forEach(entry => {
        logHtml += `
            <tr>
                <td>${entry.turn}</td>
                <td>${entry.risk}</td>
                <td>${entry.response}</td>
                <td>€${entry.costImpact.toLocaleString()}</td>
                <td>${entry.quality}%</td>
                <td>${entry.timeImpact.toFixed(2)} days</td>
            </tr>
        `;
    });

    logHtml += `
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('finalResult').innerHTML = `
        <h1 class="result-title">Simulation Results</h1>
        <div class="result-names">
            <p class="big-name">
                <span class="label-text" style="margin-right: 5px;">Project: </span>
                <span class="value-text">${project.name}</span>
            </p>
            <p class="big-name">
                <span class="label-text" style="margin-right: 5px;">Managed by: </span>
                <span class="value-text">${project.simulatorName}</span>
            </p>
            <p class="big-name">
                <span class="label-text" style="margin-right: 5px;">Student Number: </span>
                <span class="value-text">${project.simulatorStudent}</span>
            </p>
        </div>
        <div class="table-container">${finalInfo}</div>
        <h3>Your Overall Score</h3>
        <p><strong>${finalScore}%</strong> - Grade: ${grade}</p>
        ${message}
        ${logHtml}
        <button class="button-action" onclick="window.print()">Print Results</button>
        <button class="button-action" onclick="exportPerformanceLog()">Export Performance Log to Excel</button>
        <button class="button-action" onclick="exportRiskRegisterToExcel()">Export Risk Register to Excel</button>
        <button class="button-action" onclick="tryAgain()">Try It Again</button>
    `;
    document.getElementById('finalResult').classList.remove('hidden');
}

function calculateFinalScore() {
    let budgetRemaining = (project.budget / project.originalBudget) * 100;
    let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;
    let qualityRemaining = project.quality;
    let score = (budgetRemaining * 0.4) + (qualityRemaining * 0.4) + (riskContingencyRemaining * 0.2);
    return Math.min(score.toFixed(2), 100);
}

function getGrade(score) {
    if (score >= 75) return "5 (Excellent)";
    else if (score >= 60) return "4 (Good)";
    else if (score >= 45) return "3 (Satisfactory)";
    else if (score >= 30) return "2 (Needs Improvement)";
    else if (score >= 15) return "1 (Poor)";
    else return "0 (Fail)";
}

function initializeCharts() {
    budgetData = [project.budget];
    qualityData = [project.quality];
    turnLabels = ["0"];

    const budgetCtx = document.getElementById('budgetChart').getContext('2d');
    budgetChartInstance = new Chart(budgetCtx, {
        type: 'line',
        data: {
            labels: turnLabels,
            datasets: [{
                label: 'Budget (€)',
                data: budgetData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: project.originalBudget }
            }
        }
    });

    const qualityCtx = document.getElementById('qualityChart').getContext('2d');
    qualityChartInstance = new Chart(qualityCtx, {
        type: 'line',
        data: {
            labels: turnLabels,
            datasets: [{
                label: 'Quality (%)',
                data: qualityData,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

function updateCharts() {
    turnLabels.push(currentTurn.toString());
    budgetData.push(project.budget);
    qualityData.push(project.quality);

    budgetChartInstance.data.labels = turnLabels;
    budgetChartInstance.data.datasets[0].data = budgetData;
    budgetChartInstance.update();

    qualityChartInstance.data.labels = turnLabels;
    qualityChartInstance.data.datasets[0].data = qualityData;
    qualityChartInstance.update();
}

function addRiskResponseListener() {
    var riskResponseSelect = document.getElementById('riskResponse');
    riskResponseSelect.addEventListener('change', function() {
        var response = riskResponseSelect.value;
        document.getElementById('responseExplanation').innerHTML = getResponseExplanation(response);
    });
}

function getResponseExplanation(response) {
    switch(response) {
        case "Mitigate": return "<strong>Mitigate:</strong> Reduce likelihood or impact.<br><em>Example:</em> Add code reviews.";
        case "Avoid": return "<strong>Avoid:</strong> Eliminate the risk.<br><em>Example:</em> Cut high-risk features.";
        case "Transfer": return "<strong>Transfer:</strong> Shift to a third party.<br><em>Example:</em> Outsource.";
        case "Accept": return "<strong>Accept:</strong> Manage if it occurs.<br><em>Example:</em> Proceed as is.";
        default: return "";
    }
}

function exportPerformanceLog() {
    if (performanceLog.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Data',
            text: 'No performance data to export.',
        });
        return;
    }
    
    const ws_data = [
        ["Name:", simulatorName || "Not Provided"],
        ["Student ID:", simulatorStudent || "Not Provided"],
        [],
        ["Turn", "Risk", "Response", "Cost Impact (€)", "Quality (%)"]
    ];
    
    performanceLog.forEach(entry => {
        ws_data.push([
            entry.turn,
            entry.risk,
            entry.response,
            entry.costImpact,
            entry.quality
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance Log");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, `performance_log_${timestamp}.xlsx`);
}

function setupHelpModal() {
    var modal = document.getElementById('helpModal');
    var btn = document.getElementById('helpButton');
    var span = document.querySelector('.close');
    btn.onclick = function() { modal.style.display = "block"; };
    span.onclick = function() { modal.style.display = "none"; };
    window.onclick = function(event) {
        if (event.target == modal) modal.style.display = "none";
    };
}

function goBack() {
    if (!document.getElementById('game').classList.contains('hidden')) {
        document.getElementById('game').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
        document.getElementById('exportButton').classList.add('hidden');
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Navigation Restricted',
            text: 'Cannot go back after starting the game or during simulation.',
        });
    }
}

function tryAgain() {
    project = {};
    risks = [];
    currentTurn = 0;
    gameOver = false;
    budgetData = [];
    qualityData = [];
    turnLabels = [];
    currentRiskEvent = null;
    performanceLog = [];
    if (budgetChartInstance) budgetChartInstance.destroy();
    if (qualityChartInstance) qualityChartInstance.destroy();

    document.getElementById('finalResult').classList.add('hidden');
    document.getElementById('setup').classList.remove('hidden');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('simulation').classList.add('hidden');
    document.getElementById('gameBackButton').disabled = true;
    document.getElementById('projectName').value = "";
    document.getElementById('simulatorName').value = "";
    document.getElementById('simulatorStudent').value = "";
    document.getElementById('projectBudget').value = "100";
    document.getElementById('projectDuration').value = "24";
    document.getElementById('riskContingencyPercentage').value = "10";
    document.getElementById('exportButton').classList.add('hidden');
    setDefaultProjectName();
    updateBaselineCost();
}