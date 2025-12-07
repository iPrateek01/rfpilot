import express from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { checkForNewProposals } from '../services/email/receiver.js';

const router = express.Router();

// Manual trigger to check for new emails
router.post(
  '/check',
  asyncHandler(async (req, res) => {
    const result = await checkForNewProposals();
    
    res.json({
      success: true,
      data: result,
      message: `Checked emails, processed ${result.processedCount} messages`,
    });
  })
);

export default router;