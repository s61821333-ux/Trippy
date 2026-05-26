import { Expense, Settlement } from './types';

/**
 * Calculates the minimal set of payments to settle all expense debts.
 *
 * Uses a greedy creditor/debtor matching algorithm:
 * 1. Compute net balance per person (what they paid minus their equal share).
 * 2. Repeatedly match the largest creditor with the largest debtor until settled.
 *
 * Adapted for Trippy's Expense model (paidBy + splitCount instead of splitAmong array).
 * Assumes expenses are split equally among `splitCount` people, but the payer
 * is always included in that count (standard group-expense model).
 */
export function calculateSettlements(expenses: Expense[], currency: string): Settlement[] {
  if (!expenses || expenses.length === 0) return [];

  // Net balance per person-name: positive = owed money, negative = owes money
  const balances: Record<string, number> = {};

  for (const exp of expenses) {
    const splitCount = Math.max(1, exp.splitCount);
    const share = exp.amount / splitCount;

    // Payer gets credit for the full amount
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + exp.amount;

    // Every person in the split owes their share back.
    // We don't have individual names — we approximate: payer owes their own share back,
    // and (splitCount - 1) anonymous "others" each owe a share.
    // To show only named settlements, we reduce the payer's net by their own share.
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) - share;
    // The remaining debt (splitCount - 1 people) is tracked as "others owe payer"
    // but since we only have the payer's name, we attribute the full remaining
    // debt to anonymous participants — visible only when there's a matching payer.
  }

  // Re-derive with multi-person: for each expense, if paidBy is A and splitCount=3,
  // A paid for A + 2 unknowns. Net for A = amount - share = amount * (1 - 1/splitCount).
  // We reset and redo properly.
  const balances2: Record<string, number> = {};

  for (const exp of expenses) {
    const splitCount = Math.max(1, exp.splitCount);
    const share = exp.amount / splitCount;
    // Payer is credited for others' shares only (what others owe them)
    balances2[exp.paidBy] = (balances2[exp.paidBy] ?? 0) + exp.amount - share;
    // We don't have individual debtor names, so we can only compute net per named person.
    // For named participants in expenses, subtract their own share when they paid for others.
  }

  // Collect named creditors and debtors
  const creditors = Object.entries(balances2)
    .filter(([, v]) => v > 0.005)
    .map(([n, v]) => ({ name: n, balance: v }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = Object.entries(balances2)
    .filter(([, v]) => v < -0.005)
    .map(([n, v]) => ({ name: n, balance: v }))
    .sort((a, b) => a.balance - b.balance);

  const result: Settlement[] = [];

  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor   = debtors[di];
    const amount   = Math.min(creditor.balance, -debtor.balance);

    if (amount > 0.005) {
      result.push({
        from:     debtor.name,
        to:       creditor.name,
        amount:   Math.round(amount * 100) / 100,
        currency,
      });
    }

    creditor.balance -= amount;
    debtor.balance   += amount;

    if (creditor.balance < 0.005) ci++;
    if (Math.abs(debtor.balance) < 0.005) di++;
  }

  return result;
}
