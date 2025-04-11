// initializeChart.test.js

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

describe('initializeCharts', () => {
    // Setup variables
    let mockBudgetCtx, mockQualityCtx, mockChartInstance;
    
    beforeEach(() => {
      // Mock project object
      global.project = {
        budget: 1000,
        quality: 80,
        originalBudget: 1500
      };
      
      // Mock global chart data arrays
      global.budgetData = [];
      global.qualityData = [];
      global.turnLabels = [];
      global.budgetChartInstance = null;
      global.qualityChartInstance = null;
      
      // Mock DOM elements
      mockBudgetCtx = {
        getContext: jest.fn().mockReturnValue('2d-budget-context')
      };
      
      mockQualityCtx = {
        getContext: jest.fn().mockReturnValue('2d-quality-context')
      };
      
      document.getElementById = jest.fn(id => {
        if (id === 'budgetChart') return mockBudgetCtx;
        if (id === 'qualityChart') return mockQualityCtx;
        return null;
      });
      
      // Mock Chart constructor
      mockChartInstance = {};
      global.Chart = jest.fn().mockImplementation((ctx, config) => {
        return mockChartInstance;
      });
    });
    
    afterEach(() => {
      jest.resetAllMocks();
      delete global.project;
      delete global.budgetData;
      delete global.qualityData;
      delete global.turnLabels;
      delete global.budgetChartInstance;
      delete global.qualityChartInstance;
      delete global.Chart;
    });
    
    test('initializes budgetData with project.budget', () => {
      initializeCharts();
      expect(budgetData).toEqual([1000]);
    });
    
    test('initializes qualityData with project.quality', () => {
      initializeCharts();
      expect(qualityData).toEqual([80]);
    });
    
    test('initializes turnLabels with ["0"]', () => {
      initializeCharts();
      expect(turnLabels).toEqual(["0"]);
    });
    
    test('gets 2d context for both canvas elements', () => {
      initializeCharts();
      expect(document.getElementById).toHaveBeenCalledWith('budgetChart');
      expect(document.getElementById).toHaveBeenCalledWith('qualityChart');
      expect(mockBudgetCtx.getContext).toHaveBeenCalledWith('2d');
      expect(mockQualityCtx.getContext).toHaveBeenCalledWith('2d');
    });
    
    test('creates a new Chart instance for budget chart with correct config', () => {
      initializeCharts();
      
      expect(Chart).toHaveBeenCalledTimes(2);
      const budgetCallArgs = Chart.mock.calls[0];
      
      expect(budgetCallArgs[0]).toBe('2d-budget-context');
      expect(budgetCallArgs[1].type).toBe('line');
      expect(budgetCallArgs[1].data.labels).toBe(turnLabels);
      expect(budgetCallArgs[1].data.datasets[0].label).toBe('Budget (€)');
      expect(budgetCallArgs[1].data.datasets[0].data).toBe(budgetData);
      expect(budgetCallArgs[1].data.datasets[0].borderColor).toBe('rgba(75, 192, 192, 1)');
      expect(budgetCallArgs[1].data.datasets[0].fill).toBe(false);
      expect(budgetCallArgs[1].options.scales.y.beginAtZero).toBe(true);
      expect(budgetCallArgs[1].options.scales.y.max).toBe(1500);
    });
    
    test('creates a new Chart instance for quality chart with correct config', () => {
      initializeCharts();
      
      const qualityCallArgs = Chart.mock.calls[1];
      
      expect(qualityCallArgs[0]).toBe('2d-quality-context');
      expect(qualityCallArgs[1].type).toBe('line');
      expect(qualityCallArgs[1].data.labels).toBe(turnLabels);
      expect(qualityCallArgs[1].data.datasets[0].label).toBe('Quality (%)');
      expect(qualityCallArgs[1].data.datasets[0].data).toBe(qualityData);
      expect(qualityCallArgs[1].data.datasets[0].borderColor).toBe('rgba(255, 99, 132, 1)');
      expect(qualityCallArgs[1].data.datasets[0].fill).toBe(false);
      expect(qualityCallArgs[1].options.scales.y.beginAtZero).toBe(true);
      expect(qualityCallArgs[1].options.scales.y.max).toBe(100);
    });
    
    test('assigns chart instances to global variables', () => {
      initializeCharts();
      expect(budgetChartInstance).toBe(mockChartInstance);
      expect(qualityChartInstance).toBe(mockChartInstance);
    });
    
    test('handles the case when project has different values', () => {
      project.budget = 2000;
      project.quality = 90;
      project.originalBudget = 3000;
      
      initializeCharts();
      
      expect(budgetData).toEqual([2000]);
      expect(qualityData).toEqual([90]);
      
      const budgetCallArgs = Chart.mock.calls[0];
      expect(budgetCallArgs[1].options.scales.y.max).toBe(3000);
    });
  });