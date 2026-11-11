export function analyzeBuyRent({ price, renovation, acquisition, margin, years, rate, rent, maintenance, operating, tax, rentIncrement = 0, rentEvery = 1, inflation = 0, inflationEvery = 1 }) {
  const loan = price * margin / 100;
  const initialCash = price - loan + renovation + acquisition;
  const propertyCost = price + renovation + acquisition;
  const monthlyRate = rate / 1200;
  const months = years * 12;
  const monthlyPayment = loan === 0 ? 0 : monthlyRate === 0 ? loan / months : loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  let balance = loan, cumulative = 0;
  const rows = [];
  for (let year = 1; year <= 25; year++) {
    const annualRent = (rent + rentIncrement * Math.floor((year - 1) / rentEvery)) * 12;
    const annualOperating = (maintenance * 12 + operating) * (1 + inflation / 100) ** Math.floor((year - 1) / inflationEvery);
    const noi = annualRent - annualOperating;
    let debtService = 0, interest = 0, principal = 0;
    for (let month = 0; month < 12 && balance > 0.000001; month++) {
      const monthInterest = balance * monthlyRate;
      const payment = Math.min(monthlyPayment, balance + monthInterest);
      const principalPaid = payment - monthInterest;
      balance = Math.max(0, balance - principalPaid);
      debtService += payment;
      interest += monthInterest;
      principal += principalPaid;
    }
    const cashFlow = noi - debtService - tax;
    cumulative += cashFlow;
    rows.push({ year, rent: annualRent, operating: annualOperating, noi, debtService, interest, principal, tax, cashFlow, cumulative, balance });
  }
  const first = rows[0];
  return { loan, initialCash, propertyCost, monthlyPayment, noi: first.noi, annualRent: first.rent, annualOperating: first.operating, breakEven: (first.operating + first.debtService + tax) / 12, cashOnCash: initialCash > 0 ? first.cashFlow / initialCash : null, netYield: propertyCost > 0 ? first.noi / propertyCost : null, dscr: first.debtService > 0 ? first.noi / first.debtService : null, rows };
}
