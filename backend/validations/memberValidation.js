const Joi = require('joi');

const addMemberSchema = Joi.object({
  family_id: Joi.string().required(),
  name: Joi.string().required(),
  dob: Joi.date().iso().allow('', null),
  marital_status: Joi.string().allow('', null),
  relationship: Joi.string().allow('', null),
  qualification: Joi.string().allow('', null),
  profession: Joi.string().allow('', null),
  residing_here: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).default(true),
  church_group: Joi.string().allow('', null),
  active: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).default(true),
  baptism_date: Joi.date().iso().allow('', null),
  baptism_place: Joi.string().allow('', null),
  holy_communion_date: Joi.date().iso().allow('', null),
  holy_communion_place: Joi.string().allow('', null),
  confirmation_date: Joi.date().iso().allow('', null),
  confirmation_place: Joi.string().allow('', null),
  marriage_date: Joi.date().iso().allow('', null),
  marriage_place: Joi.string().allow('', null),
  sex: Joi.string().allow('', null),
  mobile: Joi.string().allow('', null)
}).unknown(true);

module.exports = {
  addMemberSchema,
};
