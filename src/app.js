import { calculateInHandSalary } from "./inHandCalcLogic.js";

// DOM Elements
const ctcInput = document.getElementById("ctc");
const minSalaryElement = document.getElementById("min-salary");
const maxSalaryElement = document.getElementById("max-salary");
const currentCtcInput = document.getElementById("current-ctc");
const expectedCtcInput = document.getElementById("expected-ctc");
const hikePercentageElement = document.getElementById("hike-percentage");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

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

// Handle tab switching
function setupTabs() {
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));
      
      // Add active class to current tab
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
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

// Input validation - allow only numbers and basic formatting
ctcInput.addEventListener("input", function(e) {
  const numOnly = setupInputFormatting(this);
  calculateSalary(numOnly);
});

// Setup event listeners for hike calculator
currentCtcInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  calculateHike();
});

expectedCtcInput.addEventListener("input", function(e) {
  setupInputFormatting(this);
  calculateHike();
});

// Initialize the UI
window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  calculateSalary(0);
  setupInputFormatting(ctcInput);
  setupInputFormatting(currentCtcInput);
  setupInputFormatting(expectedCtcInput);
});
