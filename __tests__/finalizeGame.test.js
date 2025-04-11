// finalizeGame.test.js

describe('finalizeGame', () => {
    // Define mock project and other global functions
    let project;
    let performanceLog;
  
    beforeEach(() => {
      global.calculateFinalScore = jest.fn(() => 88);
      global.getGrade = jest.fn(() => 'A');
  
      project = {
        name: 'SkiMaster 3000',
        simulatorName: 'Anna',
        budget: 4000,
        originalBudget: 10000,
        riskContingencyBudget: 1000,
        originalRiskContingencyBudget: 2000,
        quality: 91
      };
  
      performanceLog = [
        { turn: 1, risk: "Avalanche", response: "Evacuate", costImpact: 500, quality: 89 },
        { turn: 2, risk: "Lift Failure", response: "Repair", costImpact: 700, quality: 91 }
      ];
  
      global.project = project;
      global.performanceLog = performanceLog;
  
      document.body.innerHTML = `
        <div id="simulation" class=""></div>
        <div id="finalResult" class="hidden"></div>
      `;
    });
  
    function finalizeGame(isSuccess) {
      document.getElementById('simulation').classList.add('hidden');
      let finalScore = calculateFinalScore();
      let grade = getGrade(finalScore);
      let budgetRemaining = (project.budget / project.originalBudget) * 100;
      let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;
  
      let finalInfo = `
        <div class="table-row">
          <span class="label">Final Budget:</span>
          <span class="value">€${project.budget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} (${budgetRemaining.toFixed(2)}%)</span>
        </div>
        <div class="table-row">
          <span class="label">Final Contingency:</span>
          <span class="value">€${project.riskContingencyBudget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} (${riskContingencyRemaining.toFixed(2)}%)</span>
        </div>
        <div class="table-row">
          <span class="label">Final Quality:</span>
          <span class="value">${project.quality}%</span>
        </div>
      `;
  
      let message = isSuccess
        ? `<h2>Congratulations! Project Completed</h2><p>You delivered the project successfully.</p><img src="https://media0.giphy.com/media/hcnh1VGMNW3Sb8c5aX/giphy.gif" alt="Success">`
        : `<h2>Game Over: Project Failed</h2><p>${project.budget <= 0 ? "Out of budget" : "Quality too low"}</p><img src="https://media1.giphy.com/media/BGlGy3pD9THOFVzdtf/giphy.gif" class='result-img' alt="Failure">`;
  
      let logHtml = "<h3>Performance Log</h3><div class='performance-log-container'><ul class='performance-log'>";
      performanceLog.forEach(entry => {
        logHtml += `<li>Turn ${entry.turn}: Risk "${entry.risk}" - Response: ${entry.response} - Cost: €${entry.costImpact.toLocaleString()} - Quality: ${entry.quality}%</li>`;
      });
      logHtml += "</ul></div>";
  
      document.getElementById('finalResult').innerHTML = `
        <h1 class="result-title">Simulation Results</h1>
        <div class="result-names">
          <p class="big-name">
            <span class="label-text">Project: </span>
            <span class="value-text">${project.name}</span>
          </p>
          <p class="big-name">
            <span class="label-text">Managed by: </span>
            <span class="value-text">${project.simulatorName}</span>
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
  
    test('should show success message with correct score and grade', () => {
      finalizeGame(true);
  
      const resultHTML = document.getElementById('finalResult').innerHTML;
  
      expect(resultHTML).toContain('Congratulations! Project Completed');
      expect(resultHTML).toContain('88%');
      expect(resultHTML).toContain('Grade: A');
      expect(resultHTML).toContain('SkiMaster 3000');
    });
  
    test('should show failure message when budget is zero', () => {
      project.budget = 0;
      finalizeGame(false);
  
      const resultHTML = document.getElementById('finalResult').innerHTML;
  
      expect(resultHTML).toContain('Game Over: Project Failed');
      expect(resultHTML).toContain('Out of budget');
    });
  });
  