//exportlog.test.js

// Mock the necessary browser APIs
document.createElement = jest.fn();
URL.createObjectURL = jest.fn();

describe('exportPerformanceLog Function', () => {
  // Define the global performanceLog variable that the function depends on
  let performanceLog;
  
  // Link mock with click method
  const mockLink = {
    href: '',
    download: '',
    click: jest.fn()
  };
  
  // Mock Blob
  const mockBlob = {};
  global.Blob = jest.fn(() => mockBlob);
  
  beforeEach(() => {
    jest.clearAllMocks();
   
    document.createElement.mockReturnValue(mockLink);
    
    URL.createObjectURL.mockReturnValue('blob:fake-url');
    
    const mockDate = new Date(2025, 3, 10, 15, 30, 0); // April 10, 2025, 15:30:00
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    performanceLog = [
      { turn: 1, risk: "Server Outage", response: "Backup System", costImpact: 5000, quality: 95 },
      { turn: 2, risk: "Data Breach", response: "Security Protocol", costImpact: 12000, quality: 88 }
    ];
    
    global.performanceLog = performanceLog;
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function exportPerformanceLog() {
    let csvContent = "Turn,Risk,Response,Cost Impact (€),Quality (%)\n";
    performanceLog.forEach(entry => {
        csvContent += `${entry.turn},${entry.risk},${entry.response},${entry.costImpact},${entry.quality}\n`;
    });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `performance_log_${timestamp}UTC.csv`; // Time is in UTC (Finland is UTC+3)
    link.click();
  }

  test('should generate CSV content from performance log data', () => {
    exportPerformanceLog();
    const expectedCSVContent = "Turn,Risk,Response,Cost Impact (€),Quality (%)\n" +
      "1,Server Outage,Backup System,5000,95\n" +
      "2,Data Breach,Security Protocol,12000,88\n";
    
    expect(Blob).toHaveBeenCalledWith(
      [expectedCSVContent], 
      { type: "text/csv;charset=utf-8;" }
    );
  });

  test('should create a download link with the correct attributes', () => {
    exportPerformanceLog();
    
    expect(document.createElement).toHaveBeenCalledWith('a');
    
    expect(mockLink.href).toBe('blob:fake-url');
    
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  test('should set the correct filename with timestamp', () => {

    exportPerformanceLog();
    
    const expectedFilename = 'performance_log_2025-04-10-12-30-00UTC.csv';
    
    expect(mockLink.download).toBe(expectedFilename);
  });

  test('should trigger the download by calling click()', () => {
    exportPerformanceLog();
  
    expect(mockLink.click).toHaveBeenCalled();
  });
});