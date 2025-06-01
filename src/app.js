import { calculateInHandSalary } from "./inHandCalcLogic.js";

// DOM Elements
const ctcInput = document.getElementById("ctc");
const minSalaryElement = document.getElementById("min-salary");
const maxSalaryElement = document.getElementById("max-salary");
const currentCtcInput = document.getElementById("current-ctc");
const expectedCtcInput = document.getElementById("expected-ctc");
const hikePercentageElement = document.getElementById("hike-percentage");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const currentMonthlyInput = document.getElementById("current-monthly");
const expectedMonthlyInput = document.getElementById("expected-monthly");

// New DOM elements for Hike Estimation tab
const estimationCurrentCtcInput = document.getElementById("estimation-current-ctc");
const hikePercentageInput = document.getElementById("hike-percentage-input");
const expectedCtcAfterHikeElement = document.getElementById("expected-ctc-after-hike");

// Format currency in INR
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format large numbers with commas for Indian numbering system
function formatNumber(num) {
  return new Intl.NumberFormat("en-IN").format(num);
}

// Process and calculate salary
function calculateSalary(ctc) {
  if (!ctc || isNaN(ctc) || ctc <= 0) {
    updateUI({
      range_5: 0,
      max_in_hand: 0,
      breakdown: {},
    });
    return;
  }

  const result = calculateInHandSalary(Number(ctc));
  updateUI(result);
}

var salaryChart;

// Generate chart data points
function generateChartData(currentCtc = 0) {
  const dataPoints = [];
  const minValues = [];
  const maxValues = [];

  // Generate data points from 0 to 80 lakhs
  const maxRange = Math.max(8000000);
  let ctc = 0;
  while (ctc <= maxRange) {
    if (ctc === 0) {
      dataPoints.push(0);
      minValues.push(0);
      maxValues.push(0);
    } else {
      const result = calculateInHandSalary(ctc);
      dataPoints.push(Math.round(ctc / 100000)); // Convert to lakhs for x-axis
      minValues.push(Math.round(result.range_5)); // Keep actual values for y-axis
      maxValues.push(Math.round(result.max_in_hand)); // Keep actual values for y-axis
    }
    ctc += 100000; // Increase by 1 lakh per data point
  }

  return { dataPoints, minValues, maxValues };
}

// Initialize or update the chart
function updateChart(currentCtc = 0) {
  const chartContainer = document.getElementById("apex-curved-line-charts");
  if (!chartContainer) return;

  const { dataPoints, minValues, maxValues } = generateChartData(currentCtc);

  const options = {
    chart: {
      height: 400,
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true,
      },
    },
    series: [
      {
        name: "Min Monthly In-Hand",
        data: minValues,
      },
      {
        name: "Max Monthly In-Hand",
        data: maxValues,
      },
    ],
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
    },
    xaxis: {
      categories: dataPoints,
      tickAmount: 8, // Limit to show only 8 ticks
      title: {
        text: "Annual CTC in Lakhs",
      },
    },
    yaxis: {
      title: {
        text: "Monthly In-Hand (₹)",
      },
    },
    tooltip: {
      shared: true,
    },
  };

  if (salaryChart) {
    salaryChart.destroy();
  }

  salaryChart = new ApexCharts(chartContainer, options);
  salaryChart.render();
}

// Update the UI with calculation results
function updateUI(result) {
  // Update salary amounts
  minSalaryElement.textContent = formatCurrency(result.range_5 || 0);
  maxSalaryElement.textContent = formatCurrency(result.max_in_hand || 0);
}

// Calculate hike percentage
function calculateHike() {
  const currentCtc = parseFloat(currentCtcInput.value.replace(/,/g, "")) || 0;
  const expectedCtc = parseFloat(expectedCtcInput.value.replace(/,/g, "")) || 0;
  
  if (currentCtc <= 0 || expectedCtc <= 0) {
    hikePercentageElement.textContent = "0%";
    return;
  }
  
  const hikePercentage = ((expectedCtc - currentCtc) / currentCtc) * 100;
  hikePercentageElement.textContent = hikePercentage.toFixed(2) + "%";
}

