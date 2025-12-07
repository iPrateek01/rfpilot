export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const generateRFPReference = (id) => {
  return `RFP-${id.substring(0, 8).toUpperCase()}`;
};

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));