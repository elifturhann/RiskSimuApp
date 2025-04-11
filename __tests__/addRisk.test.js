// addRisk.test.js


document.body.innerHTML = `
  <input id="riskName" type="text">
  <select id="riskType">
    <option value="Technical">Technical</option>
  </select>
  <input id="likelihood" type="number">
  <input id="impact" type="number">
  <input id="minCost" type="number">
  <input id="costPercentage" type="number">
  <textarea id="riskResponseDescription"></textarea>
  <button id="exportButton" class="hidden"></button>
`;

// Mock global variables and functions
global.risks = [];
global.updateRiskTable = jest.fn();
global.getRiskLevel = jest.fn(score => {
  if (score <= 5) return 'Low';
  if (score <= 15) return 'Medium';
  return 'High';
});

global.Swal = {
  fire: jest.fn()
};

function addRisk() {
  if (risks.length >= 5) {
    Swal.fire({
      icon: 'warning',
      title: 'Limit Reached',
      text: 'Maximum of 5 risks reached!',
    });
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
    Swal.fire({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please enter a risk name.',
    });
    return;
  }
  if (riskResponseDescription.trim() === "") {
    Swal.fire({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please enter a risk response description.',
    });
    return;
  }
  if (isNaN(likelihood) || likelihood <= 0 || likelihood > 5) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the risk likelihood.It must be between 1 and 5.',
    });
    return;
  }
  if (isNaN(impact) || impact <= 0 || impact > 5) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the impact level.It must be between 1 and 5.',
    });
    return;
  }
  if (isNaN(minCost) || minCost <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the Minimum Cost if Occurs.',
    });
    return;
  }

  if (isNaN(costPercentage) || costPercentage <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the Cost as % of Budget.',
    });
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

  if (risks.length >= 3) {
    document.getElementById('exportButton').classList.remove('hidden');
  }
}

describe('addRisk Function', () => {
  
  beforeEach(() => {
   
    global.risks = [];
    
   
    jest.clearAllMocks();
    
    
    document.getElementById('riskName').value = 'Test Risk';
    document.getElementById('riskType').value = 'Technical';
    document.getElementById('likelihood').value = '3';
    document.getElementById('impact').value = '4';
    document.getElementById('minCost').value = '10000';
    document.getElementById('costPercentage').value = '10';
    document.getElementById('riskResponseDescription').value = 'This is a test response';
  });

  test('should add a valid risk to the risks array', () => {
    
    addRisk();
    
    
    expect(risks.length).toBe(1);
    expect(risks[0]).toEqual({
      name: 'Test Risk',
      type: 'Technical',
      likelihood: 3,
      impact: 4,
      minCost: 10000,
      costPercentage: 10,
      score: 12,
      level: 'Medium',
      occurred: false,
      responseDescription: 'This is a test response'
    });
    
    // Check if updateRiskTable was called
    expect(updateRiskTable).toHaveBeenCalled();
    
    
    expect(document.getElementById('riskName').value).toBe("");
    expect(document.getElementById('minCost').value).toBe("5000");
    expect(document.getElementById('costPercentage').value).toBe("5");
    expect(document.getElementById('riskResponseDescription').value).toBe("");
  });

  test('should validate risk name is not empty', () => {
    document.getElementById('riskName').value = '';
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please enter a risk name.',
    });
    
    expect(risks.length).toBe(0);
  });

  test('should validate risk response description is not empty', () => {
    document.getElementById('riskResponseDescription').value = '  '; 
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please enter a risk response description.',
    });
    
    expect(risks.length).toBe(0);
  });

  test('should validate likelihood is between 1 and 5', () => {
    document.getElementById('likelihood').value = '6'; 
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the risk likelihood.It must be between 1 and 5.',
    });
    
    expect(risks.length).toBe(0);
  });

  test('should validate impact is between 1 and 5', () => {
    document.getElementById('impact').value = '0'; 
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the impact level.It must be between 1 and 5.',
    });
    
    expect(risks.length).toBe(0);
  });

  test('should validate minimum cost is positive', () => {
    document.getElementById('minCost').value = '-100';
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the Minimum Cost if Occurs.',
    });
    
    expect(risks.length).toBe(0);
  });

  test('should validate cost percentage is positive', () => {
    document.getElementById('costPercentage').value = '0';
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'Missing Input',
      text: 'Please specify the Cost as % of Budget.',
    });
    
    expect(risks.length).toBe(0);
  });

  test('should limit to maximum 5 risks', () => {
    // Setup with 5 risks already in the array
    global.risks = [{}, {}, {}, {}, {}];
    
    addRisk();
    
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: 'warning',
      title: 'Limit Reached',
      text: 'Maximum of 5 risks reached!',
    });
    
    
    expect(risks.length).toBe(5);
  });

  test('should show export button when at least 3 risks are added', () => {
    // Setup with 2 risks already in the array
    global.risks = [{}, {}];
    
    addRisk();
    
    
    expect(risks.length).toBe(3);
    
   
    expect(document.getElementById('exportButton').classList.contains('hidden')).toBe(false);
  });
});