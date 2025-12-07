import { prisma } from '../lib/prisma.js';
import { parseRFPFromNaturalLanguage } from './ai/rfpParser.js';
import { RFP_STATUS } from '../utils/constants.js';
import logger from '../config/logger.js';

export const createRFP = async (naturalLanguageInput) => {
  try {
    // Parse natural language to structured data
    const parsedData = await parseRFPFromNaturalLanguage(naturalLanguageInput);
    
    // Create RFP
    const rfp = await prisma.rFP.create({
      data: {
        title: parsedData.title,
        description: parsedData.description,
        rawRequirements: naturalLanguageInput,
        structuredData: parsedData,
        budget: parsedData.budget,
        deadline: parsedData.deadline ? new Date(parsedData.deadline) : null,
        deliveryDeadline: parsedData.deliveryDeadline ? new Date(parsedData.deliveryDeadline) : null,
        paymentTerms: parsedData.paymentTerms,
        warrantyRequirements: parsedData.warrantyRequirements,
        additionalTerms: parsedData.additionalTerms,
        status: RFP_STATUS.DRAFT,
      },
    });
    
    // Create RFP items
    if (parsedData.items && parsedData.items.length > 0) {
      const items = await Promise.all(
        parsedData.items.map(item =>
          prisma.rFPItem.create({
            data: {
              rfpId: rfp.id,
              itemType: item.itemType,
              quantity: item.quantity,
              specifications: item.specifications,
              unitBudget: item.unitBudget,
            },
          })
        )
      );
      
      logger.info(`Created RFP with ${items.length} items`);
    }
    
    // Fetch complete RFP with items
    const completeRFP = await prisma.rFP.findUnique({
      where: { id: rfp.id },
      include: {
        items: true,
      },
    });
    
    return completeRFP;
    
  } catch (error) {
    logger.error('Error creating RFP:', error);
    throw error;
  }
};

export const getAllRFPs = async () => {
  return await prisma.rFP.findMany({
    include: {
      items: true,
      proposals: {
        include: {
          vendor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getRFPById = async (id) => {
  const rfp = await prisma.rFP.findUnique({
    where: { id },
    include: {
      items: true,
      proposals: {
        include: {
          vendor: true,
          proposalItems: true,
        },
      },
      rfpVendors: {
        include: {
          vendor: true,
        },
      },
    },
  });
  
  if (!rfp) {
    throw new Error('RFP not found');
  }
  
  return rfp;
};

export const updateRFP = async (id, updateData) => {
  return await prisma.rFP.update({
    where: { id },
    data: updateData,
    include: {
      items: true,
    },
  });
};

export const deleteRFP = async (id) => {
  return await prisma.rFP.delete({
    where: { id },
  });
};