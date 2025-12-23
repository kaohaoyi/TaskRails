export const PROVIDER_MODELS: Record<string, string[]> = {
    openrouter: ['auto', 'openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro-1.5', 'deepseek/deepseek-v3'],
    openai: ['gpt-4o', 'o1-preview', 'o1-mini', 'gpt-4o-mini'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    google: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
    xai: ['grok-beta'],
    together: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'deepseek-ai/DeepSeek-V3'],
    huggingface: ['mistralai/Mistral-7B-v0.3', 'meta-llama/Llama-3.2-11B-Vision-Instruct'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    ollama: ['llama3.2', 'mistral', 'deepseek-v3', 'phi4'],
    custom: ['openai-compatible']
};
