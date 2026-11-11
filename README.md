# Duit Compass

A mobile-friendly starting point for a Malaysian personal finance planning platform. It includes housing loan, hire purchase, EPF, retirement savings and buy-to-rent estimators. Calculations run in the browser and financial information is not saved.

Housing estimates use a constant annual interest rate applied monthly to the outstanding balance. Extra payments are applied monthly; actual bank calculations, rates, fees and charges may differ. Values are calculated without monthly rounding and displayed rounded to cents. Calculations are limited to a 100-year new loan term and a 1,000-year payoff schedule.

Hire purchase estimates use flat-rate interest on the original principal, with principal and interest allocated evenly across the term. Fees, charges and actual lender terms are not included. Amounts are calculated without monthly rounding and displayed to the nearest sen.

Buy-Rent Analysis projects 25 years with full occupancy, optional rental increases and compounded operating-cost increases on selected anniversaries, and fixed user-estimated tax. It assumes a constant reducing-balance loan rate, does not model appreciation or a sale, and excludes expenses not entered. Cumulative rental cash flow excludes the initial cash invested. NOI and net rental yield are before financing and tax; cash-on-cash return and break-even rent include the tax estimate.

Retirement savings projections add monthly annuity before expenses, apply inflation to monthly expenses and credit interest on the opening balance each January after the starting month, and stop at depletion or the month the user reaches age 120. The final month's unpaid expense is shown as a shortfall. Assumptions remain constant and values are not rounded monthly.

Optional retirement pre-allocations are one-time or recurring yearly, quarterly or monthly expenses, paid after regular expenses in their listed order. Recurring allocations begin in January on or after the starting month, run for their selected duration, and increase with inflation each January after they start. Quarterly allocations fall in January, April, July and October. One-time allocations remain fixed and must fall within the projection period. The schedule shows amounts due, paid and unpaid.

The EPF estimator is a simplified projection, not an official EPF calculation. It assumes fixed contributions of 11% employee and 12% employer, allocated 75% / 15% / 10%, with no withdrawals. The first February dividend is estimated on the starting balances plus one month's contribution at the starting salary; those hypothetical contributions are not added to balances. Subsequent dividends accrue monthly on opening balances and are credited each February, including February's accrual. Uncredited dividends are shown separately at retirement. The entered salary applies in the starting month; the first raise occurs in the next selected raise month. Calculations are not rounded monthly.

Optional extra savings can be one-time, monthly, or quarterly (January, April, July and October). Their combined projected amount is capped at RM 100,000 per calendar year, and is allocated 75% / 15% / 10%. Extra savings do not affect the special first February dividend; subsequent dividends accrue on opening balances, including earlier extra savings.

## Getting started

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local address printed in the terminal. To create a production build, run `npm run build`; the static files will be in `dist/`. They can be deployed to a static hosting provider. Push the project to GitHub when ready; GitHub is a code host, and GitHub Pages or another provider can host the built site.

## Future development

- Implement and validate each financial module separately, including Malaysian-specific assumptions.
- Add device-local persistence when a module needs it. Local device storage can be cleared by users or browsers, is not automatically synced or backed up, and is accessible to other users of the same browser profile.
- The responsive, static application can be extended into a PWA later. Installability and offline support require a web app manifest, suitable icons, a service worker and HTTPS (or localhost); they are not included yet.
- The working name and placeholder copy can be revised before release. Review the disclaimer and privacy approach before public deployment.
