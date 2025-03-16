import { calculateInHandSalary } from "./inHandCalcLogic.js";

// DOM Elements
const ctcInput = document.getElementById("ctc");
const minSalaryElement = document.getElementById("min-salary");
const maxSalaryElement = document.getElementById("max-salary");

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

// Input validation - allow only numbers and basic formatting
ctcInput.addEventListener("input", function (e) {
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
  calculateSalary(numOnly);
});

// Initialize the UI
window.addEventListener("DOMContentLoaded", () => {
  calculateSalary(0);
});
