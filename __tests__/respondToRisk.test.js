// respondToRisk.test.js

describe('respondToRisk Function', () => {
    // Mock DOM elements
    document.body.innerHTML = `
      <select id="riskResponse">
        <option value="">Select Response</option>
        <option value="Mitigate">Mitigate</option>
        <option value="Avoid">Avoid</option>
        <option value="Transfer">Transfer</option>
        <option value="Accept">Accept</option>
      </select>
      <div id="riskEvent"></div>
      <button id="nextTurnButton" disabled></button>
    `;
  
    // Mock global variables
    global.currentRiskEvent = {
      name: 'Server Outage',
      impact: 4,
      minCost: 20000,
      costPercentage: 10
    };
    
    global.project = {
      originalBudget: 500000,
      budget: 400000,
      riskContingencyBudget: 50000,
      originalDuration: 10,
      duration: 10,
      quality: 100
    };
    
    global.currentTurn = 3;
    global.performanceLog = [];

    global.Swal = {
      fire: jest.fn()
    };
    
    // Mock functions
    global.updateProjectStatus = jest.fn();
    global.updateCharts = jest.fn();
    global.checkWinCondition = jest.fn();
  
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
        quality: project.quality
      });
  
      document.getElementById('riskEvent').classList.add('hidden');
      document.getElementById('nextTurnButton').disabled = false;
      updateProjectStatus();
      updateCharts();
      checkWinCondition();
    }
  
    beforeEach(() => {
      jest.clearAllMocks();
      
      document.getElementById('riskResponse').value = '';
      document.getElementById('riskEvent').classList.remove('hidden');
      document.getElementById('nextTurnButton').disabled = true;
      
      global.currentRiskEvent = {
        name: 'Server Outage',
        impact: 4,
        minCost: 20000,
        costPercentage: 10
      };
      
      global.project = {
        originalBudget: 500000,
        budget: 400000,
        riskContingencyBudget: 50000,
        originalDuration: 10,
        duration: 10,
        quality: 100
      };
      
      global.currentTurn = 3;
      global.performanceLog = [];
    });
  
    test('should show error when no response is selected', () => {
      document.getElementById('riskResponse').value = '';
      
      respondToRisk();
      
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'No Action Selected',
        text: 'Please select a risk response action.',
      });
      
      expect(project.budget).toBe(400000);
      expect(project.riskContingencyBudget).toBe(50000);
      expect(project.duration).toBe(10);
      expect(project.quality).toBe(100);
      expect(performanceLog.length).toBe(0);
      expect(document.getElementById('riskEvent').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('nextTurnButton').disabled).toBe(true);
    });
  
    test('should handle Mitigate response correctly', () => {
      document.getElementById('riskResponse').value = 'Mitigate';
      
      respondToRisk();
      
      const costImpact = Math.max(20000, 50000) * 0.5; // 50000 * 0.5 = 25000
      const timeImpact = 4 * 0.02 * 10 * 0.5; // 0.4 turns
      
      expect(project.riskContingencyBudget).toBe(50000 - 25000);
      expect(project.budget).toBe(400000);
      
      expect(project.duration).toBeCloseTo(10 + 0.4);
      
      expect(project.quality).toBe(100 - (4 * 2));
      
      expect(performanceLog.length).toBe(1);
      expect(performanceLog[0].risk).toBe('Server Outage');
      expect(performanceLog[0].response).toBe('Mitigate');
      expect(performanceLog[0].costImpact).toBe(25000);
      
      expect(document.getElementById('riskEvent').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('nextTurnButton').disabled).toBe(false);
      
      expect(updateProjectStatus).toHaveBeenCalled();
      expect(updateCharts).toHaveBeenCalled();
      expect(checkWinCondition).toHaveBeenCalled();
    });
  
    test('should handle Avoid response correctly', () => {
      document.getElementById('riskResponse').value = 'Avoid';
      
      respondToRisk();
      
      const costImpact = Math.max(20000, 50000) * 0.75; // 50000 * 0.75 = 37500
      const timeImpact = 4 * 0.02 * 10 * 0.75; // 0.6 turns
      
      expect(project.riskContingencyBudget).toBe(50000 - 37500);
      expect(project.budget).toBe(400000);
      
      expect(project.duration).toBeCloseTo(10 + 0.6);
      
      expect(project.quality).toBe(100 - (4 * 2));
    });
  
    test('should handle Transfer response correctly', () => {
      document.getElementById('riskResponse').value = 'Transfer';
      
      respondToRisk();
      
      const costImpact = Math.max(20000, 50000) * 0.25; // 50000 * 0.25 = 12500
      const timeImpact = 4 * 0.02 * 10 * 0.25; // 0.2 turns
      
      expect(project.riskContingencyBudget).toBe(50000 - 12500);
      expect(project.budget).toBe(400000);
      
      expect(project.duration).toBeCloseTo(10 + 0.2);
    });
  
    test('should handle Accept response correctly', () => {
      document.getElementById('riskResponse').value = 'Accept';
      
      respondToRisk();
      
      const costImpact = Math.max(20000, 50000); // 50000
      const timeImpact = 4 * 0.02 * 10; // 0.8 turns
      
      expect(project.riskContingencyBudget).toBe(0);
      expect(project.budget).toBe(400000 - (50000 - 50000));
      
      expect(project.duration).toBeCloseTo(10 + 0.8);
    });
  
    test('should handle cost deduction from main budget when contingency is insufficient', () => {
      project.riskContingencyBudget = 10000;
      
      document.getElementById('riskResponse').value = 'Accept';
      
      respondToRisk();
      
      const costImpact = Math.max(20000, 50000); // 50000
      const remainingCost = costImpact - 10000; // 40000
      
      expect(project.riskContingencyBudget).toBe(0);
      expect(project.budget).toBe(400000 - remainingCost);
    });
  
    test('should handle risk with higher minCost than percentage cost', () => {
      global.currentRiskEvent = {
        name: 'Critical Failure',
        impact: 5,
        minCost: 100000,
        costPercentage: 5 // 5% of 500000 = 25000
      };
      
      document.getElementById('riskResponse').value = 'Mitigate';
      
      respondToRisk();
      
      const costImpact = Math.max(100000, 25000) * 0.5; // 100000 * 0.5 = 50000
      
      expect(project.riskContingencyBudget).toBe(0);
      expect(project.budget).toBe(400000 - (50000 - 50000));
    });
  
    test('should add correct entry to performanceLog', () => {
      document.getElementById('riskResponse').value = 'Transfer';
      
      respondToRisk();
      
      const costImpact = Math.max(20000, 50000) * 0.25; // 50000 * 0.25 = 12500
      
      expect(performanceLog.length).toBe(1);
      expect(performanceLog[0]).toEqual({
        turn: 3,
        risk: 'Server Outage',
        response: 'Transfer',
        costImpact: 12500,
        quality: 92
      });
    });
  });