// Define your models here.
export const models = [
  {
    label: 'Grok 2',
    name: 'grok-2-1212',
    description: 'Truth-seeking AI from xAI',
    maxTokens: 72000,
    temperature: 0,
  },
] as const;

export const DEFAULT_MODEL_NAME: Model['name'] = 'grok-2-1212';

export type Model = (typeof models)[number];
