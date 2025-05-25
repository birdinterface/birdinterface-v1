// Define your models here.
export const models = [
  {
    label: 'Grok 3',
    name: 'grok-3',
    description: 'Latest model from xAI + Advancers Philosophy',
    maxTokens: 72000,
    temperature: 0,
  },
] as const;

export const DEFAULT_MODEL_NAME: Model['name'] = 'grok-3';

export type Model = (typeof models)[number];
