# Pricing model — $150/month + 5% of landing page sales

**Formula:** Monthly Total = $150 + (Attributed Sales × 0.05)

| Attributed sales | Performance fee | Monthly total |
|---|---|---|
| $0 | $0 | $150 |
| $1,000 | $50 | $200 |
| $5,000 | $250 | $400 |
| $10,000 | $500 | $650 |
| $20,000 | $1,000 | $1,150 |

These are illustrative billing examples, not projected sales.

## Where the pricing lives
- `index.html`: meta/OG tags, JSON-LD (Service offer + FAQPage), hero price chip, process step 05, pricing scene (`#packages`), FAQ Q5–Q10, request-form plan option
- `src/js/pricing.js`: the single source for the formula and calculator (integer-cents math)
- `src/css/pricing.css`: pricing scene and calculator styles
- `tests/pricing.test.js`: run `node tests/pricing.test.js`

## What is NOT implemented
- No payment processor (Stripe or otherwise) and no automated billing exist in this site.
- No automated sales tracking or attribution exists in this site.
- The request form still only logs to the console (pre-existing `TODO` in `src/js/main.js`); it does not send submissions anywhere.

## Open questions to confirm before relying on the copy
Marked in `index.html` with `<!-- CONFIRM: ... -->` comments.
1. **Attribution method**: UTM-tagged checkout links, a conversion pixel, discount codes, the client's store/CRM reports, or a mix?
2. **Attribution window**: how long after a landing-page visit a sale still counts.
3. **Exclusions**: are refunds, chargebacks, taxes, shipping, and discounts excluded from the 5%?
4. **Offline/phone sales**: do they count, and how are they verified?
5. **Fee billing**: is the 5% billed in arrears, on the same or a separate invoice, and on what date?
6. **Reporting**: format and frequency of the sales report sent to clients.
7. **Setup fee**: the new copy implies none ("for just $150 per month"). Confirm.
8. **Removed offers**: the old "Month 2 free" offer and the $1,000/$1,500 build fees were removed. Confirm nothing replaces them.
9. **Plan inclusions**: the "What's included" list reuses the old Standard build features. Confirm, and say whether any former Full Automation features are included.
10. Cancellation terms and contract length are not stated anywhere (intentionally; none were provided).
