// Netlify Function avec OpenRouter.ai
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
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { text, style } = JSON.parse(event.body);
        
        // Configuration du modèle - UTILISE VOTRE MODÈLE GRATUIT
        // Le modèle gratuit stepfun/step-3.5-flash:free
        const MODEL = process.env.OPENROUTER_MODEL || 'stepfun/step-3.5-flash:free';
        
        // Prompts selon le style (simplifiés pour le modèle gratuit)
        const stylePrompts = {
            academic: `Reformule ce texte de façon académique et formelle, corrige les fautes. Texte: "${text}"`,
            simple: `Reformule ce texte de façon simple et accessible, corrige les fautes. Texte: "${text}"`,
            pro: `Reformule ce texte de façon professionnelle et corporate, corrige les fautes. Texte: "${text}"`
        };
        
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        
        // Vérification de la clé API
        if (!OPENROUTER_API_KEY) {
            console.log('Pas de clé API OpenRouter');
            const simulatedResult = simulateReformulation(text, style);
            const corrections = detectCorrections(text, simulatedResult);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    result: simulatedResult,
                    corrections: corrections,
                    style: style,
                    mode: 'simulation'
                })
            };
        }
        
        console.log('Modèle utilisé:', MODEL);
        console.log('Clé API présente:', OPENROUTER_API_KEY ? 'Oui' : 'Non');
        
        // Appel à l'API OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://textforge-ai.netlify.app',
                'X-Title': 'TextForge AI'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: stylePrompts[style]
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        
        // Log pour déboguer
        console.log('Réponse API:', JSON.stringify(data).substring(0, 500));
        
        if (data.error) {
            console.error('OpenRouter Error:', data.error);
            // Fallback en simulation
            const simulatedResult = simulateReformulation(text, style);
            const corrections = detectCorrections(text, simulatedResult);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    result: simulatedResult,
                    corrections: corrections,
                    style: style,
                    mode: 'fallback',
                    error: data.error.message
                })
            };
        }
        
        const reformulatedText = data.choices[0].message.content.trim();
        const cleanText = reformulatedText.replace(/^["']|["']$/g, '');
        const corrections = detectCorrections(text, cleanText);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                result: cleanText,
                corrections: corrections,
                style: style,
                model: MODEL
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        // Fallback en simulation
        try {
            const { text, style } = JSON.parse(event.body);
            const simulatedResult = simulateReformulation(text, style);
            const corrections = detectCorrections(text, simulatedResult);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    result: simulatedResult,
                    corrections: corrections,
                    style: style,
                    mode: 'fallback'
                })
            };
        } catch (e) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Erreur lors du traitement du texte'
                })
            };
        }
    }
};

// Fonction de simulation (fallback)
function simulateReformulation(text, style) {
    const styleIndicators = {
        academic: {
            intro: "Selon l'analyse académique, ",
            transforms: {
                'est': 'constitue',
                'fait': 'réalise',
                'important': 'significatif'
            }
        },
        simple: {
            intro: "Voici simplement : ",
            transforms: {
                'constitue': 'est',
                'réalise': 'fait',
                'significatif': 'important'
            }
        },
        pro: {
            intro: "En termes professionnels, ",
            transforms: {
                'est': 'représente',
                'fait': 'exécute',
                'important': 'stratégique'
            }
        }
    };
    
    const selected = styleIndicators[style];
    let result = text;
    
    for (const [original, replacement] of Object.entries(selected.transforms)) {
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        result = result.replace(regex, replacement);
    }
    
    if (!result.toLowerCase().startsWith(selected.intro.toLowerCase())) {
        result = selected.intro + result.charAt(0).toLowerCase() + result.slice(1);
    }
    
    return result;
}

// Détection intelligente des corrections
function detectCorrections(original, corrected) {
    const corrections = [];
    
    if (original === corrected) {
        return corrections;
    }
    
    const originalWords = original.toLowerCase().split(/[\s\n,.!?;:]+/).filter(w => w.length > 2);
    const correctedWords = corrected.toLowerCase().split(/[\s\n,.!?;:]+/).filter(w => w.length > 2);
    
    for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
        if (originalWords[i] !== correctedWords[i] && 
            originalWords[i].length > 2 && 
            correctedWords[i].length > 2) {
            corrections.push(`"${originalWords[i]}" → "${correctedWords[i]}"`);
        }
    }
    
    return corrections.slice(0, 4);
}