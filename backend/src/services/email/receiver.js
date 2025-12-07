import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { config } from '../../config/env.js';
import logger from '../../config/logger.js';
import { prisma } from '../../lib/prisma.js';
import { parseProposalFromEmail } from '../ai/proposalParser.js';
import { PROPOSAL_STATUS } from '../../utils/constants.js';

const imapConfig = {
  imap: {
    user: config.imap.user,
    password: config.imap.password,
    host: config.imap.host,
    port: config.imap.port,
    tls: config.imap.tls,
    authTimeout: 10000,
  },
};

export const checkForNewProposals = async () => {
  let connection;
  
  try {
    logger.info('Connecting to IMAP server...');
    connection = await imaps.connect(imapConfig);
    
    await connection.openBox('INBOX');
    
    // Search for unread emails
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false,
    };
    
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    logger.info(`Found ${messages.length} unread emails`);
    
    for (const message of messages) {
      try {
        await processEmail(message, connection);
      } catch (error) {
        logger.error('Error processing email:', error);
      }
    }
    
    connection.end();
    
    return {
      success: true,
      processedCount: messages.length,
    };
    
  } catch (error) {
    logger.error('Error checking emails:', error);
    if (connection) connection.end();
    throw error;
  }
};

const processEmail = async (message, connection) => {
  try {
    const all = message.parts.find(part => part.which === '');
    const id = message.attributes.uid;
    const idHeader = `Imap-Id: ${id}\r\n`;
    
    const parsed = await simpleParser(idHeader + all.body);
    
    const subject = parsed.subject || '';
    const from = parsed.from?.value[0]?.address || '';
    const textBody = parsed.text || '';
    
    logger.info(`Processing email from ${from}, subject: ${subject}`);
    
    // Extract RFP reference from subject
    const rfpMatch = subject.match(/RFP-([A-F0-9]+)/i);
    if (!rfpMatch) {
      logger.info('No RFP reference found in subject, skipping');
      return;
    }
    
    const rfpReference = rfpMatch[0];
    const rfpIdPrefix = rfpMatch[1].toLowerCase();
    
    // Find RFP by ID prefix
    const rfp = await prisma.rFP.findFirst({
      where: {
        id: {
          startsWith: rfpIdPrefix,
        },
      },
      include: {
        items: true,
      },
    });
    
    if (!rfp) {
      logger.info(`RFP not found for reference ${rfpReference}`);
      return;
    }
    
    // Find vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email: from },
    });
    
    if (!vendor) {
      logger.info(`Vendor not found for email ${from}`);
      return;
    }
    
    // Check if proposal already exists
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        rfpId_vendorId: {
          rfpId: rfp.id,
          vendorId: vendor.id,
        },
      },
    });
    
    if (existingProposal) {
      logger.info('Proposal already exists, skipping');
      return;
    }
    
    logger.info(`Processing proposal from ${vendor.name} for RFP ${rfp.title}`);
    
    // Create initial proposal
    const proposal = await prisma.proposal.create({
      data: {
        rfpId: rfp.id,
        vendorId: vendor.id,
        subject,
        rawResponse: textBody,
        emailMessageId: parsed.messageId,
        status: PROPOSAL_STATUS.PARSING,
      },
    });
    
    // Parse proposal with AI
    try {
      const parsedData = await parseProposalFromEmail(textBody, rfp);
      
      // Update proposal with parsed data
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          parsedData,
          totalPrice: parsedData.totalPrice,
          deliveryTimeline: parsedData.deliveryTimeline,
          paymentTerms: parsedData.paymentTerms,
          warrantyOffered: parsedData.warrantyOffered,
          additionalNotes: parsedData.additionalNotes,
          status: PROPOSAL_STATUS.PARSED,
        },
      });
      
      // Create proposal items
      if (parsedData.items && parsedData.items.length > 0) {
        for (const item of parsedData.items) {
          // Try to match with RFP item
          const rfpItem = rfp.items.find(
            ri => ri.itemType.toLowerCase() === item.itemType.toLowerCase()
          );
          
          await prisma.proposalItem.create({
            data: {
              proposalId: proposal.id,
              rfpItemId: rfpItem?.id || null,
              itemType: item.itemType,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              specifications: item.specifications,
              notes: item.notes,
            },
          });
        }
      }
      
      // Update RFP status
      await prisma.rFP.update({
        where: { id: rfp.id },
        data: { status: 'RESPONSES_RECEIVED' },
      });
      
      // Mark email as seen
      await connection.addFlags(message.attributes.uid, ['\\Seen']);
      
      logger.info(`Successfully processed proposal from ${vendor.name}`);
      
    } catch (parseError) {
      logger.error('Error parsing proposal:', parseError);
      
      // Update proposal with error status
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          status: PROPOSAL_STATUS.RECEIVED,
          additionalNotes: `Parsing failed: ${parseError.message}`,
        },
      });
    }
    
  } catch (error) {
    logger.error('Error in processEmail:', error);
    throw error;
  }
};

// Start polling for emails every 2 minutes
export const startEmailPolling = (intervalMinutes = 2) => {
  logger.info(`Starting email polling every ${intervalMinutes} minutes`);
  
  // Run immediately
  checkForNewProposals().catch(error => {
    logger.error('Initial email check failed:', error);
  });
  
  // Then run on interval
  setInterval(() => {
    checkForNewProposals().catch(error => {
      logger.error('Email polling failed:', error);
    });
  }, intervalMinutes * 60 * 1000);
};