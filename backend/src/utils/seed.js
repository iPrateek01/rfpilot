import { prisma } from '../lib/prisma.js';
import logger from '../config/logger.js';

async function seed() {
  try {
    logger.info('Starting database seed...');
    
    // Create sample vendors
    const vendors = await Promise.all([
      prisma.vendor.create({
        data: {
          name: 'TechSupply Co',
          email: 'prateek_655@live.com',
          contactPerson: 'John Smith',
          phone: '+1-555-0101',
          address: '123 Tech Street, Silicon Valley, CA 94025',
          specializations: ['Laptops', 'Computers', 'Electronics'],
          rating: 4.5,
          notes: 'Reliable vendor for computer equipment',
        },
      }),
      prisma.vendor.create({
        data: {
          name: 'Office Solutions Inc',
          email: 'contact@officesolutions.com',
          contactPerson: 'Sarah Johnson',
          phone: '+1-555-0102',
          address: '456 Business Ave, New York, NY 10001',
          specializations: ['Office Equipment', 'Furniture', 'Supplies'],
          rating: 4.2,
          notes: 'Good for office supplies and furniture',
        },
      }),
      prisma.vendor.create({
        data: {
          name: 'Global Electronics',
          email: 'info@globalelectronics.com',
          contactPerson: 'Mike Chen',
          phone: '+1-555-0103',
          address: '789 Market St, San Francisco, CA 94103',
          specializations: ['Electronics', 'Monitors', 'Accessories'],
          rating: 4.8,
          notes: 'Premium electronics supplier',
        },
      }),
    ]);
    
    logger.info(`✅ Created ${vendors.length} vendors`);
    
    logger.info('Seed completed successfully!');
    
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();