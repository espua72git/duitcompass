import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLoan } from '../src/loan.js';

test('one-time payment replaces the recurring extra for both loan modes', () => {
  for (const input of [
    { balance: 12000, rate: 0, years: 1, mode: 'new' },
    { balance: 12000, rate: 0, payment: 1000, mode: 'existing' },
  ]) {
    const result = calculateLoan({ ...input, extra: 200, oneTimePayments: [{ month: 2, amount: 1000 }] });
    assert.equal(result.rows[0].extraCash, 200);
    assert.equal(result.rows[1].extraCash, 1000);
    assert.equal(result.rows[2].extraCash, 200);
    assert.equal(result.savings, 0);
  }
});

test('one-time payment is capped at the remaining balance', () => {
  const result = calculateLoan({ balance: 1200, rate: 0, years: 1, mode: 'new', extra: 0, oneTimePayments: [{ month: 1, amount: 5000 }] });
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].extraCash, 1100);
  assert.equal(result.rows[0].balance, 0);
});

test('interest savings compare with no recurring or one-time extras', () => {
  const input = { balance: 300000, rate: 4, years: 30, mode: 'new' };
  const result = calculateLoan({ ...input, extra: 200, oneTimePayments: [{ month: 2, amount: 1000 }] });
  const baseline = calculateLoan({ ...input, extra: 0 });
  assert.ok(Math.abs(result.savings - (baseline.interest - result.interest)) < 1e-7);
});

test('regular payment may need recurring extra to cover interest', () => {
  const result = calculateLoan({ balance: 10000, rate: 12, payment: 50, extra: 100, mode: 'existing', oneTimePayments: [{ month: 2, amount: 1000 }] });
  assert.equal(result.savings, null);
  assert.equal(result.rows[1].extraCash, 1000);
});
