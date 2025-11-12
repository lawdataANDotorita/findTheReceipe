const https = require('https');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { image, mimeType } = JSON.parse(event.body);

        if (!image) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No image provided' })
            };
        }

        // Get API key from environment variable
        const apiKey = process.env.OPENAI_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'OpenAI API key not configured' })
            };
        }

        // Prepare the request to OpenAI
        const requestBody = JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "נתח את תמונת המאכל כדי למצוא את שם המאכל והמתכון המתאים לו. אנא הצג את שם המאכל, היסטוריה קצרה של המאכל (חייב את זה. אם לא מצאת אז היסטוריה של מאכל קרוב), והמתכון כולל רכיבים והכנה שלב אחר שלב. אנא השתמש בפורמט מתאים עם ## לחלקים השונים"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType || 'image/jpeg'};base64,${image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1500
        });

        // Make request to OpenAI API
        const recipe = await callOpenAI(apiKey, requestBody);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipe })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to analyze image'
            })
        };
    }
};

// Helper function to call OpenAI API
function callOpenAI(apiKey, requestBody) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (res.statusCode !== 200) {
                        reject(new Error(response.error?.message || 'OpenAI API error'));
                        return;
                    }

                    const recipe = response.choices[0]?.message?.content;
                    if (!recipe) {
                        reject(new Error('No recipe generated'));
                        return;
                    }

                    resolve(recipe);
                } catch (error) {
                    reject(new Error('Failed to parse OpenAI response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('Failed to connect to OpenAI API'));
        });

        req.write(requestBody);
        req.end();
    });
}
