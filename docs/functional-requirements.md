# Functional Requirements: CLEC Strategy Backtest (Technical Revision)

## 1. Project Overview

**CLEC Strategy Backtest** is a high-performance financial simulation platform designed for Nasdaq-100 (QQQ) and leveraged (QLD) asset analysis. It enables investors to model complex long-term scenarios, accounting for leverage, debt servicing, and sophisticated rebalancing algorithms.

---

## 2. Core Simulation Engine

The engine operates on a discrete monthly time-step $t$, processing historical market data.

### 2.1 The Backtest Pipeline

Each monthly iteration follows a strict sequence:

1.  **Banking Phase**: Accrue interest on cash and debt; service debt based on selected mode.
2.  **Strategy Phase**: Apply periodic contributions (DCA) and execute rebalancing logic if triggers are met.
3.  **Leverage Phase**: Process annual withdrawals (living expenses), calculate LTV, and perform solvency checks.
4.  **Valuation Phase**: Compute Net Equity, Portfolio Beta, and record results.

### 2.2 Mathematical Foundations

#### Portfolio Valuation

- **Total Asset Value (TAV)**: $V_{assets} = (S_{qqq} \cdot P_{qqq}) + (S_{qld} \cdot P_{qld}) + Cash$
- **Net Equity**: $E = \max(0, V_{assets} - Debt - AccruedInterest)$

#### Risk & Performance Metrics

- **CAGR**: $\text{CAGR} = \left(\frac{V_{end}}{V_{start}}\right)^{\frac{1}{n}} - 1$ (where $n$ is years).
- **Sharpe Ratio**: $S = \frac{R_a - R_{rf}}{\sigma_a}$ (Annualized Return - Risk Free Rate / Annualized Volatility).
- **Ulcer Index**: $\text{UI} = \sqrt{\frac{\sum D_i^2}{N}}$ (Quadratic mean of percentage drawdowns $D_i$).
- **Portfolio Beta**: $\beta_p = \frac{(Val_{qqq} \cdot 1) + (Val_{qld} \cdot 2)}{E}$ (Reflects effective leverage relative to QQQ).

#### Banking & Debt

- **Cash Yield**: $C_{t+1} = C_t \cdot (1 + r_{yield})^{1/12}$
- **LTV Calculation**: $\text{LTV} = \frac{Debt + AccruedInterest}{Basis}$
  - _Total Assets Basis_: $Basis = V_{assets}$
  - _Collateral Basis_: $Basis = \sum (Asset_i \cdot PledgeRatio_i)$

---

## 3. Investment Strategies (Precise Logic)

### 3.1 Base Strategies

| Strategy             | Logic                                                                                        |
| :------------------- | :------------------------------------------------------------------------------------------- |
| **No Rebalance**     | DCA contributions are distributed to QQQ/QLD based on fixed weights at $t$. No other trades. |
| **Yearly Rebalance** | Every January ($m=1$), re-allocate TAV to target weights $\mathbf{w}$.                       |

### 3.2 Advanced Strategies

#### Smart Adjust

Triggered every December. Calculates "QLD Profit" as: $P_{yld} = Val_{qld} - (Val_{start\_year} + \sum Inflows)$.

- **Bull Case** ($P_{yld} > 0$): Sell $\frac{1}{3} P_{yld}$ and move to Cash.
- **Bear Case** ($P_{yld} \le 0$): Buy QLD using Cash; Buy Amount $= 2\% \cdot V_{assets\_at\_t}$.

### 3.3 Flexible Rebalancing

Prioritizes a **Target Cash Buffer**: $B_{target} = \text{Annual Expense} \times \text{Coverage Years}$.

#### Mode A: Inadequate Buffer ($Cash < B_{target}$)

- **Bull** ($P_{yld} > 0$): Harvest $\frac{1}{3} P_{yld}$ from QLD to Cash.
- **Bear** ($P_{yld} \le 0$): **Asset swap**. Sell $2\% \cdot V_{assets}$ from QQQ to buy QLD (Dip buying without cash).

#### Mode B: Adequate Buffer ($Cash \ge B_{target}$)

- **Defensive (Flex 1)**: Follows **Smart Adjust** logic (Bull: Profit to Cash | Bear: Buy with Cash).
- **Aggressive (Flex 2)**:
  - **Bull**: Sell $\frac{1}{3} P_{yld}$ from QLD to buy QQQ (**Equity swap** for safety).
  - **Bear**: Follows Smart Adjust (Buy with Cash).

---

## 4. Leverage & Solvency

- **Withdrawals**: Annual living expenses $W_a$.
  - _Fixed Mode_: $W_t = W_0 \cdot (1 + i)^n$ (Inflation adjusted $i$).
  - _Percent Mode_: $W_t = V_{assets} \cdot \%_{user}$.
- **Liquidation**: If $\text{LTV} > \text{MaxLTV}$, account is marked `Bankrupt` ($E=0$) at date $t$.
