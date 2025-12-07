import { config } from '../../config/env.js';
import logger from '../../config/logger.js';

export const parseRFPFromNaturalLanguage = async (naturalLanguageInput) => {
  try {
    const prompt = `You are an RFP structuring assistant. Parse the following procurement requirements into a structured JSON format.

Requirements:
${naturalLanguageInput}

Extract and return ONLY a valid JSON object with this exact structure:
{
  "title": "Brief title for this RFP",
  "description": "Detailed description",
  "items": [
    {
      "itemType": "type of item (e.g., laptop, monitor)",
      "quantity": number,
      "specifications": {
        "key": "value pairs of specs"
      },
      "unitBudget": number or null
    }
  ],
  "budget": total budget number or null,
  "deadline": "deadline for proposals in ISO format" or null,
  "deliveryDeadline": "delivery deadline in ISO format" or null,
  "paymentTerms": "payment terms string" or null,
  "warrantyRequirements": "warranty requirements" or null,
  "additionalTerms": "any additional terms" or null
}

Return ONLY the JSON, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.gemini.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const content = data.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code blocks if present
    const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    
    logger.info('Successfully parsed RFP from natural language');
    return parsed;
    
  } catch (error) {
    logger.error('Error parsing RFP:', error);
    throw new Error(`Failed to parse RFP: ${error.message}`);
  }
};