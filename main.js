var project = {};
var risks = [];
var currentTurn = 0;
var gameOver = false;
var budgetData = [];
var qualityData = [];
var turnLabels = [];
var currentRiskEvent = null;
var performanceLog = [];

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
    var projectNameInput = document.getElementById('projectName').value.trim().toLowerCase();
    var projectBudget = parseFloat(document.getElementById('projectBudget').value) * 1000;
    var projectDuration = parseInt(document.getElementById('projectDuration').value);
    var baselineCostPerTurn = parseFloat(document.getElementById('baselineCost').value) * 1000;
    var riskContingencyPercentage = parseFloat(document.getElementById('riskContingencyPercentage').value);

    if (projectNameInput === "") {
        alert("Please enter a project name.");
        return;
    }
    if (isNaN(baselineCostPerTurn) || baselineCostPerTurn <= 0) {
        alert("Invalid Baseline Cost per Turn.");
        return;
    }

    if (projectNameInput === "tv" || projectNameInput === "risk") {
        var currentDate = new Date();
        var dateString = formatDate(currentDate);
        var timeString = formatTime(currentDate);
        projectNameInput = "Demo " + dateString + " " + timeString;
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
    document.getElementById('backButtonSetup').disabled = true;
    updateRiskTable();
}

function generateCheatRisks() {
    risks = []; // Clear existing risks for cheat
    var cheatRisks = [
        { name: "Requirement Creep", type: "Scope", likelihood: 4, impact: 3, minCost: 5000, costPercentage: 5, responseDescription: "Implement agile practices." },
        { name: "Technical Debt", type: "Technical", likelihood: 3, impact: 4, minCost: 4000, costPercentage: 4, responseDescription: "Plan refactoring cycles." },
        { name: "Integration Issues", type: "Technical", likelihood: 3, impact: 3, minCost: 3000, costPercentage: 3, responseDescription: "Conduct early testing." },
        { name: "Security Breach", type: "Security", likelihood: 2, impact: 5, minCost: 6000, costPercentage: 6, responseDescription: "Perform security audits." },
        { name: "Team Turnover", type: "Operational", likelihood: 4, impact: 2, minCost: 2000, costPercentage: 2, responseDescription: "Enhance team culture." }
    ];

    cheatRisks.forEach(function(riskData) {
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
    if (risks.length >= 5) {
        alert("Maximum of 5 risks reached!");
        return;
    }

    var riskName = document.getElementById('riskName').value;
    var riskType = document.getElementById('riskType').value;
    var likelihood = parseInt(document.getElementById('likelihood').value);
    var impact = parseInt(document.getElementById('impact').value);
    var minCost = parseFloat(document.getElementById('minCost').value);
    var costPercentage = parseFloat(document.getElementById('costPercentage').value);
    var riskResponseDescription = document.getElementById('riskResponseDescription').value;

    if (riskName === "") {
        alert("Please enter a risk name.");
        return;
    }
    if (riskResponseDescription.trim() === "") {
        alert("Please enter a risk response description.");
        return;
    }

    var riskScore = likelihood * impact;
    var riskLevel = getRiskLevel(riskScore);
    risks.push({
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
    });

    updateRiskTable();
    document.getElementById('riskName').value = "";
    document.getElementById('minCost').value = "5000";
    document.getElementById('costPercentage').value = "5";
    document.getElementById('riskResponseDescription').value = "";

    // Show export button after 3 risks
    if (risks.length >= 3) {
        document.getElementById('exportButton').classList.remove('hidden');
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
        </tr>
    `;
    risks.forEach(function(risk) {
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
    if (risks.length !== 5) {
        alert("Please add exactly 5 risks before proceeding.");
        return;
    }
    document.getElementById('game').classList.add('hidden');
    document.getElementById('simulation').classList.remove('hidden');
    updateProjectStatus();
    document.getElementById('simulationInfo').innerText = `Managing Software Project: ${project.name}`;
    initializeCharts();
}

function exportRiskRegister() {
    if (risks.length === 0) {
        alert("No risks to export.");
        return;
    }
    let csvContent = "Risk Name,Type,Likelihood,Impact,Min Cost (€),Cost (% of Budget),Risk Score,Risk Level,Risk Response Description\n";
    risks.forEach(risk => {
        csvContent += `${risk.name},${risk.type},${risk.likelihood},${risk.impact},${risk.minCost},${risk.costPercentage}%,${risk.score},${risk.level},${risk.responseDescription}\n`;
    });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `risk_register_${timestamp}.csv`;
    link.click();
}

function nextTurn() {
    if (gameOver) return;
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
            <p>Minimum Cost: €${riskEvent.minCost.toLocaleString()}</p>
            <p>Cost as % of Budget: ${riskEvent.costPercentage}%</p>
            <p>Risk Response: ${riskEvent.responseDescription}</p>
        `;
        document.getElementById('nextTurnButton').disabled = true;
        currentRiskEvent = riskEvent;
    } else {
        updateProjectStatus();
        updateCharts();
        checkWinCondition();
    }
}

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
        alert("Please select a risk response action.");
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
        quality: project.quality
    });

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

    var timeRemaining = Math.max(project.duration - currentTurn, 0).toFixed(1);
    document.getElementById('projectStatus').innerHTML = `
        <p>Turn: ${currentTurn} / ${project.originalDuration}</p>
        <p>Budget Remaining: €${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Risk Contingency: €${project.riskContingencyBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p>Time Remaining: ${timeRemaining} months</p>
        <p>Quality: ${project.quality}%</p>
    `;

    var realTimeScore = calculateFinalScore();
    document.getElementById('scoreValue').innerText = realTimeScore + "%";
    var emoji = realTimeScore > 80 ? "🎉" : realTimeScore > 50 ? "👍" : "⚠️";
    document.getElementById('realTimeScore').innerHTML = `Current Score: <span id="scoreValue">${realTimeScore}%</span> ${emoji}`;

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
        <p><strong>Final Budget:</strong> €${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${budgetRemaining.toFixed(2)}%)</p>
        <p><strong>Final Contingency:</strong> €${project.riskContingencyBudget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${riskContingencyRemaining.toFixed(2)}%)</p>
        <p><strong>Final Quality:</strong> ${project.quality}%</p>
    `;

    let message = isSuccess ?
        `<h2>Congratulations! Project Completed</h2><p>You delivered the project successfully.</p><img src="https://media0.giphy.com/media/hcnh1VGMNW3Sb8c5aX/giphy.gif" alt="Success">` :
        `<h2>Game Over: Project Failed</h2><p>${project.budget <= 0 ? "Out of budget" : "Quality too low"}</p><img src="https://media1.giphy.com/media/BGlGy3pD9THOFVzdtf/giphy.gif" alt="Failure">`;

    let logHtml = "<h3>Performance Log</h3><ul>";
    performanceLog.forEach(entry => {
        logHtml += `<li>Turn ${entry.turn}: Risk "${entry.risk}" - Response: ${entry.response} - Cost: €${entry.costImpact.toLocaleString()} - Quality: ${entry.quality}%</li>`;
    });
    logHtml += "</ul>";

    document.getElementById('finalResult').innerHTML = `
        <h2>Simulation Results</h2>
        ${finalInfo}
        <h3>Your Overall Score</h3>
        <p><strong>${finalScore}%</strong> - Grade: ${grade}</p>
        ${message}
        ${logHtml}
        <button class="button-action" onclick="window.print()">Print Results</button>
        <button class="button-action" onclick="exportPerformanceLog()">Export Log</button>
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
    if (score >= 90) return "5 (Excellent)";
    else if (score >= 75) return "4 (Good)";
    else if (score >= 60) return "3 (Satisfactory)";
    else if (score >= 40) return "2 (Needs Improvement)";
    else if (score >= 20) return "1 (Poor)";
    else return "0 (Fail)";
}

