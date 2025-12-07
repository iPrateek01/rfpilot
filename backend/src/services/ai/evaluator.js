import { config } from '../../config/env.js';
import logger from '../../config/logger.js';

export const evaluateProposals = async (rfpData, proposals) => {
  try {
    const prompt = `You are a procurement advisor. Compare vendor proposals and provide evaluation.

RFP Requirements:
${JSON.stringify(rfpData, null, 2)}

Proposals:
${proposals.map((p, i) => `
Vendor ${i + 1}: ${p.vendor.name}
Total Price: $${p.totalPrice}
Delivery: ${p.deliveryTimeline}
Payment Terms: ${p.paymentTerms}
Warranty: ${p.warrantyOffered}
Items: ${JSON.stringify(p.proposalItems)}
`).join('\n---\n')}

Evaluate each proposal and return ONLY a valid JSON object:
{
  "evaluations": [
    {
      "vendorId": "vendor uuid",
      "vendorName": "vendor name",
      "overallScore": number (0-100),
      "priceScore": number (0-100),
      "complianceScore": number (0-100),
      "termsScore": number (0-100),
      "evaluation": "detailed evaluation text",
      "pros": ["list of pros"],
      "cons": ["list of cons"]
    }
  ],
  "recommendation": {
    "recommendedVendorId": "uuid of recommended vendor",
    "reasoning": "why this vendor is recommended"
  }
}

Return ONLY the JSON.`;

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
            temperature: 0.5,
            topK: 1,
            topP: 1,
            maxOutputTokens: 4096,
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
    
    logger.info('Successfully evaluated proposals');
    return parsed;
    
  } catch (error) {
    logger.error('Error evaluating proposals:', error);
    throw new Error(`Failed to evaluate proposals: ${error.message}`);
  }
};