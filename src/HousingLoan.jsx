import React, { useState } from 'react';
import { calculateLoan } from './loan';

const money = (value) => `RM ${value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const duration = (months) => `${Math.floor(months / 12)} years ${months % 12} months`;
const currentMonth = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; };
const scheduleMonth = (start, index) => { const [year, month] = start.split('-').map(Number); const date = new Date(0); date.setFullYear(year, month - 1 + index, 1); return date.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' }); };
const monthIndex = (value) => { const [year, month] = value.split('-').map(Number); return year * 12 + month - 1; };

function PaymentChart({ rows, startMonth, balance }) {
  const [monthly, setMonthly] = useState(false);
  const data = monthly ? rows : Array.from({ length: Math.ceil(rows.length / 12) }, (_, i) => {
    const group = rows.slice(i * 12, i * 12 + 12);
    return { ...group.reduce((a, r) => ({ interest: a.interest + r.interest, principal: a.principal + r.principal, extra: a.extra + r.extra }), { interest: 0, principal: 0, extra: 0 }), month: group[group.length - 1].month, balance: group[group.length - 1].balance, cumulativePayment: group[group.length - 1].cumulativePayment };
  });
  const niceMax = (value) => { const magnitude = 10 ** Math.floor(Math.log10(value)); return Math.ceil(value / magnitude) * magnitude; };
  const paymentMax = niceMax(data.reduce((max, r) => Math.max(max, r.interest + r.principal + r.extra), 0));
  const balanceMax = niceMax(balance);
  const width = Math.max(500, data.length * 64);
  const slot = width / data.length;
  const height = 220;
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const axisValue = (value) => value.toLocaleString('en-MY', { maximumFractionDigits: 0 });
  const points = data.map((r, i) => `${(i + 0.5) * slot},${height * (1 - r.balance / balanceMax)}`).join(' ');
  return <div className="loan-panel"><div className="chart-heading"><div><h2>Payment breakdown</h2><p>Principal, interest and extra payments by {monthly ? 'month' : 'year'}.</p></div><button type="button" className="chart-toggle" onClick={() => setMonthly(!monthly)}>Show {monthly ? 'annual' : 'monthly'} chart</button></div>
    <div className="legend"><span><i className="principal-color" />Principal</span><span><i className="interest-color" />Interest</span><span><i className="extra-color" />Extra towards principal</span><span><i className="balance-color" />Outstanding balance</span></div>
    <div className="axis-headings"><span>Payment (RM)</span><span>Outstanding balance (RM)</span></div>
    <div className="dual-chart"><div className="chart-axis" aria-hidden="true">{ticks.map((tick) => <span key={tick}>{axisValue(paymentMax * tick)}</span>)}</div><div className="chart-scroll" tabIndex="0" aria-label="Scrollable payment and outstanding balance chart"><svg width={width} height={height + 35} role="img" aria-label={`${monthly ? 'Monthly' : 'Annual'} payments and outstanding balance. Exact values are available in the monthly schedule below.`}>
      {ticks.map((tick) => <line key={tick} x1="0" x2={width} y1={height * (1 - tick)} y2={height * (1 - tick)} stroke="#e4eae2" />)}
      {data.map((r, i) => { const x = i * slot + slot * 0.25; const barWidth = slot * 0.5; let y = height; return <g key={i}><title>{`${scheduleMonth(startMonth, r.month - 1)}: ${monthly ? 'Monthly payment' : 'Period payment'} ${money(r.interest + r.principal + r.extra)}, Total payment ${money(r.cumulativePayment)}, principal ${money(r.principal)}, interest ${money(r.interest)}, extra to principal ${money(r.extra)}, outstanding ${money(r.balance)}`}</title>{[[r.principal, '#315d49'], [r.extra, '#a9c8a7'], [r.interest, '#d7a57d']].map(([value, color]) => { const h = value / paymentMax * height; y -= h; return <rect key={color} x={x} y={y} width={barWidth} height={h} fill={color} />; })}<text x={(i + 0.5) * slot} y={height + 20} textAnchor="middle" fill="#718078" fontSize="10">{scheduleMonth(startMonth, r.month - 1).replace(' ', '-').replace(/-(\d+)$/, (_, year) => '-' + year.slice(-2).padStart(2, '0'))}</text></g>; })}
      <polyline points={points} fill="none" stroke="#506fa2" strokeWidth="2.5" strokeLinejoin="round" /><circle cx={(data.length - 0.5) * slot} cy={height * (1 - data[data.length - 1].balance / balanceMax)} r="3" fill="#506fa2" />
    </svg></div><div className="chart-axis chart-axis-right" aria-hidden="true">{ticks.map((tick) => <span key={tick}>{axisValue(balanceMax * tick)}</span>)}</div></div><p className="chart-caption">{monthly ? 'Monthly payments' : '12-month periods, labelled by their final month'} · Hover over a bar for amounts. Scroll horizontally to see more.</p>
  </div>;
}

function SummaryChart({ balance, result }) {
  const saving = result.savings || 0;
  const total = balance + result.interest + saving;
  const principalEnd = balance / total * 100;
  const interestEnd = (balance + result.interest) / total * 100;
  return <div className="loan-panel"><h2>Loan cost at a glance</h2><p>{result.savings === null ? 'Interest savings cannot be calculated because the regular payment alone would not pay off the loan.' : 'Compared with the total cost without extra payments.'}</p><div className="donut-layout"><div className="donut" role="img" aria-label={`Principal ${money(balance)}, interest ${money(result.interest)}, interest saved ${result.savings === null ? 'unavailable' : money(saving)}`} style={{ background: `conic-gradient(#315d49 0 ${principalEnd}%, #d7a57d ${principalEnd}% ${interestEnd}%, #a9c8a7 ${interestEnd}% 100%)` }}><div>LOAN<br />COST</div></div><div className="donut-legend"><span><i className="principal-color" />Principal <strong>{money(balance)}</strong></span><span><i className="interest-color" />Interest paid <strong>{money(result.interest)}</strong></span><span><i className="extra-color" />Interest saved <strong>{result.savings === null ? 'Unavailable' : money(saving)}</strong></span></div></div></div>;
}