function initializeCharts() {
    turnLabels.push("0");
    budgetData.push(project.budget);
    qualityData.push(project.quality);
    updateCharts();
}

function updateCharts() {
    turnLabels.push(currentTurn.toString());
    budgetData.push(project.budget);
    qualityData.push(project.quality);

    const maxBudget = project.originalBudget;
    const svgWidth = 400, svgHeight = 200, padding = 40;
    const xScale = (svgWidth - padding * 2) / (turnLabels.length - 1);
    const yScaleBudget = (svgHeight - padding * 2) / maxBudget;
    const yScaleQuality = (svgHeight - padding * 2) / 100;

    const budgetSvg = document.getElementById('budgetChartSvg');
    budgetSvg.innerHTML = `<text x="180" y="20" text-anchor="middle">Budget (€)</text>`;
    let budgetPath = `M${padding},${svgHeight - padding - budgetData[0] * yScaleBudget}`;
    for (let i = 1; i < budgetData.length; i++) {
        budgetPath += ` L${padding + i * xScale},${svgHeight - padding - budgetData[i] * yScaleBudget}`;
    }
    const budgetLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    budgetLine.setAttribute("d", budgetPath);
    budgetLine.setAttribute("stroke", "rgba(75, 192, 192, 1)");
    budgetLine.setAttribute("fill", "none");
    budgetSvg.appendChild(budgetLine);

    const qualitySvg = document.getElementById('qualityChartSvg');
    qualitySvg.innerHTML = `<text x="180" y="20" text-anchor="middle">Quality (%)</text>`;
    let qualityPath = `M${padding},${svgHeight - padding - qualityData[0] * yScaleQuality}`;
    for (let i = 1; i < qualityData.length; i++) {
        qualityPath += ` L${padding + i * xScale},${svgHeight - padding - qualityData[i] * yScaleQuality}`;
    }
    const qualityLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    qualityLine.setAttribute("d", qualityPath);
    qualityLine.setAttribute("stroke", "rgba(255, 99, 132, 1)");
    qualityLine.setAttribute("fill", "none");
    qualitySvg.appendChild(qualityLine);
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
    let csvContent = "Turn,Risk,Response,Cost Impact (€),Quality (%)\n";
    performanceLog.forEach(entry => {
        csvContent += `${entry.turn},${entry.risk},${entry.response},${entry.costImpact},${entry.quality}\n`;
    });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `performance_log_${timestamp}.csv`;
    link.click();
}

function setupHelpModal() {
    var modal = document.getElementById('helpModal');
    var btn = document.getElementById('helpButton');
    var span = document.getElementsByClassName('close')[0];
    btn.onclick = function() { modal.style.display = "block"; };
    span.onclick = function() { modal.style.display = "none"; };
    window.onclick = function(event) {
        if (event.target == modal) modal.style.display = "none";
    };
}

function goBack() {
    if (document.getElementById('setup').classList.contains('hidden')) {
        alert("Cannot go back during gameplay.");
    } else {
        window.location.reload();
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

    document.getElementById('finalResult').classList.add('hidden');
    document.getElementById('setup').classList.remove('hidden');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('simulation').classList.add('hidden');
    document.getElementById('backButtonSetup').disabled = false;
    document.getElementById('projectName').value = "";
    document.getElementById('projectBudget').value = "100";
    document.getElementById('projectDuration').value = "24";
    document.getElementById('riskContingencyPercentage').value = "10";
    document.getElementById('exportButton').classList.add('hidden');
    setDefaultProjectName();
    updateBaselineCost();
}