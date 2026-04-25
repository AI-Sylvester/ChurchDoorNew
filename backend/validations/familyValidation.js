const Joi = require('joi');

const createFamilySchema = Joi.object({
  head_name: Joi.string().required(),
  address_line1: Joi.string().allow('', null),
  address_line2: Joi.string().allow('', null),
  city: Joi.string().required(),
  pincode: Joi.string().allow('', null),
  mobile_number: Joi.string().required(),
  mobile_number2: Joi.string().allow('', null),
  cemetery: Joi.string().allow('', null),
  native: Joi.string().allow('', null),
  resident_from: Joi.string().allow('', null),
  house_type: Joi.string().allow('', null),
  subscription: Joi.string().allow('', null),
  active: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).default(true),
  location: Joi.string().allow('', null),
  anbiyam: Joi.string().allow('', null),
  cemetery_number: Joi.string().allow('', null),
  old_card_number: Joi.string().allow('', null),
}).unknown(true); // Allow unknown fields like file uploads handling

module.exports = {
  createFamilySchema,
};
