// nextTurn.test.js

describe('nextTurn Function', () => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="riskEvent" class="hidden"></div>
      <div id="riskEventDescription"></div>
      <button id="nextTurnButton"></button>
    `;
  
    // Mock global variables
    global.gameOver = false;
    global.currentTurn = 0;
    global.project = {
      budget: 100000,
      baselineCostPerTurn: 5000,
      duration: 10
    };
    global.currentRiskEvent = null;
  
    // Mock functions
    global.checkForRiskEvent = jest.fn();
    global.updateProjectStatus = jest.fn();
    global.updateCharts = jest.fn();
    global.checkWinCondition = jest.fn();

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
        updateProjectStatus();
        updateCharts();
        checkWinCondition();
      }
    }
  
    beforeEach(() => {
      jest.clearAllMocks();
      global.gameOver = false;
      global.currentTurn = 0;
      global.project = {
        budget: 100000,
        baselineCostPerTurn: 5000,
        duration: 10
      };
      global.currentRiskEvent = null;
      
      
      document.getElementById('riskEvent').classList.add('hidden');
      document.getElementById('riskEventDescription').innerHTML = '';
      document.getElementById('nextTurnButton').disabled = false;
    });
  
    test('should do nothing if gameOver is true', () => {
      global.gameOver = true;
      
      nextTurn();
      
      expect(global.currentTurn).toBe(0);
      expect(checkWinCondition).not.toHaveBeenCalled();
      expect(global.project.budget).toBe(100000);
    });
  
    test('should check win condition if currentTurn exceeds project duration', () => {
      global.currentTurn = 10;
      
      nextTurn();
      
      expect(global.currentTurn).toBe(11);
      expect(checkWinCondition).toHaveBeenCalled();
      
      expect(global.project.budget).toBe(100000);
      expect(checkForRiskEvent).not.toHaveBeenCalled();
      expect(updateProjectStatus).not.toHaveBeenCalled();
      expect(updateCharts).not.toHaveBeenCalled();
    });
  
    test('should reduce budget by baselineCostPerTurn', () => {

      nextTurn();
      
      expect(global.project.budget).toBe(95000);
    });
  
    test('should handle risk event when one occurs', () => {
      const mockRiskEvent = {
        name: 'Server Outage',
        type: 'Technical',
        likelihood: 3,
        impact: 4,
        minCost: 15000,
        costPercentage: 15,
        responseDescription: 'Implement backup servers'
      };
      
      checkForRiskEvent.mockReturnValue(mockRiskEvent);
      
      nextTurn();
      
      expect(document.getElementById('riskEvent').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('riskEventDescription').innerHTML).toContain('Server Outage');
      expect(document.getElementById('riskEventDescription').innerHTML).toContain('Technical');
      expect(document.getElementById('nextTurnButton').disabled).toBe(true);
      expect(global.currentRiskEvent).toBe(mockRiskEvent);
      
      expect(updateProjectStatus).not.toHaveBeenCalled();
      expect(updateCharts).not.toHaveBeenCalled();
      expect(checkWinCondition).not.toHaveBeenCalled();
    });
  
    test('should proceed normally when no risk event occurs', () => {
      checkForRiskEvent.mockReturnValue(null);
      
      nextTurn();
      
      expect(updateProjectStatus).toHaveBeenCalled();
      expect(updateCharts).toHaveBeenCalled();
      expect(checkWinCondition).toHaveBeenCalled();
      
      expect(document.getElementById('riskEvent').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('riskEventDescription').innerHTML).toBe('');
      expect(document.getElementById('nextTurnButton').disabled).toBe(false);
      expect(global.currentRiskEvent).toBe(null);
    });
  
    test('should increment turn counter', () => {
      nextTurn();
      
      expect(global.currentTurn).toBe(1);
    });
  
    test('should properly format currency in risk event description', () => {
      const mockRiskEvent = {
        name: 'Major Delay',
        type: 'Schedule',
        likelihood: 2,
        impact: 5,
        minCost: 1250000,
        costPercentage: 25,
        responseDescription: 'Hire additional contractors'
      };
      
      checkForRiskEvent.mockReturnValue(mockRiskEvent);
      
      nextTurn();
      
      expect(document.getElementById('riskEventDescription').innerHTML).toContain('€1,250,000');
    });
  });