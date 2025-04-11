//grading.test.js

describe('calculateFinalScore & getGrade', () => {
  let project;

  beforeEach(() => {
    project = {
      budget: 5000,
      originalBudget: 10000,
      riskContingencyBudget: 2000,
      originalRiskContingencyBudget: 4000,
      quality: 90
    };

    global.project = project;
  });

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
    else if (score >= 55) return "3 (Satisfactory)";
    else if (score >= 35) return "2 (Needs Improvement)";
    else if (score >= 15) return "1 (Poor)";
    else return "0 (Fail)";
  }

  test('calculateFinalScore should compute weighted average correctly', () => {
    const score = calculateFinalScore(); // (50 * 0.4) + (90 * 0.4) + (50 * 0.2) = 66
    expect(score).toBe(66);
  });

  test('calculateFinalScore should cap score at 100', () => {
    project.budget = 20000;
    project.riskContingencyBudget = 8000;
    project.quality = 120;
    const score = calculateFinalScore();
    expect(score).toBe(100);
  });

  test('getGrade should return "5 (Excellent)" for 90+', () => {
    expect(getGrade(95)).toBe("5 (Excellent)");
  });

  test('getGrade should return "4 (Good)" for 75-89', () => {
    expect(getGrade(80)).toBe("4 (Good)");
  });

  test('getGrade should return "3 (Satisfactory)" for 55-74', () => {
    expect(getGrade(60)).toBe("3 (Satisfactory)");
  });

  test('getGrade should return "2 (Needs Improvement)" for 35-54', () => {
    expect(getGrade(45)).toBe("2 (Needs Improvement)");
  });

  test('getGrade should return "1 (Poor)" for 15-34', () => {
    expect(getGrade(20)).toBe("1 (Poor)");
  });

  test('getGrade should return "0 (Fail)" for below 15', () => {
    expect(getGrade(10)).toBe("0 (Fail)");
  });
});
