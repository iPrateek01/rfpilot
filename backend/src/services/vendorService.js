import { prisma } from '../lib/prisma.js';
import logger from '../config/logger.js';

export const createVendor = async (vendorData) => {
  try {
    const vendor = await prisma.vendor.create({
      data: {
        name: vendorData.name,
        email: vendorData.email,
        contactPerson: vendorData.contactPerson,
        phone: vendorData.phone,
        address: vendorData.address,
        specializations: vendorData.specializations || [],
        notes: vendorData.notes,
        isActive: true,
      },
    });
    
    logger.info(`Created vendor: ${vendor.name}`);
    return vendor;
    
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Vendor with this email already exists');
    }
    throw error;
  }
};

export const getAllVendors = async () => {
  return await prisma.vendor.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const getVendorById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      proposals: {
        include: {
          rfp: true,
        },
      },
    },
  });
  
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  
  return vendor;
};

export const updateVendor = async (id, updateData) => {
  return await prisma.vendor.update({
    where: { id },
    data: updateData,
  });
};

export const deleteVendor = async (id) => {
  // Soft delete
  return await prisma.vendor.update({
    where: { id },
    data: { isActive: false },
  });
};