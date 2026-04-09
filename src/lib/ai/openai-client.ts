// ============================================================================
// OPENAI CLIENT - Wrapper for OpenAI API
// ============================================================================

import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(apiKey?: string): OpenAI {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
    }

    // Use provided key or fall back to env variable
    const key = apiKey || process.env.OPENAI_API_KEY!

    // Reuse client if same key
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: key })
    }

    return openaiClient
}

export async function generateText(
    prompt: string,
    options: {
        model?: string
        maxTokens?: number
        temperature?: number
    } = {}
): Promise<string> {
    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7,
    })

    return response.choices[0]?.message?.content || ''
}

export async function generateImage(
    prompt: string,
    options: {
        size?: '1024x1024' | '1792x1024' | '1024x1792'
        quality?: 'standard' | 'hd'
    } = {}
): Promise<string> {
    const client = getOpenAIClient()

    const response = await client.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        n: 1,
    })

    return response.data[0]?.url || ''
}

export async function generateJSON<T>(
    prompt: string,
    options: {
        model?: string
        maxTokens?: number
    } = {}
): Promise<T> {
    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    return JSON.parse(content) as T
}
