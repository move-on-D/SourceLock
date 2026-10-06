import fetch from 'node-fetch';

export async function askAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const provider = process.env.AI_PROVIDER || 'groq';
    
    if (provider === 'groq') {
        return await askGroq(systemPrompt, userPrompt);
    } else if (provider === 'gemini') {
        return await askGemini(systemPrompt, userPrompt);
    } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
}

async function askGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment");

    // List of reliable fast models available on Groq
    const candidateModels = [
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.8-27b',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama3-8b-8192'
    ];

    let lastError = '';

    for (const model of candidateModels) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2
                })
            });

            if (response.ok) {
                const data: any = await response.json();
                if (data.choices && data.choices[0]?.message?.content) {
                    return data.choices[0].message.content;
                }
            } else {
                const errText = await response.text();
                lastError = errText;
                console.warn(`[AI] Model ${model} failed, trying next candidate:`, errText);
            }
        } catch (err: any) {
            lastError = err.message;
            console.warn(`[AI] Error calling model ${model}:`, err.message);
        }
    }

    throw new Error(`Groq API Error across candidate models: ${lastError}`);
}

async function askGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in .env");

    // Using Gemini REST API directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: userPrompt }]
            }],
            generationConfig: {
                temperature: 0.1
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API Error: ${error}`);
    }

    const data: any = await response.json();
    return data.candidates[0].content.parts[0].text;
}
