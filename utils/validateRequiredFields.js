
/**
 * Validates that all required fields are present in the request body.
 * @param {Array<string>} fields - The required field names.
 * @param {Object} body - The request body containing the fields to be validated.
 * @returns {Array<string>|null} - Returns an array of missing fields, or null if all fields are present.
 */


export function validateRequiredFields(fields, body) {
  const missingFields = fields.filter(field => !body[field]);
  return missingFields.length > 0 ? missingFields : null;
}
