import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors,
        },
      });
    }
    
    next();
  };
};

// Validation schemas
export const schemas = {
  createRFP: Joi.object({
    requirements: Joi.string().required().min(10),
  }),
  
  createVendor: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    contactPerson: Joi.string().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    specializations: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional(),
  }),
  
  sendRFP: Joi.object({
    vendorIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),
};