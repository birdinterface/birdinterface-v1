const COST_PER_INPUT_TOKEN = 0.000005; // $5 per million tokens
const COST_PER_OUTPUT_TOKEN = 0.000015; // $15 per million tokens

// Add system prompt token count
const SYSTEM_PROMPT_TOKENS = 100; // Approximate tokens in base system prompt

export const USAGE_LIMITS = {
  free: 0.50,     // $0.10 per month
  pro: 10.00,      // $3.00 per month
  ultimate: 150.00  // $6.00 per month
} as const;

export function calculateCost(
  inputTokens: number, 
  outputTokens: number
): number {
  // Actual Grok-2 pricing
  const INPUT_COST_PER_1K_TOKENS = 0.002;   // $2 per 1M tokens = $0.002 per 1K tokens
  const OUTPUT_COST_PER_1K_TOKENS = 0.01;   // $10 per 1M tokens = $0.01 per 1K tokens

  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K_TOKENS;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K_TOKENS;

  // Return total cost rounded to 4 decimal places
  return Number((inputCost + outputCost).toFixed(4));
}

export function hasExceededLimit(currentUsage: number, membership: string): boolean {
  const limit = USAGE_LIMITS[membership as keyof typeof USAGE_LIMITS] || 0;
  return currentUsage >= limit;
}

export function getNextResetDate(): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Set to 11th of current month
  let resetDate = new Date(currentYear, currentMonth, 11);
  
  // If we're past the 11th, show next month's date
  if (now.getDate() > 11) {
    resetDate = new Date(currentYear, currentMonth + 1, 11);
  }
  
  // Format date as "11 March" (without year)
  return resetDate.toLocaleDateString('en-US', { 
    day: 'numeric',
    month: 'long'
  });
} 