import { prisma } from '../lib/prisma.js';
import { evaluateProposals } from './ai/evaluator.js';
import logger from '../config/logger.js';

export const getProposalsByRFP = async (rfpId) => {
  return await prisma.proposal.findMany({
    where: { rfpId },
    include: {
      vendor: true,
      proposalItems: true,
      attachments: true,
    },
    orderBy: {
      receivedAt: 'desc',
    },
  });
};

export const getProposalById = async (id) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      vendor: true,
      rfp: {
        include: {
          items: true,
        },
      },
      proposalItems: {
        include: {
          rfpItem: true,
        },
      },
      attachments: true,
    },
  });
  
  if (!proposal) {
    throw new Error('Proposal not found');
  }
  
  return proposal;
};

export const evaluateRFPProposals = async (rfpId) => {
  try {
    // Get RFP with all proposals
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
      include: {
        items: true,
        proposals: {
          include: {
            vendor: true,
            proposalItems: true,
          },
        },
      },
    });
    
    if (!rfp) {
      throw new Error('RFP not found');
    }
    
    if (rfp.proposals.length === 0) {
      throw new Error('No proposals to evaluate');
    }
    
    logger.info(`Evaluating ${rfp.proposals.length} proposals for RFP ${rfp.id}`);
    
    // Use AI to evaluate
    const evaluation = await evaluateProposals(rfp, rfp.proposals);
    
    // Update proposals with scores
    for (const evalItem of evaluation.evaluations) {
      const proposal = rfp.proposals.find(p => p.vendorId === evalItem.vendorId);
      
      if (proposal) {
        await prisma.proposal.update({
          where: { id: proposal.id },
          data: {
            aiScore: evalItem.overallScore,
            priceScore: evalItem.priceScore,
            complianceScore: evalItem.complianceScore,
            termsScore: evalItem.termsScore,
            aiEvaluation: evalItem.evaluation,
            status: 'EVALUATED',
            evaluatedAt: new Date(),
          },
        });
      }
    }
    
    // Update RFP status
    await prisma.rFP.update({
      where: { id: rfpId },
      data: { status: 'EVALUATED' },
    });
    
    logger.info(`Evaluation completed for RFP ${rfp.id}`);
    
    return evaluation;
    
  } catch (error) {
    logger.error('Error evaluating proposals:', error);
    throw error;
  }
};

export const compareProposals = async (rfpId) => {
  const proposals = await getProposalsByRFP(rfpId);
  
  if (proposals.length === 0) {
    return {
      proposals: [],
      summary: 'No proposals received yet',
    };
  }
  
  // Calculate comparison metrics
  const prices = proposals.map(p => p.totalPrice).filter(p => p !== null);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const comparison = proposals.map(p => ({
    id: p.id,
    vendor: p.vendor,
    totalPrice: p.totalPrice,
    deliveryTimeline: p.deliveryTimeline,
    paymentTerms: p.paymentTerms,
    warrantyOffered: p.warrantyOffered,
    aiScore: p.aiScore,
    priceScore: p.priceScore,
    complianceScore: p.complianceScore,
    termsScore: p.termsScore,
    status: p.status,
    receivedAt: p.receivedAt,
    items: p.proposalItems,
  }));
  
  return {
    proposals: comparison,
    summary: {
      totalProposals: proposals.length,
      averagePrice: avgPrice,
      minPrice,
      maxPrice,
      priceRange: maxPrice - minPrice,
    },
  };
};