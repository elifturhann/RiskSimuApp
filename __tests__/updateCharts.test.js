//updateCharts.test.js

describe('updateCharts', () => {
    // Mock global variables and Chart instances
    let turnLabels, budgetData, qualityData, project;
    let budgetChartInstance, qualityChartInstance;
    let currentTurn;
  
    const mockChartUpdate = jest.fn();
  
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
  
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Test data
      turnLabels = ['1', '2'];
      budgetData = [10000, 9500];
      qualityData = [100, 95];
      currentTurn = 3;
      project = {
        budget: 9000,
        quality: 90
      };
  
      budgetChartInstance = {
        data: {
          labels: [...turnLabels],
          datasets: [{ data: [...budgetData] }]
        },
        update: mockChartUpdate
      };
  
      qualityChartInstance = {
        data: {
          labels: [...turnLabels],
          datasets: [{ data: [...qualityData] }]
        },
        update: mockChartUpdate
      };
    });
  
    test('should update all chart data and labels correctly', () => {
      updateCharts();
  
      expect(turnLabels).toEqual(['1', '2', '3']);
      
      expect(budgetData).toEqual([10000, 9500, 9000]);
      expect(budgetChartInstance.data.labels).toEqual(['1', '2', '3']);
      expect(budgetChartInstance.data.datasets[0].data).toEqual([10000, 9500, 9000]);
      
      expect(qualityData).toEqual([100, 95, 90]);
      expect(qualityChartInstance.data.labels).toEqual(['1', '2', '3']);
      expect(qualityChartInstance.data.datasets[0].data).toEqual([100, 95, 90]);
      
      expect(mockChartUpdate).toHaveBeenCalledTimes(2);
    });
  
    test('should handle empty initial arrays correctly', () => {
      turnLabels = [];
      budgetData = [];
      qualityData = [];
      currentTurn = 1;
      project.budget = 10000;
      project.quality = 100;
  
      updateCharts();
  
      expect(turnLabels).toEqual(['1']);
      expect(budgetData).toEqual([10000]);
      expect(qualityData).toEqual([100]);
    });
  
    test('should update chart instances with correct data structure', () => {
      updateCharts();
  
      expect(budgetChartInstance.data).toEqual({
        labels: ['1', '2', '3'],
        datasets: [{
          data: [10000, 9500, 9000]
        }]
      });
  
      expect(qualityChartInstance.data).toEqual({
        labels: ['1', '2', '3'],
        datasets: [{
          data: [100, 95, 90]
        }]
      });
    });
  });