import express from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { validate, schemas } from '../middleware/validator.js';
import * as rfpService from '../services/rfpService.js';
import { sendEmail } from '../services/email/sender.js';
import { generateRFPEmailTemplate } from '../services/email/template.js';
import { prisma } from '../lib/prisma.js';
import logger from '../config/logger.js';

const router = express.Router();

// Create RFP from natural language
router.post(
  '/',
  validate(schemas.createRFP),
  asyncHandler(async (req, res) => {
    const { requirements } = req.body;
    
    const rfp = await rfpService.createRFP(requirements);
    
    res.status(201).json({
      success: true,
      data: rfp,
      message: 'RFP created successfully',
    });
  })
);

// Get all RFPs
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rfps = await rfpService.getAllRFPs();
    
    res.json({
      success: true,
      data: rfps,
      count: rfps.length,
    });
  })
);

// Get single RFP
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rfp = await rfpService.getRFPById(req.params.id);
    
    res.json({
      success: true,
      data: rfp,
    });
  })
);

// Update RFP
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const rfp = await rfpService.updateRFP(req.params.id, req.body);
    
    res.json({
      success: true,
      data: rfp,
      message: 'RFP updated successfully',
    });
  })
);

// Delete RFP
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await rfpService.deleteRFP(req.params.id);
    
    res.json({
      success: true,
      message: 'RFP deleted successfully',
    });
  })
);

// Send RFP to vendors
router.post(
  '/:id/send',
  validate(schemas.sendRFP),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { vendorIds } = req.body;
    
    // Get RFP with items
    const rfp = await rfpService.getRFPById(id);
    
    // Get vendors
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
        isActive: true,
      },
    });
    
    if (vendors.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No valid vendors found' },
      });
    }
    
    const results = [];
    
    // Send to each vendor
    for (const vendor of vendors) {
      try {
        const emailTemplate = generateRFPEmailTemplate(rfp, vendor);
        const emailResult = await sendEmail({
          to: vendor.email,
          subject: emailTemplate.subject,
          body: emailTemplate.body,
        });
        
        // Create or update RFPVendor record
        await prisma.rFPVendor.upsert({
          where: {
            rfpId_vendorId: {
              rfpId: id,
              vendorId: vendor.id,
            },
          },
          create: {
            rfpId: id,
            vendorId: vendor.id,
            emailSent: true,
            sentAt: new Date(),
            emailMessageId: emailResult.messageId,
          },
          update: {
            emailSent: true,
            sentAt: new Date(),
            emailMessageId: emailResult.messageId,
          },
        });
        
        // Create email thread
        await prisma.emailThread.upsert({
          where: {
            rfpId_vendorId: {
              rfpId: id,
              vendorId: vendor.id,
            },
          },
          create: {
            rfpId: id,
            vendorId: vendor.id,
            subject: emailTemplate.subject,
            lastMessageId: emailResult.messageId,
            lastMessageAt: new Date(),
            messageCount: 1,
          },
          update: {
            lastMessageId: emailResult.messageId,
            lastMessageAt: new Date(),
            messageCount: { increment: 1 },
          },
        });
        
        results.push({
          vendor: vendor.name,
          email: vendor.email,
          success: true,
          messageId: emailResult.messageId,
        });
        
        logger.info(`RFP sent to ${vendor.email}`);
        
      } catch (error) {
        logger.error(`Failed to send RFP to ${vendor.email}:`, error);
        results.push({
          vendor: vendor.name,
          email: vendor.email,
          success: false,
          error: error.message,
        });
      }
    }
    
    // Update RFP status
    await prisma.rFP.update({
      where: { id },
      data: { status: 'SENT' },
    });
    
    res.json({
      success: true,
      data: {
        rfpId: id,
        sentCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
        results,
      },
      message: `RFP sent to ${results.filter(r => r.success).length} vendors`,
    });
  })
);

export default router;