import express from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { validate, schemas } from '../middleware/validator.js';
import * as vendorService from '../services/vendorService.js';

const router = express.Router();

// Create vendor
router.post(
  '/',
  validate(schemas.createVendor),
  asyncHandler(async (req, res) => {
    const vendor = await vendorService.createVendor(req.body);
    
    res.status(201).json({
      success: true,
      data: vendor,
      message: 'Vendor created successfully',
    });
  })
);

// Get all vendors
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const vendors = await vendorService.getAllVendors();
    
    res.json({
      success: true,
      data: vendors,
      count: vendors.length,
    });
  })
);

// Get single vendor
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    
    res.json({
      success: true,
      data: vendor,
    });
  })
);

// Update vendor
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const vendor = await vendorService.updateVendor(req.params.id, req.body);
    
    res.json({
      success: true,
      data: vendor,
      message: 'Vendor updated successfully',
    });
  })
);

// Delete vendor (soft delete)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await vendorService.deleteVendor(req.params.id);
    
    res.json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  })
);

export default router;