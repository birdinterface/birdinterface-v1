// Define your models here.
export const models = [
  {
    label: 'Grok 3',
    name: 'grok-3',
    description: 'Latest model from xAI + Advancers Philosophy',
    maxTokens: 72000,
    temperature: 0,
  },
  {
    label: 'Gemini 2.5 Pro',
    name: 'gemini-2.5-pro',
    description: 'Googles latest model',
    maxTokens: 72000,
    temperature: 0,
  },
  {
    label: 'Claude Opus 4',
    name: 'claude-opus-4',
    description: 'Anthropic latest model',
    maxTokens: 72000,
    temperature: 0,
  },
  {
    label: 'ChatGPT 4o',
    name: 'chatgpt-4o',
    description: 'OpenAIs latest model',
    maxTokens: 72000,
    temperature: 0,
  },
] as const;

export const DEFAULT_MODEL_NAME: Model['name'] = 'grok-3';

export type Model = (typeof models)[number];
