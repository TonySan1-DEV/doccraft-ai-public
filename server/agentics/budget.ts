export class BudgetManager {
  constructor(private caps: { hardCapUsd: number; usage: { spent: number } }) {}

  get usage() {
    return this.caps.usage;
  }

  debit(amount: number) {
    this.caps.usage.spent += amount;
    if (this.caps.usage.spent > this.caps.hardCapUsd) {
      throw new Error("BUDGET_EXCEEDED");
    }
  }

  // Convenience for LLM usage
  debitFromTokens(costUsd: number) {
    this.debit(costUsd);
  }
}

export default BudgetManager;
