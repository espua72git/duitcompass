export function calculateHirePurchase({ amount, years, rate }) {
  const months = years * 12;
  const interest = amount * rate / 100 * years;
  const total = amount + interest;
  const monthly = total / months;
  const rows = Array.from({ length: months }, (_, i) => {
    const count = i + 1;
    const principalPaid = amount * count / months;
    const cumulativePayment = total * count / months;
    const previousPrincipal = amount * i / months;
    const previousPayment = total * i / months;
    const principal = principalPaid - previousPrincipal;
    const payment = cumulativePayment - previousPayment;
    return { month: count, payment, principal, interest: payment - principal, cumulativePayment, balance: Math.max(0, amount - principalPaid) };
  });
  return { interest, total, monthly, rows };
}