export default function HousingLoan({ onBack }) {
  const [mode, setMode] = useState('new');
  const [fields, setFields] = useState({ balance: '', years: '', rate: '', payment: '', extra: '0' });
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [oneTimePayments, setOneTimePayments] = useState([]);
  const [oneTimeAmount, setOneTimeAmount] = useState('');
  const [oneTimeDate, setOneTimeDate] = useState('');
  const [oneTimeError, setOneTimeError] = useState('');
  const update = (event) => setFields({ ...fields, [event.target.name]: event.target.value });
  function addOneTime() {
    const amount = Number(oneTimeAmount), date = oneTimeDate || startMonth;
    if (!oneTimeAmount || !Number.isFinite(amount) || amount <= 0 || amount > 1e12 || !/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) { setOneTimeError('Enter a payment amount greater than zero up to RM 1 trillion and a valid payment month.'); return; }
    if (oneTimePayments.some((item) => item.date === date)) { setOneTimeError('A one-time extra payment already exists for this month. The duplicate was not added.'); return; }
    if (monthIndex(date) < monthIndex(startMonth)) { setOneTimeError('The payment month cannot be before the loan starting date.'); return; }
    setOneTimePayments([...oneTimePayments, { date, amount }]);
    setOneTimeAmount(''); setOneTimeDate(''); setOneTimeError(''); setError(''); setResult(null);
  }
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, Number(value)]));
    if (!fields.balance || !fields.rate || values.balance <= 0 || values.rate < 0 || values.extra < 0 || (mode === 'new' && (!fields.years || values.years <= 0 || !Number.isInteger(values.years))) || (mode === 'existing' && (!fields.payment || values.payment <= 0)) || Object.values(values).some((v) => !Number.isFinite(v))) {
      setError('Enter a positive loan balance and payment or whole-number loan period, a non-negative annual interest rate, and a non-negative extra payment.'); setResult(null); return;
    }
    if (values.years > 100 || values.rate > 100 || values.balance > 1e12 || values.payment > 1e12 || values.extra > 1e12) { setError('Please use a loan period of at most 100 years, an interest rate of at most 100%, and amounts no greater than RM 1 trillion.'); setResult(null); return; }
    if (oneTimePayments.some((item) => monthIndex(item.date) < monthIndex(startMonth))) { setError('A one-time payment is before the loan starting date. Remove it or change the starting date.'); setResult(null); return; }
    try {
      const payments = oneTimePayments.map((item) => ({ ...item, month: monthIndex(item.date) - monthIndex(startMonth) + 1 }));
      const calculation = calculateLoan({ ...values, mode, oneTimePayments: payments });
      const ignored = payments.filter((item) => item.month > calculation.rows.length || calculation.rows[item.month - 1].extraCash <= 0);
      setResult({ ...calculation, balance: values.balance, startMonth, ignored }); setError('');
    } catch (e) { setResult(null); setError(e.message); }
  }
  const field = (name, label, hint, step = '0.01') => <label className="loan-field">{label}<span>{hint}</span><input required type="number" name={name} value={fields[name]} onChange={update} min="0" step={step} placeholder="0" /></label>;
  return <section className="subpage wrap loan-page"><button className="back" onClick={onBack}>← Back to overview</button><div className="eyebrow"><span className="eyebrow-line" /> HOME OWNERSHIP</div><h1>Housing loan<em>.</em></h1><p className="lead">Explore your repayments and see how extra payments could help you pay off your home sooner.</p>
    <div className="loan-panel"><div className="mode-tabs" aria-label="Loan type"><button type="button" className={mode === 'new' ? 'selected' : ''} onClick={() => { setMode('new'); setResult(null); setError(''); }}>New loan</button><button type="button" className={mode === 'existing' ? 'selected' : ''} onClick={() => { setMode('existing'); setResult(null); setError(''); }}>Existing loan</button></div><form onSubmit={submit}><div className="loan-fields">{field('balance', mode === 'new' ? 'Loan amount' : 'Current outstanding balance', 'RM')}{mode === 'new' && field('years', 'Loan period', 'Years', '1')}{field('rate', 'Interest rate', '% per year')}{mode === 'existing' && field('payment', 'Monthly payment', 'RM, excluding extra payment')}{field('extra', 'Extra payment', 'RM per month')}<label className="loan-field">Loan Starting Date<span>First month of this schedule</span><input required type="month" min="0001-01" max="9999-12" value={startMonth} onChange={(event) => setStartMonth(event.target.value)} /></label></div><div className="extra-savings"><h2>One-time extra payments</h2><p>In a selected month, the one-time amount replaces the regular monthly extra payment. Only one entry per month is allowed.</p><div className="loan-fields"><label className="loan-field">Amount<span>RM</span><input type="number" min="0.01" max="1000000000000" step="0.01" value={oneTimeAmount} onChange={(event) => setOneTimeAmount(event.target.value)} /></label><label className="loan-field">Payment month<span>One-time payment</span><input type="month" min="0001-01" max="9999-12" value={oneTimeDate || startMonth} onChange={(event) => setOneTimeDate(event.target.value)} /></label></div>{oneTimeError && <p className="loan-error" role="alert">{oneTimeError}</p>}<button type="button" className="chart-toggle extra-add" onClick={addOneTime}>Add extra payment</button>{oneTimePayments.length > 0 && <><button type="button" className="chart-toggle extra-clear" onClick={() => { setOneTimePayments([]); setResult(null); setError(''); setOneTimeError(''); }}>Clear all</button><div className="table-scroll"><table><thead><tr><th>Payment month</th><th>Amount</th><th>Action</th></tr></thead><tbody>{oneTimePayments.map((item) => <tr key={item.date}><td>{scheduleMonth(item.date, 0)}</td><td>{money(item.amount)}</td><td><button type="button" className="chart-toggle" aria-label={`Remove extra payment for ${scheduleMonth(item.date, 0)}`} onClick={() => { setOneTimePayments(oneTimePayments.filter((payment) => payment.date !== item.date)); setResult(null); setError(''); setOneTimeError(''); }}>Remove</button></td></tr>)}</tbody></table></div></>}</div><p className="loan-note">Estimates use a constant annual rate, calculated monthly on the outstanding balance. Extra payments reduce principal and shorten the term. Bank calculations and charges may differ.</p>{error && <p className="loan-error" role="alert">{error}</p>}<button className="primary" type="submit">Calculate repayment <span>↗</span></button></form></div>
    {result && <div className="loan-results"><h2>Your repayment summary</h2><div className="summary-grid"><div><span>Regular monthly payment</span><strong>{money(result.regular)}</strong></div><div><span>Time to repay</span><strong>{duration(result.rows.length)}</strong></div><div><span>Total interest paid</span><strong>{money(result.interest)}</strong></div><div><span>Total amount paid</span><strong>{money(result.total)}</strong></div><div><span>Total extra payments</span><strong>{money(result.extraTotal)}</strong></div><div><span>Interest saved</span><strong>{result.savings === null ? 'Unavailable' : money(result.savings)}</strong></div></div>{result.savings === null && <p className="loan-note">Savings are unavailable: without extra payments, the regular payment does not pay off this loan. Extra payments cover any unpaid interest before reducing principal.</p>}{result.ignored.length > 0 && <p className="loan-note" role="status">One-time payments for {result.ignored.map((item) => scheduleMonth(item.date, 0)).join(', ')} were not applied because the loan was already settled.</p>}<PaymentChart rows={result.rows} startMonth={result.startMonth} balance={result.balance} /><SummaryChart balance={result.balance} result={result} /><div className="loan-panel"><h2>Monthly payment schedule</h2><p>Extra payment shows the actual extra paid. Extra to principal excludes any extra needed to cover interest; principal and interest show their respective contributions. The final payment is adjusted to clear the balance.</p><div className="table-scroll"><table><thead><tr><th>No.</th><th>Month</th><th>Monthly payment</th><th>Total payment</th><th>Interest</th><th>Principal</th><th>Extra payment</th><th>Extra to principal</th><th>Outstanding balance</th></tr></thead><tbody>{result.rows.map((row) => <tr key={row.month}><td>{row.month}</td><td>{scheduleMonth(result.startMonth, row.month - 1)}</td><td>{money(row.payment)}</td><td>{money(row.cumulativePayment)}</td><td>{money(row.interest)}</td><td>{money(row.principal)}</td><td>{money(row.extraCash)}</td><td>{money(row.extra)}</td><td>{money(row.balance)}</td></tr>)}</tbody></table></div></div></div>}
  </section>;
}
