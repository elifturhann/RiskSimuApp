// checkForRiskEvent.test.js

describe('checkForRiskEvent', () => {
    function checkForRiskEvent(risks) {
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
  
    const originalMathRandom = Math.random;
  
    afterEach(() => {
      Math.random = originalMathRandom;
    });
  
    it('should trigger a risk event if Math.random < probability', () => {
      const risks = [
        { name: 'Server Down', likelihood: 4, occurred: false },
        { name: 'Data Breach', likelihood: 2, occurred: false }
      ];
  
      Math.random = jest.fn(() => 0.2);
  
      const result = checkForRiskEvent(risks);
  
      expect(result).not.toBeNull();
      expect(result.occurred).toBe(true);
    });
  
    it('should return null if Math.random > all risk probabilities', () => {
      const risks = [
        { name: 'Power Cut', likelihood: 1, occurred: false },
        { name: 'Overheating', likelihood: 1, occurred: false }
      ];
  
      Math.random = jest.fn(() => 0.9); 
  
      const result = checkForRiskEvent(risks);
  
      expect(result).toBeNull();
      expect(risks.every(r => !r.occurred)).toBe(true);
    });
  });
  