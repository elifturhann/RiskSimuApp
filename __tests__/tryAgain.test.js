//tryagain.test.js

test('tryAgain resets project and UI elements', () => {
    // Mock elements
    document.body.innerHTML = `
      <div id="finalResult" class="">
        <div class="classListMock"></div>
      </div>
      <div id="setup" class="hidden"></div>
      <div id="game" class=""></div>
      <div id="simulation" class=""></div>
      <button id="gameBackButton"></button>
      <input id="projectName" value="Test Name" />
      <input id="simulatorName" value="Tester" />
      <input id="projectBudget" value="999" />
      <input id="projectDuration" value="99" />
      <input id="riskContingencyPercentage" value="99" />
      <div id="exportButton" class=""></div>
    `;
  
    // Mock project and globals
    global.project = { test: 123 };
    global.risks = ['test'];
    global.currentTurn = 5;
    global.gameOver = true;
    global.budgetData = [1];
    global.qualityData = [1];
    global.turnLabels = ['turn'];
    global.currentRiskEvent = { test: true };
    global.performanceLog = ['log'];
    global.budgetChartInstance = { destroy: jest.fn() };
    global.qualityChartInstance = { destroy: jest.fn() };
    global.setDefaultProjectName = jest.fn();
    global.updateBaselineCost = jest.fn();
  
    
    const el = id => document.getElementById(id).classList = {
      add: jest.fn(),
      remove: jest.fn()
    };
    el('finalResult');
    el('setup');
    el('game');
    el('simulation');
    el('exportButton');
  
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
      document.getElementById('projectBudget').value = "100";
      document.getElementById('projectDuration').value = "24";
      document.getElementById('riskContingencyPercentage').value = "10";
      document.getElementById('exportButton').classList.add('hidden');
      setDefaultProjectName();
      updateBaselineCost();
    }
  
    tryAgain();
  

    expect(project).toEqual({});
    expect(risks).toEqual([]);
    expect(currentTurn).toBe(0);
    expect(gameOver).toBe(false);
    expect(budgetData).toEqual([]);
    expect(qualityData).toEqual([]);
    expect(turnLabels).toEqual([]);
    expect(currentRiskEvent).toBe(null);
    expect(performanceLog).toEqual([]);
    expect(budgetChartInstance.destroy).toHaveBeenCalled();
    expect(qualityChartInstance.destroy).toHaveBeenCalled();
  
    expect(document.getElementById('gameBackButton').disabled).toBe(true);
    expect(document.getElementById('projectName').value).toBe("");
    expect(document.getElementById('simulatorName').value).toBe("");
    expect(document.getElementById('projectBudget').value).toBe("100");
    expect(document.getElementById('projectDuration').value).toBe("24");
    expect(document.getElementById('riskContingencyPercentage').value).toBe("10");
  });
  