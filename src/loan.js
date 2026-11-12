export function calculateLoan({ balance, rate, years, payment, extra, mode, oneTimePayments = [] }) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const regular = mode === 'new'
    ? monthlyRate === 0 ? balance / months : balance * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months))
    : payment;

  function schedule(additional, oneTime = []) {
    let outstanding = balance;
    let cumulativePayment = 0;
    const rows = [];
    const payments = new Map(oneTime.map((item) => [item.month, item.amount]));
    const lastOneTimeMonth = oneTime.reduce((last, item) => Math.max(last, item.month), 0);
    for (let month = 1; outstanding > 0.000001 && month <= 12000; month++) {
      const interest = outstanding * monthlyRate;
      const selectedExtra = payments.has(month) ? payments.get(month) : additional;
      if (!Number.isFinite(outstanding) || regular + selectedExtra < interest || (month > lastOneTimeMonth && regular + additional <= interest)) return null;
      const basePayment = Math.min(regular, outstanding + interest);
      const extraCash = Math.min(selectedExtra, Math.max(0, outstanding + interest - basePayment));
      const principal = Math.max(0, basePayment - interest);
      const extraPayment = Math.max(0, extraCash - Math.max(0, interest - basePayment));
      outstanding = Math.max(0, outstanding + interest - basePayment - extraCash);
      cumulativePayment += basePayment + extraCash;
      rows.push({ month, payment: basePayment + extraCash, cumulativePayment, interest, principal, extra: extraPayment, extraCash, balance: outstanding });
    }
    return outstanding > 0.000001 ? null : rows;
  }

  const rows = schedule(extra, oneTimePayments);
  if (!rows) throw new Error('The total monthly payment must be enough to pay off the loan. Increase the payment or extra payment.');
  const baseline = extra || oneTimePayments.length ? schedule(0) : rows;
  const sum = (list, key) => list.reduce((total, row) => total + row[key], 0);
  const interest = sum(rows, 'interest');
  return { rows, regular, interest, total: sum(rows, 'payment'), extraTotal: sum(rows, 'extraCash'), savings: baseline ? Math.max(0, sum(baseline, 'interest') - interest) : null, baselineMonths: baseline?.length };
}
