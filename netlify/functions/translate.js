const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }
    
    try {
        const { text, targetLang } = JSON.parse(event.body);
        
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        
        if (!OPENROUTER_API_KEY) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    translated: `[Traduction ${targetLang === 'en' ? 'Anglaise' : 'Française'}]\n\n${text.substring(0, 500)}...\n\n(Clé API OpenRouter non configurée)`,
                    mode: 'simulation'
                })
            };
        }
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.URL || 'https://textforge-ai.netlify.app',
                'X-Title': 'TextForge AI'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: `Traduis le texte suivant du français vers l'anglais. Donne uniquement la traduction, sans explications, sans guillemets, sans commentaires :\n\n${text}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        const translated = data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                translated: translated
            })
        };
        
    } catch (error) {
        console.error('Translation Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};