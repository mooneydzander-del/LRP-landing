/* ============================================================
   LPR — Pricing model + sales calculator
   Pricing: $150/month fixed subscription
            + 5% of verified sales attributed to the landing page.
   Monthly Total = $150 + (Attributed Sales × 0.05)
   All math runs in integer cents to avoid floating-point drift.
   These figures are illustrative billing examples, not projections.
   ============================================================ */
(function (root) {
  'use strict';

  var PRICING = {
    baseMonthlyCents: 15000, // $150.00 fixed monthly subscription
    performanceRate: 0.05,   // 5% of attributed landing page sales
    maxSalesCents: 100000000000 // $1,000,000,000 sanity cap for the calculator
  };

  /** Parse user input ("12,500.50", "$3k" is NOT supported) into a non-negative cents integer. */
  function parseSalesToCents(raw) {
    if (raw === null || raw === undefined) return 0;
    var str = String(raw).replace(/[$,\s]/g, '');
    if (str === '' || str === '.') return 0;
    var n = Number(str);
    if (!isFinite(n) || n <= 0) return 0;
    var cents = Math.round(n * 100);
    return Math.min(cents, PRICING.maxSalesCents);
  }

  /** Core billing formula. Input and outputs in cents. */
  function calculateMonthlyTotal(attributedSalesCents) {
    var sales = Math.max(0, Math.round(Number(attributedSalesCents) || 0));
    var fee = Math.round(sales * PRICING.performanceRate);
    return {
      salesCents: sales,
      baseCents: PRICING.baseMonthlyCents,
      feeCents: fee,
      totalCents: PRICING.baseMonthlyCents + fee
    };
  }

  function formatUSD(cents, opts) {
    var showCents = !(opts && opts.whole) && cents % 100 !== 0;
    return '$' + (cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    });
  }

  var api = {
    PRICING: PRICING,
    parseSalesToCents: parseSalesToCents,
    calculateMonthlyTotal: calculateMonthlyTotal,
    formatUSD: formatUSD
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.LPRPricing = api;

  /* ── DOM wiring ── */
  function init() {
    var calc = document.getElementById('sales-calc');
    if (!calc) return;

    var input = document.getElementById('calc-sales');
    var range = document.getElementById('calc-range');
    var outSales = document.getElementById('calc-out-sales');
    var outBase = document.getElementById('calc-out-base');
    var outFee = document.getElementById('calc-out-fee');
    var outTotal = document.getElementById('calc-out-total');
    var presets = calc.querySelectorAll('[data-sales]');

    function render(cents, source) {
      var r = calculateMonthlyTotal(cents);
      outSales.textContent = formatUSD(r.salesCents);
      outBase.textContent = formatUSD(r.baseCents);
      outFee.textContent = formatUSD(r.feeCents);
      outTotal.textContent = formatUSD(r.totalCents);

      if (source !== 'range') {
        range.value = String(Math.min(r.salesCents / 100, Number(range.max)));
      }
      presets.forEach(function (btn) {
        var match = Number(btn.getAttribute('data-sales')) * 100 === r.salesCents;
        btn.classList.toggle('is-active', match);
        btn.setAttribute('aria-pressed', match ? 'true' : 'false');
      });
    }

    input.addEventListener('input', function () {
      render(parseSalesToCents(input.value), 'input');
    });
    input.addEventListener('blur', function () {
      var cents = parseSalesToCents(input.value);
      input.value = cents ? (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '';
    });
    range.addEventListener('input', function () {
      var cents = parseSalesToCents(range.value);
      input.value = cents ? (cents / 100).toLocaleString('en-US') : '';
      render(cents, 'range');
    });
    presets.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cents = parseSalesToCents(btn.getAttribute('data-sales'));
        input.value = cents ? (cents / 100).toLocaleString('en-US') : '0';
        render(cents, 'preset');
      });
    });

    render(parseSalesToCents(input.value), 'init');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
