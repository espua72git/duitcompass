const monthIndex = (value) => { const [year, month] = value.split('-').map(Number); return year * 12 + month - 1; };

export function estimateEpf({ balances, salary, raise, raiseMonth, dividend, start, birth, extraSavings = [] }) {
  const first = monthIndex(start);
  const retirement = monthIndex(birth) + 60 * 12;
  if (retirement < first) throw new Error('The retirement month must be on or after the starting month.');
  if (retirement - first > 60 * 12) throw new Error('The starting month cannot be before the birth month.');
  if (extraSavings.some((item) => item.frequency === 'once' && (monthIndex(item.date) < first || monthIndex(item.date) > retirement))) throw new Error('A one-time extra saving falls outside the projection period. Change or remove the entry.');
  let accountBalances = [...balances];
  let pending = [0, 0, 0];
  let currentSalary = salary;
  let contributions = 0;
  let dividends = 0;
  let extraTotal = 0;
  const annualExtra = new Map();
  let firstFebruary = true;
  const rows = [];
  for (let index = first; index <= retirement; index++) {
    const month = index % 12 + 1;
    const year = Math.floor(index / 12);
    if (index > first && month === raiseMonth) currentSalary *= 1 + raise / 100;
    pending = pending.map((amount, i) => amount + accountBalances[i] * dividend / 100 / 12);
    const contribution = currentSalary * 0.23;
    const date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
    const extra = extraSavings.reduce((sum, item) => sum + (item.frequency === 'monthly' || (item.frequency === 'quarterly' && [1, 4, 7, 10].includes(month)) || (item.frequency === 'once' && item.date === date) ? item.amount : 0), 0);
    const yearExtra = (annualExtra.get(year) || 0) + extra;
    if (yearExtra > 100000 + 1e-7) throw new Error(`Extra savings exceed RM 100,000 in ${year}. Reduce or remove an entry before calculating.`);
    annualExtra.set(year, yearExtra);
    const credited = month === 2
      ? firstFebruary
        ? balances.map((amount, i) => (amount + salary * 0.23 * [0.75, 0.15, 0.10][i]) * dividend / 100)
        : [...pending]
      : [0, 0, 0];
    if (month === 2) { pending = [0, 0, 0]; firstFebruary = false; }
    accountBalances = accountBalances.map((amount, i) => amount + (contribution + extra) * [0.75, 0.15, 0.10][i] + credited[i]);
    const credit = credited.reduce((a, b) => a + b, 0);
    contributions += contribution;
    extraTotal += extra;
    dividends += credit;
    rows.push({ date, salary: currentSalary, employee: currentSalary * 0.11, employer: currentSalary * 0.12, contribution, extra, dividend: credit, balances: [...accountBalances], total: accountBalances.reduce((a, b) => a + b, 0) });
  }
  return { rows, contributions, extraTotal, dividends, pending: pending.reduce((a, b) => a + b, 0), balances: accountBalances, total: accountBalances.reduce((a, b) => a + b, 0), retirement: rows[rows.length - 1].date };
}
