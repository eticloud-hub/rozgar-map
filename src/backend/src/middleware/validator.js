const { body, param, query, validationResult } = require('express-validator');

const validateGeolocate = [
  body('lat').isFloat({ min: 6, max: 36 }).withMessage('Invalid latitude'),
  body('lon').isFloat({ min: 68, max: 97 }).withMessage('Invalid longitude'),
];

const validateReport = [
  body('message').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Message must be 10-500 characters'),
  body('district_id').optional().isInt({ min: 1 }).withMessage('Invalid district ID'),
];

const validateDistrictId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid district ID')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateGeolocate,
  validateReport,
  validateDistrictId,
  handleValidationErrors
};
