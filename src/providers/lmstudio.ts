import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: 'https://f13ad5e81f90.ngrok-free.app/v1',
});

export const gemma = lmstudio('google/gemma-3-4b')

export const graniteVision = lmstudio('granite-vision-3.2-2b')

export const llama3 = lmstudio('llama-3.2-1b-instruct')
