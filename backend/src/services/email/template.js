import { generateRFPReference } from '../../utils/helpers.js';
import { config } from '../../config/env.js';

export const generateRFPEmailTemplate = (rfp, vendor) => {
  const reference = generateRFPReference(rfp.id);
  
  const itemsList = rfp.items.map(item => `
    - ${item.itemType}: ${item.quantity} units
      Specifications: ${JSON.stringify(item.specifications, null, 2)}
      ${item.unitBudget ? `Unit Budget: $${item.unitBudget}` : ''}
  `).join('\n');

  const subject = `${reference}: ${rfp.title}`;
  
  const body = `Dear ${vendor.contactPerson || vendor.name},

We are requesting proposals for the following procurement:

${rfp.description}

REQUIREMENTS:
${itemsList}

Budget: ${rfp.budget ? `$${rfp.budget}` : 'To be discussed'}
${rfp.deadline ? `Deadline for Proposals: ${new Date(rfp.deadline).toLocaleDateString()}` : ''}
${rfp.deliveryDeadline ? `Delivery Required By: ${new Date(rfp.deliveryDeadline).toLocaleDateString()}` : ''}
${rfp.paymentTerms ? `Payment Terms: ${rfp.paymentTerms}` : ''}
${rfp.warrantyRequirements ? `Warranty Requirements: ${rfp.warrantyRequirements}` : ''}

Please reply to this email with your proposal including:
- Detailed pricing breakdown for each item
- Delivery timeline
- Payment terms you can offer
- Warranty details
- Any additional services or terms

IMPORTANT: Please keep the reference "${reference}" in your reply subject line.

Best regards,
${config.company.name}
Procurement Team

---
Reference: ${reference}
RFP ID: ${rfp.id}`;

  return { subject, body };
};

export const generateProposalReceivedNotification = (proposal, vendor, rfp) => {
  return {
    subject: `New Proposal Received from ${vendor.name}`,
    body: `A new proposal has been received for RFP: ${rfp.title}

Vendor: ${vendor.name}
Total Price: $${proposal.totalPrice || 'Not specified'}
Delivery Timeline: ${proposal.deliveryTimeline || 'Not specified'}

View details in the system.`,
  };
};