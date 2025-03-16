export function calculateInHandSalary(curr_ctc_data_value) {
  let annual_grat_data_value = 0; // Annual Gratuity
  let yearly_all_data_value = 0; // Other Annual Allowance

  let var_component_data_value = 0; // Variable Component
  let invAmount_data_value = 0; // Basic Pay
  let annualHRA = 0; // Annual HRA
  let monthly_rent_data_value = 0; // Monthly Rent

  let epfvaluemonthly = 1; // 1 for minimim 1800, 12 for 12% of basic pay
  let taxRegime = 1; // 0 for old, 1 for new
  let cityType = 1; // 1 for metro, 2 for non-metro

  var yearlyInvestmentLimit = 225000;

  var basicSalaryElem = curr_ctc_data_value,
    basicSalaryPerc,
    variableComponent,
    basicPay,
    inHandSalary,
    salary_mode = "monthly",
    monthlyRent,
    houseRentAllowance,
    annualGrat,
    otherYearlyAllow,
    totalWorkedCompanyYears = 1,
    professionalTax = 2400,
    epfCalcValueYearly,
    epfCompanyCalcValueYearly,
    gratuityCalc,
    hraValue,
    grossSalary,
    nontaxable,
    healthCass,
    taxableIncome,
    chart,
    standardDeduction_oldTaxRegime = 50000,
    standardDeduction_newTaxRegime = 75000,
    totalTaxLiability,
    incomeTax,
    no_tax,
    slabe1_tax,
    slabe2_tax;

  var CITY_TYPE = { METRO: { id: 1 }, NON_METRO: { id: 2 } };

  var newRegimeTaxSlabs = [
    {
      minIncome: 0,
      maxIncome: 300000,
      taxPercentage: 0,
    },
    {
      minIncome: 300000,
      maxIncome: 700000,
      taxPercentage: 0.05,
    },
    {
      minIncome: 700000,
      maxIncome: 1000000,
      taxPercentage: 0.1,
    },
    {
      minIncome: 1000000,
      maxIncome: 1200000,
      taxPercentage: 0.15,
    },
    {
      minIncome: 1200000,
      maxIncome: 1500000,
      taxPercentage: 0.2,
    },
    {
      minIncome: 1500000,
      maxIncome: Infinity,
      taxPercentage: 0.3,
    },
  ];

  var oldRegimeTaxSlabs = [
    {
      minIncome: 0,
      maxIncome: 250000,
      taxPercentage: 0,
    },
    {
      minIncome: 250000,
      maxIncome: 500000,
      taxPercentage: 0.05,
    },
    {
      minIncome: 500000,
      maxIncome: 1000000,
      taxPercentage: 0.2,
    },
    {
      minIncome: 1000000,
      maxIncome: Infinity,
      taxPercentage: 0.3,
    },
  ];

  function grossSalaryformula(
    basicSalaryElem,
    epfCompanyCalcValueYearly,
    gratuityCalc,
    otherYearlyAllow
  ) {
    var grossSalary =
      basicSalaryElem -
      epfCompanyCalcValueYearly -
      gratuityCalc -
      variableComponent;
    return grossSalary;
  }

  function grossSalaryformula(
    basicSalaryElem,
    epfCompanyCalcValueYearly,
    gratuityCalc,
    otherYearlyAllow
  ) {
    var grossSalary =
      basicSalaryElem -
      epfCompanyCalcValueYearly -
      gratuityCalc -
      otherYearlyAllow;
    return grossSalary;
  }

  function hraValueformula(basicPay) {
    var hraValue = (basicPay * 30) / 100;
    return hraValue;
  }

  function nontaxableformula(otherYearlyAllow) {
    var nontaxable = otherYearlyAllow;
    return nontaxable;
  }

  function calculateTax(income, taxSlabs) {
    var taxPayable = 0;

    for (var curBracket of taxSlabs) {
      if (income <= curBracket.maxIncome) {
        taxPayable =
          taxPayable +
          (income - curBracket.minIncome) * curBracket.taxPercentage;
        return taxPayable;
      } else {
        taxPayable =
          taxPayable +
          (curBracket.maxIncome - curBracket.minIncome) *
            curBracket.taxPercentage;
      }
    }
  }

  function updateResult() {
    basicSalaryElem = curr_ctc_data_value;
    variableComponent = var_component_data_value;
    basicPay = invAmount_data_value;
    monthlyRent = monthly_rent_data_value * 12;
    annualGrat = annual_grat_data_value;
    otherYearlyAllow = yearly_all_data_value;

    var epfChecked = epfvaluemonthly;
    if (epfChecked == 12) {
      epfCalcValueYearly = (basicPay / 100) * 12;
    } else {
      epfCalcValueYearly = 1800 * 12;
    }

    epfCompanyCalcValueYearly = 2 * epfCalcValueYearly;

    gratuityCalc = annualGrat;

    hraValue = annualHRA ? annualHRA : hraValueformula(basicPay);

    grossSalary = grossSalaryformula(
      basicSalaryElem,
      epfCalcValueYearly,
      gratuityCalc,
      otherYearlyAllow
    );

    nontaxable = nontaxableformula(otherYearlyAllow);

    var taxRegimeChecked = taxRegime;

    let yearlyInvValue = 0; // for new regime

    yearlyInvValue =
      yearlyInvValue > yearlyInvestmentLimit
        ? yearlyInvestmentLimit
        : yearlyInvValue;

    var yearlyRent = monthlyRent * 12;
    var rentMinus10Basic = yearlyRent - 0.1 * basicPay;

    let cityTypeBasic;
    let hraExeptionValue;
    let healthCess;

    let city_type = cityType;
    if (city_type == CITY_TYPE.METRO.id) cityTypeBasic = 0.5 * basicPay;
    else cityTypeBasic = 0.4 * basicPay;

    if (yearlyRent > 0) {
      hraExeptionValue =
        hraValue < rentMinus10Basic
          ? hraValue < cityTypeBasic
            ? hraValue
            : cityTypeBasic
          : rentMinus10Basic < cityTypeBasic
          ? rentMinus10Basic
          : cityTypeBasic;
      hraExeptionValue = hraExeptionValue < 0 ? 0 : hraExeptionValue;
    } else hraExeptionValue = 0;

    taxableIncome =
      grossSalary -
      epfCalcValueYearly -
      hraExeptionValue -
      yearlyInvValue -
      nontaxable -
      (taxRegimeChecked == "0"
        ? standardDeduction_oldTaxRegime
        : standardDeduction_newTaxRegime);

    incomeTax =
      taxRegimeChecked == 1
        ? taxableIncome <= 700000
          ? calculateTax(taxableIncome, newRegimeTaxSlabs) - 25000
          : calculateTax(taxableIncome, newRegimeTaxSlabs)
        : calculateTax(taxableIncome, oldRegimeTaxSlabs);
    incomeTax = incomeTax > 0 ? incomeTax : 0;
    healthCess = (incomeTax * 4) / 100;
    totalTaxLiability = incomeTax + healthCess;

    inHandSalary =
      grossSalary - totalTaxLiability - epfCalcValueYearly - professionalTax;
  }
  updateResult();
  return {
    range_5: (inHandSalary / 12) * 0.95,
    max_in_hand: inHandSalary / 12,
  };
}