// Calculate expected CTC based on current CTC and hike percentage
function calculateExpectedCtc() {
  const currentCtc = parseFloat(estimationCurrentCtcInput.value.replace(/,/g, "")) || 0;
  const hikePercentage = parseFloat(hikePercentageInput.value.replace(/,/g, "")) || 0;
  
  if (currentCtc <= 0 || hikePercentage < 0) {
    expectedCtcAfterHikeElement.textContent = "₹ 0";
    return;
  }
  
  const expectedCtc = currentCtc * (1 + hikePercentage / 100);
  expectedCtcAfterHikeElement.textContent = formatCurrency(expectedCtc);
}

// Handle tab switching
function setupTabs() {
  // Apply initial styles to all buttons
  tabButtons.forEach(button => {
    // Default style for inactive buttons
    if (!button.getAttribute('data-tab').includes("inhand-calc")) {
      button.classList.add("bg-blue-100", "text-blue-800", "hover:bg-blue-200");
    } else {
      // First tab is active by default
      button.classList.add("active", "bg-blue-600", "text-white", "hover:bg-blue-700");
    }
    
    button.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Remove active styles from all tab buttons and hide all tab contents
      tabButtons.forEach(btn => {
        btn.classList.remove("active");
        btn.classList.remove("bg-blue-600", "text-white", "hover:bg-blue-700");
        btn.classList.add("bg-blue-100", "text-blue-800", "hover:bg-blue-200");
      });
      
      tabContents.forEach(content => {
        content.classList.add("hidden");
        content.classList.remove("block");
      });
      
      // Add active style to clicked button and show associated tab content
      button.classList.add("active");
      button.classList.remove("bg-blue-100", "text-blue-800", "hover:bg-blue-200");
      button.classList.add("bg-blue-600", "text-white", "hover:bg-blue-700");
      
      const tabId = button.getAttribute("data-tab");
      const activeContent = document.getElementById(tabId);
      activeContent.classList.remove("hidden");
      activeContent.classList.add("block");
    });
  });
}

// Format input with commas for readability
function setupInputFormatting(inputElement) {
  
  inputElement.addEventListener("input", function(e) {
    // Remove any non-numeric characters except commas
    let value = e.target.value.replace(/[^0-9,]/g, "");

    // Format the number with commas for readability
    const numOnly = value.replace(/,/g, "");
    if (numOnly) {
      try {
        value = formatNumber(parseInt(numOnly, 10));
      } catch (err) {
        // If parsing fails, keep the current value
      }
    }

    e.target.value = value;
  });

  // Return the numeric value without commas
  return inputElement.value.replace(/,/g, "");
}

// Synchronize monthly and yearly values
function syncMonthlyYearly(monthlyInput, yearlyInput, isMonthlyToYearly) {
  const value = parseFloat(monthlyInput.value.replace(/,/g, "")) || 0;
  const synced = isMonthlyToYearly ? value * 12 : value / 12;
  
  if (value > 0) {
    yearlyInput.value = formatNumber(Math.round(synced));
  }
}

// Input validation - allow only numbers and basic formatting
ctcInput.addEventListener("input", function(e) {
  const numOnly = setupInputFormatting(this);
  calculateSalary(numOnly);
});

// Setup event listeners for hike calculator
currentCtcInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  syncMonthlyYearly(this, currentMonthlyInput, false);
  calculateHike();
});

currentMonthlyInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  syncMonthlyYearly(this, currentCtcInput, true);
  calculateHike();
});

expectedCtcInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  syncMonthlyYearly(this, expectedMonthlyInput, false);
  calculateHike();
});

expectedMonthlyInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  syncMonthlyYearly(this, expectedCtcInput, true);
  calculateHike();
});

// Setup event listeners for hike estimation tab
estimationCurrentCtcInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  calculateExpectedCtc();
});

hikePercentageInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  calculateExpectedCtc();
});

// Initialize the UI
window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  calculateSalary(0);
  updateChart(0);
  // Apply initial active styles to the first tab
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab) {
    activeTab.classList.remove("bg-blue-600"); // Remove default blue color
    activeTab.classList.add("bg-blue-600", "text-white", "hover:bg-blue-700");
  }
  setupInputFormatting(ctcInput);
  setupInputFormatting(currentCtcInput);
  setupInputFormatting(expectedCtcInput);
  setupInputFormatting(currentMonthlyInput);
  setupInputFormatting(expectedMonthlyInput);
  setupInputFormatting(estimationCurrentCtcInput);
  setupInputFormatting(hikePercentageInput);
});
