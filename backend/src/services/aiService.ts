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
    if (!apiKey) throw new Error("GROQ_API_KEY is not set in .env");

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant', // Fast free model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.1 // Low temperature to reduce hallucination
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API Error: ${error}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
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
