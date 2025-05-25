const COST_PER_INPUT_TOKEN = 0.000005; // $5 per million tokens
const COST_PER_OUTPUT_TOKEN = 0.000015; // $15 per million tokens

// Pricing per 1K tokens
const PRICING = {
  default: { // Assumes grok-3, grok-2-vision-1212 (Update if vision model has different pricing)
    input: 0.002, // $2 per 1M tokens
    output: 0.01,  // $10 per 1M tokens
  },
  'grok-3-mini': {
    input: 0.0003, // $0.30 per 1M tokens
    output: 0.0005, // $0.50 per 1M tokens
  },
};

// Add system prompt token count
const SYSTEM_PROMPT_TOKENS = 100; // Approximate tokens in base system prompt

export const USAGE_LIMITS = {
  free: 0.50,     // $0.10 per month
  pro: 10.00,      // $3.00 per month
  ultimate: 150.00  // $6.00 per month
} as const;

export function calculateCost(
  inputTokens: number, 
  outputTokens: number,
  modelName: string = 'default' // Add modelName parameter, default to avoid breaking other potential calls
): number {
  const pricingTier = PRICING[modelName as keyof typeof PRICING] || PRICING.default;

  const inputCost = (inputTokens / 1000) * pricingTier.input;
  const outputCost = (outputTokens / 1000) * pricingTier.output;

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