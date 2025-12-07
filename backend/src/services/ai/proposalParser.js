import { config } from '../../config/env.js';
import logger from '../../config/logger.js';

export const parseProposalFromEmail = async (emailBody, rfpData) => {
  try {
    const prompt = `You are a vendor proposal analyzer. Extract structured data from this vendor response.

RFP Context:
Title: ${rfpData.title}
Items Requested: ${JSON.stringify(rfpData.items)}

Vendor Response:
${emailBody}

Extract and return ONLY a valid JSON object with this structure:
{
  "items": [
    {
      "itemType": "matching item type from RFP",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "specifications": {
        "key": "value"
      },
      "notes": "any notes about this item"
    }
  ],
  "totalPrice": total price number,
  "deliveryTimeline": "delivery timeline string",
  "paymentTerms": "payment terms",
  "warrantyOffered": "warranty details",
  "additionalNotes": "any other important notes"
}

Return ONLY the JSON, no other text.`;

    const response = await fetch(
      `https://https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.gemini.apiKey}`,
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
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const content = data.candidates[0].content.parts[0].text.trim();
    const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    
    logger.info('Successfully parsed proposal from email');
    return parsed;
    
  } catch (error) {
    logger.error('Error parsing proposal:', error);
    throw new Error(`Failed to parse proposal: ${error.message}`);
  }
};