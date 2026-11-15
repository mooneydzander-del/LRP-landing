// Run: node tests/pricing.test.js
const assert = require('assert');
const { calculateMonthlyTotal, parseSalesToCents, formatUSD, PRICING } = require('../src/js/pricing.js');

const total = (dollars) => calculateMonthlyTotal(parseSalesToCents(dollars));

// Brief examples: Monthly Total = $150 + (Attributed Sales × 0.05)
const examples = [[0, 15000], [1000, 20000], [5000, 40000], [10000, 65000], [20000, 115000]];
for (const [sales, expectedCents] of examples) {
  const r = total(sales);
  assert.strictEqual(r.baseCents, 15000, 'base is always $150');
  assert.strictEqual(r.totalCents, expectedCents, `$${sales} sales → ${expectedCents / 100}`);
  assert.strictEqual(r.feeCents, Math.round(sales * 100 * 0.05));
}

// Edge cases
assert.strictEqual(parseSalesToCents(''), 0);
assert.strictEqual(parseSalesToCents(null), 0);
assert.strictEqual(parseSalesToCents('abc'), 0);
assert.strictEqual(parseSalesToCents('-500'), 0, 'negative sales clamp to 0');
assert.strictEqual(parseSalesToCents('.'), 0);
assert.strictEqual(parseSalesToCents('$12,500.50'), 1250050, 'currency symbols and commas');
assert.strictEqual(parseSalesToCents(' 1 000 '), 100000, 'spaces stripped');
assert.strictEqual(parseSalesToCents('1e3'), 100000);
assert.strictEqual(parseSalesToCents('Infinity'), 0);
assert.strictEqual(parseSalesToCents('99999999999999'), PRICING.maxSalesCents, 'capped');
assert.strictEqual(total('0.10').feeCents, 1, '5% of $0.10 rounds to 1 cent');
assert.strictEqual(total('0.09').feeCents, 0, '5% of $0.09 rounds to 0');
assert.strictEqual(total('333.33').totalCents, 15000 + 1667, 'cent rounding');
assert.strictEqual(total('0.1').totalCents + total('0.2').totalCents, 30002, 'no float drift');

// Formatting
assert.strictEqual(formatUSD(15000), '$150');
assert.strictEqual(formatUSD(115000), '$1,150');
assert.strictEqual(formatUSD(16667), '$166.67');

console.log('pricing tests passed');
