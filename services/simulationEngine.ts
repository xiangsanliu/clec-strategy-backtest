import { AssetConfig, MarketDataRow, PortfolioState, SimulationResult, StrategyFunction } from "../types";
import { calculateCAGR, calculateIRR, calculateMaxDrawdown, calculateSharpeRatio } from "./financeMath";

export const runBacktest = (
  marketData: MarketDataRow[],
  strategyFunc: StrategyFunction,
  config: AssetConfig,
  strategyName: string,
  color: string = "#000000"
): SimulationResult => {
  const history: PortfolioState[] = [];
  
  // Initial empty state
  let currentState: PortfolioState = {
    date: marketData[0].date,
    shares: { QQQ: 0, QLD: 0 },
    cashBalance: 0,
    debtBalance: 0,
    totalValue: 0,
    strategyMemory: {},
    ltv: 0
  };

  const monthlyCashYieldRate = Math.pow(1 + config.cashYieldAnnual / 100, 1 / 12) - 1;
  
  // Debt settings
  const leverage = config.leverage || { enabled: false, interestRate: 0, maxLtv: 0, withdrawType: 'PERCENT', withdrawValue: 0 };
  const monthlyLoanRate = leverage.enabled ? Math.pow(1 + leverage.interestRate / 100, 1 / 12) - 1 : 0;
  
  let isBankrupt = false;
  let bankruptcyDate: string | null = null;

  for (let index = 0; index < marketData.length; index++) {
    const dataRow = marketData[index];

    if (isBankrupt) {
      // If bankrupt, portfolio stays at 0 (or strictly debt limited)
      history.push({
        ...currentState,
        date: dataRow.date,
        totalValue: 0,
        shares: { ...currentState.shares },
        ltv: 0 // Irrelevant once bankrupt
      });
      continue;
    }

    // 1. Banking Logic: Interest
    if (index > 0) {
      // Interest on Cash Savings
      currentState.cashBalance *= (1 + monthlyCashYieldRate);
      // Interest on Debt (accrues to balance)
      if (leverage.enabled && currentState.debtBalance > 0) {
         currentState.debtBalance *= (1 + monthlyLoanRate);
      }
    }

    // 2. Execute Investment Strategy (Trading)
    currentState = strategyFunc(currentState, dataRow, config, index);

    // 3. Leverage / Pledging Logic (Borrowing Cash)
    if (leverage.enabled) {
       const currentMonth = parseInt(dataRow.date.substring(5, 7)) - 1;
       
       // Annual Withdrawal in January
       // We only withdraw if we have existing collateral (shares)
       if (currentMonth === 0 && index > 0 && currentState.shares.QQQ > 0) {
           const qqqValue = currentState.shares.QQQ * dataRow.qqq;
           let borrowAmount = 0;
           
           if (leverage.withdrawType === 'PERCENT') {
               borrowAmount = qqqValue * (leverage.withdrawValue / 100);
           } else {
               borrowAmount = leverage.withdrawValue;
           }
           
           // Adding to debt.
           // Note: We do NOT add to cashBalance because the premise is "Cash Out" (withdrawn for living).
           // If we added to cashBalance, the strategy might reinvest it, which is double leverage.
           currentState.debtBalance += borrowAmount;
       }

       // Solvency Check (Bankruptcy)
       const qqqValue = currentState.shares.QQQ * dataRow.qqq;
       
       // Calculate LTV. If QQQ Value is 0, LTV is infinite if debt > 0.
       if (qqqValue > 0) {
          currentState.ltv = (currentState.debtBalance / qqqValue) * 100;
       } else {
          currentState.ltv = currentState.debtBalance > 0 ? 1000 : 0;
       }

       if (currentState.ltv > leverage.maxLtv) {
          isBankrupt = true;
          bankruptcyDate = dataRow.date;
          // Clean up state for final record
          currentState.totalValue = 0;
       }
    }

    // 4. Update Net Value
    if (!isBankrupt) {
        // Assets
        const assets = 
            (currentState.shares.QQQ * dataRow.qqq) +
            (currentState.shares.QLD * dataRow.qld) +
            currentState.cashBalance;
        
        // Net Equity
        currentState.totalValue = Math.max(0, assets - currentState.debtBalance);
    }

    // 5. Record History
    history.push({
      ...currentState,
      shares: { ...currentState.shares },
      strategyMemory: { ...currentState.strategyMemory }
    });
  }

  // Calculate Metrics
  const years = marketData.length / 12;
  const finalState = history[history.length - 1];
  const initialInv = config.initialCapital;
  
  const metrics = {
    finalBalance: finalState.totalValue,
    cagr: isBankrupt ? -100 : calculateCAGR(initialInv, finalState.totalValue, years),
    maxDrawdown: calculateMaxDrawdown(history),
    sharpeRatio: calculateSharpeRatio(history, config.cashYieldAnnual),
    irr: isBankrupt ? -100 : calculateIRR(
      initialInv, 
      config.contributionAmount, 
      config.contributionIntervalMonths, 
      finalState.totalValue, 
      marketData.length
    )
  };

  return {
    strategyName,
    color,
    history,
    isBankrupt,
    bankruptcyDate,
    metrics
  };
};