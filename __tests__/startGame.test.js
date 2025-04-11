// startGame.test.js

describe('startGame Function', () => {
  // Mock DOM elements
  document.body.innerHTML = `
    <div id="setup"></div>
    <div id="game" class="hidden"></div>
    <button id="gameBackButton" disabled style="display: none;"></button>
    <button id="exportButton" class="hidden"></button>
    
    <input id="projectName" type="text">
    <input id="simulatorName" type="text">
    <input id="projectBudget" type="number">
    <input id="projectDuration" type="number">
    <input id="baselineCost" type="number">
    <input id="riskContingencyPercentage" type="number">
  `;

  // Mock global variables and functions
  global.project = {};
  global.risks = [];
  
  // Mock SweetAlert
  global.Swal = {
    fire: jest.fn()
  };
  
  // Mock functions
  global.formatDate = jest.fn().mockReturnValue("2025-04-11");
  global.formatTime = jest.fn().mockReturnValue("14:30");
  global.generateCheatRisks = jest.fn().mockImplementation(() => {
    risks = [{name: "Risk 1"}, {name: "Risk 2"}, {name: "Risk 3"}];
  });
  global.updateRiskTable = jest.fn();
  
  function startGame() {
    let projectNameInput = document.getElementById('projectName');
    let simulatorNameInput = document.getElementById('simulatorName');
    let projectBudget = document.getElementById('projectBudget');
    let projectDuration = document.getElementById('projectDuration');
    let baselineCostPerTurn = document.getElementById('baselineCost');
    let riskContingencyPercentage = document.getElementById('riskContingencyPercentage');
    
    let projectNameValue = projectNameInput.value.trim().toLowerCase();
    let simulatorNameValue = simulatorNameInput.value.trim();
    let projectBudgetValue = parseFloat(projectBudget.value) * 1000;
    let projectDurationValue = parseInt(projectDuration.value);
    let baselineCostPerTurnValue = parseFloat(baselineCostPerTurn.value) * 1000;
    let riskContingencyPercentageValue = parseFloat(riskContingencyPercentage.value);
    
    if (projectNameValue === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...,Error',
        text: 'Please enter a project name.',
      });
      return;
    }
    
    if (simulatorNameValue === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...,Error',
        text: 'Please enter your name.',
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    document.getElementById('setup').classList.remove('hidden');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('gameBackButton').disabled = true;
    document.getElementById('gameBackButton').style.display = 'none';
    document.getElementById('exportButton').classList.add('hidden');
    
    global.project = {};
    global.risks = [];
  });

  test('should show error when project name is empty', () => {
    document.getElementById('projectName').value = '';
    document.getElementById('simulatorName').value = 'Test Simulator';
    document.getElementById('projectBudget').value = '100';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    startGame();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Oops...,Error',
      text: 'Please enter a project name.',
    });
    
    expect(document.getElementById('setup').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('game').classList.contains('hidden')).toBe(true);
  });

  test('should show error when simulator name is empty', () => {
    document.getElementById('projectName').value = 'Test Project';
    document.getElementById('simulatorName').value = '';
    document.getElementById('projectBudget').value = '100';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    startGame();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Oops...,Error',
      text: 'Please enter your name.',
    });
    
    expect(document.getElementById('setup').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('game').classList.contains('hidden')).toBe(true);
  });

  test('should show error when project budget is invalid', () => {
    document.getElementById('projectName').value = 'Test Project';
    document.getElementById('simulatorName').value = 'Test Simulator';
    document.getElementById('projectBudget').value = '-10';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    startGame();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Invalid Input',
      text: 'Invalid Project Budget. Please enter a positive number.',
    });
    
    expect(document.getElementById('setup').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('game').classList.contains('hidden')).toBe(true);
  });

  test('should create project and start game with valid inputs', () => {
    document.getElementById('projectName').value = 'Test Project';
    document.getElementById('simulatorName').value = 'Test Simulator';
    document.getElementById('projectBudget').value = '100';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    startGame();
    
    expect(project).toEqual({
      name: 'test project',
      simulatorName: 'Test Simulator',
      budget: 100000,
      originalBudget: 100000,
      riskContingencyBudget: 10000,
      originalRiskContingencyBudget: 10000,
      baselineCostPerTurn: 5000,
      duration: 10,
      originalDuration: 10,
      quality: 100
    });
    
    expect(document.getElementById('setup').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('game').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('gameBackButton').disabled).toBe(false);
    expect(document.getElementById('gameBackButton').style.display).toBe('inline-block');
    
    expect(updateRiskTable).toHaveBeenCalled();
  });

  test('should handle special project name "tv" or "risk"', () => {
    document.getElementById('projectName').value = 'tv';
    document.getElementById('simulatorName').value = 'Test Simulator';
    document.getElementById('projectBudget').value = '100';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    startGame();
    
    expect(project.name).toBe('Demo 2025-04-11 14:30');
    
    expect(formatDate).toHaveBeenCalled();
    expect(formatTime).toHaveBeenCalled();
    
    expect(generateCheatRisks).toHaveBeenCalled();
  });

  test('should show exportButton when risks.length >= 3', () => {
    document.getElementById('projectName').value = 'Test Project';
    document.getElementById('simulatorName').value = 'Test Simulator';
    document.getElementById('projectBudget').value = '100';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    global.risks = [
      { name: 'Risk 1' },
      { name: 'Risk 2' },
      { name: 'Risk 3' }
    ];
    
    startGame();
    
    expect(document.getElementById('exportButton').classList.contains('hidden')).toBe(false);
  });

  test('should not show exportButton when risks.length < 3', () => {
    document.getElementById('projectName').value = 'Test Project';
    document.getElementById('simulatorName').value = 'Test Simulator';
    document.getElementById('projectBudget').value = '100';
    document.getElementById('projectDuration').value = '10';
    document.getElementById('baselineCost').value = '5';
    document.getElementById('riskContingencyPercentage').value = '10';
    
    global.risks = [
      { name: 'Risk 1' },
      { name: 'Risk 2' }
    ];
    
    startGame();
    
    expect(document.getElementById('exportButton').classList.contains('hidden')).toBe(true);
  });
});