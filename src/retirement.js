const monthIndex = (value) => { const [year, month] = value.split('-').map(Number); return year * 12 + month - 1; };
const monthString = (index) => `${String(Math.floor(index / 12)).padStart(4, '0')}-${String(index % 12 + 1).padStart(2, '0')}`;

export function retirementStart(birth) {
  return monthString(monthIndex(birth) + 60 * 12);
}

export function estimateRetirement({ birth, start, fund, expense, interestRate, inflationRate, annuity, allocations = [] }) {
  const birthIndex = monthIndex(birth), first = monthIndex(start), last = birthIndex + 120 * 12;
  if (first < birthIndex || first > last) throw new Error('Starting month must be between the birth month and the month you reach age 120.');
  if (allocations.some((item) => item.frequency === 'once' && (monthIndex(item.date) < first || monthIndex(item.date) > last))) throw new Error('An allocation payment month is outside the projection period. Change or remove the entry.');
  const recurringStart = first % 12 === 0 ? first : first + 12 - first % 12;
  let balance = fund, monthlyExpense = expense, totalAnnuity = 0, totalInterest = 0, totalSpent = 0, totalAllocationPaid = 0;
  const rows = [];
  for (let index = first; index <= last; index++) {
    const opening = balance;
    let interest = 0;
    if (index > first && index % 12 === 0) {
      monthlyExpense *= 1 + inflationRate / 100;
      interest = opening * interestRate / 100;
    }
    const available = opening + interest + annuity;
    const spent = Math.min(available, monthlyExpense);
    const month = index % 12 + 1;
    const date = monthString(index);
    let availableForAllocations = available - spent;
    const items = allocations.filter((item) => item.frequency === 'once' ? item.date === date : index >= recurringStart && index < recurringStart + item.years * 12 && (item.frequency === 'monthly' || (item.frequency === 'quarterly' && [1, 4, 7, 10].includes(month)) || (item.frequency === 'yearly' && month === 1))).map((item) => {
      const amount = item.frequency === 'once' ? item.amount : item.amount * (1 + inflationRate / 100) ** Math.floor((index - recurringStart) / 12);
      const paid = Math.min(availableForAllocations, amount);
      availableForAllocations -= paid;
      return { name: item.name, amount, paid, shortfall: amount - paid };
    });
    const allocation = items.reduce((sum, item) => sum + item.amount, 0);
    const allocationPaid = items.reduce((sum, item) => sum + item.paid, 0);
    balance = Math.max(0, availableForAllocations);
    totalAnnuity += annuity;
    totalInterest += interest;
    totalSpent += spent + allocationPaid;
    totalAllocationPaid += allocationPaid;
    rows.push({ date, opening, annuity, interest, expense: monthlyExpense, spent, shortfall: monthlyExpense - spent, allocation, allocationPaid, allocationShortfall: allocation - allocationPaid, allocationItems: items, balance });
    if (balance <= 0) break;
  }
  const finalIndex = first + rows.length - 1;
  return { rows, totalAnnuity, totalInterest, totalSpent, totalAllocationPaid, totalFunds: fund + totalAnnuity + totalInterest, depleted: balance <= 0, finalDate: monthString(finalIndex), ageYears: Math.floor((finalIndex - birthIndex) / 12), ageMonths: (finalIndex - birthIndex) % 12 };
}
