// vvalidator.js
import {ref} from 'vue';

const VERSION = "1.0"

/**
 * * V-Validator *
 * 
 * A class to handle object validation with built-in and custom validation functions.
 * Requires Vue3
 *
 * --- === --- --- === --- --- === --- --- === --- --- === --- --- === --- --- === ---
 * = API =
 * 
 * *new Validator(obj = { validations:{}, fieldNames: {}}, refState=null)
 * - - obj.validations: object of fields to validate
 * - - obj.fieldNames: object of the fields name
 * - - obj.refState: object containing the data to validate. It will build the data to validate at #validate(null)
 * 
 * *validate(data:{}) -> [validated:bool, errorMap:object]
 * Run the validation against the data
 * Returns a tuple, 1st element is return if the validations succeed, errorMap the map of the validations:{} with null or string. 
 * 
 * *get(field) -> null|string
 * Get the error for a field name 
 * Returns a null, as no error - string when error
 * 
 * *clear()
 * Clear the errors 
 * 
 * --- === --- --- === --- --- === --- --- === --- --- === --- --- === --- --- === ---
 * 
 * Example usage:
 * 
 * const validator = new Validator();
 * 
 * // Define and add custom validation functions
 * const isPositiveNumber = (value) => value > 0 ? true : 'Must be a positive number';
 * validator.addCustomValidation('isPositiveNumber', isPositiveNumber);
 * 
 * // Define validation rules
 * validator.setValidations({
 *   email: ['required', 'email'],
 *   name: ['required', 'name', 'minLength(3)', 'maxLength(50)'],
 *   age: ['required', 'integer', 'minValue(1)', 'maxValue(120)'],
 *   phone: ['required', 'phoneNumber'],
 *   username: ['required', 'username'],
 *   urlField: ['required', 'url'],
 *   alphaField: ['alpha'],
 *   numericField: ['numeric'],
 *   alphanumField: ['alphanum'],
 *   decimalField: ['decimal'],
 *   confirmPassword: ['required', 'sameAs(password)'],
 *   requiredUnlessField: ['requiredUnless(otherField, value)'],
 *   requiredIfField: ['requiredIf(otherField, value)']
 * });
 * 
 * // Set custom field names for error messages
 * validator.setFieldNames({
 *   email: 'Email Address',
 *   name: 'Full Name',
 *   age: 'Age',
 *   phone: 'Phone Number',
 *   username: 'Username',
 *   urlField: 'Website URL',
 *   alphaField: 'Alphabetic Field',
 *   numericField: 'Numeric Field',
 *   alphanumField: 'Alphanumeric Field',
 *   decimalField: 'Decimal Field',
 *   confirmPassword: 'Confirm Password',
 *   requiredUnlessField: 'Required Unless',
 *   requiredIfField: 'Required If'
 * });
 * 
 * const data = {
 *   name: 'Jo',
 *   age: 25,
 *   email: 'invalid-email',
 *   phone: '+1234567890',
 *   username: 'user_name',
 *   urlField: 'https://example.com',
 *   alphaField: 'abc',
 *   numericField: '123',
 *   alphanumField: 'abc123',
 *   decimalField: '12.34',
 *   confirmPassword: 'password123',
 *   requiredUnlessField: '', // Dependent on otherField value
 *   requiredIfField: '' // Dependent on otherField value
 * };
 * 
 * const [validated, objectMap] = validator.validate(data);
 * 
 * if (validated) {
 *   console.log('Validation passed!');
 * } else {
 *   console.log('Validation errors:', objectMap);
 * }
 * 
 * To get individual error:
 * validator.get(field) -> null|string
 * 
 * To clear errors:
 * validator.clear() -> null
 *
 * Validators:
 * - `required`: Ensures the field is not empty. Example: `['required']`.
 * - `isNumber`: Ensures the field is a number. Example: `['isNumber']`.
 * - `isString`: Ensures the field is a string. Example: `['isString']`.
 * - `minLength(min)`: Ensures the string is at least `min` characters long. Example: `['minLength(3)']`.
 * - `maxLength(max)`: Ensures the string is no more than `max` characters long. Example: `['maxLength(50)']`.
 * - `email`: Ensures the field contains a valid email address. Example: `['email']`.
 * - `phoneNumber`: Ensures the field contains a valid phone number. Example: `['phoneNumber']`.
 * - `name`: Ensures the field contains only letters, numbers and spaces. Example: `['name']`.
 * - `username`: Ensures the field contains only letters, numbers, and underscores. Example: `['username']`.
 * - `alpha`: Ensures the field contains only letters. Example: `['alpha']`.
 * - `numeric`: Ensures the field contains only numbers. Example: `['numeric']`.
 * - `alphanum`: Ensures the field contains only alphanumeric characters. Example: `['alphanum']`.
 * - `decimal`: Ensures the field contains a decimal number. Example: `['decimal']`.
 * - `sameAs(field)`: Ensures the field is the same as another field. Example: `['sameAs(password)']`.
 * - `minValue(min)`: Ensures the field value is at least `min`. Example: `['minValue(1)']`.
 * - `maxValue(max)`: Ensures the field value is no more than `max`. Example: `['maxValue(120)']`.
 * - `url`: Ensures the field contains a valid URL. Example: `['url']`.
 * - `integer`: Ensures the field contains an integer. Example: `['integer']`.
 * - `requiredUnless(field, value)`: Ensures the field is required unless another field equals a certain value. Example: `['requiredUnless(otherField, value)']`.
 * - `requiredIf(field, value)`: Ensures the field is required if another field equals a certain value. Example: `['requiredIf(otherField, value)']`.
 */
class Validator {

  /**
   * Creates an instance of VValidator.
   * @param Object obj
   * @param Object obj.validations - 
   * @param Object obj.fieldNames - object 
   * @param Object refState - object
   */
  constructor(obj = { validations:{}, fieldNames: {}}, refState={}) {
    this.validations = obj?.validations || {}; // object of type of fields to validate
    this.fieldNames = obj?.fieldNames || {}; // object of field names to set the errors
    this.errors = ref({});
    this._refState = refState

    // Set default validation functions
    this.defaultValidations = {
      required: (value) => value != null && value !== '' ? true : 'Field is required',
      isNumber: (value) => typeof value === 'number' ? true : 'Must be a number',
      isString: (value) => typeof value === 'string' ? true : 'Must be a string',
      minLength: (min) => (value) => typeof value === 'string' && value.length >= min ? true : `Must be at least ${min} characters long`,
      maxLength: (max) => (value) => typeof value === 'string' && value.length <= max ? true : `Must be no more than ${max} characters long`,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? true : 'Must be a valid email address',
      phoneNumber: (value) => /^\+?[1-9]\d{1,14}$/.test(value) ? true : 'Must be a valid phone number',
      name: (value) => /^[a-zA-Z0-9\s]+$/.test(value) ? true : 'Name must contain only letters, numbers and spaces',
      username: (value) => /^[a-zA-Z0-9_]+$/.test(value) ? true : 'Username can only contain letters, numbers, and underscores',
      alpha: (value) => /^[a-zA-Z]+$/.test(value) ? true : 'Must contain only letters',
      numeric: (value) => /^[0-9]+$/.test(value) ? true : 'Must be numeric',
      alphanum: (value) => /^[a-zA-Z0-9]+$/.test(value) ? true : 'Must be alphanumeric',
      decimal: (value) => /^-?\d+(\.\d+)?$/.test(value) ? true : 'Must be a decimal number',
      sameAs: (field) => (value, obj) => value === obj[field] ? true : `Must be the same as ${field}`,
      minValue: (min) => (value) => value >= min ? true : `Must be at least ${min}`,
      maxValue: (max) => (value) => value <= max ? true : `Must be no more than ${max}`,
      url: (value) => /^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(value) ? true : 'Must be a valid URL',
      integer: (value) => Number.isInteger(value) ? true : 'Must be an integer',
      requiredUnless: (field, value) => (inputValue, obj) => obj[field] !== value ? this.defaultValidations.required(inputValue) : true,
      requiredIf: (field, value) => (inputValue, obj) => obj[field] === value ? this.defaultValidations.required(inputValue) : true
    };
  }

  /**
   * Sets validation rules for multiple fields.
   * @param {Object} validations - An object where keys are field names and values are arrays of validation functions.
   */
  setValidations(validations) {
    this.validations = validations;
  }

  /**
   * Adds a custom validation function.
   * @param {string} name - The name of the custom validation function.
   * @param {function} func - The custom validation function.
   */
  addCustomValidation(name, func) {
    this[name] = func;
  }

  /**
   * Sets custom field names for error messages.
   * @param {Object} fieldNames - An object where keys are field names and values are their display names.
   */
  setFieldNames(fieldNames) {
    this.fieldNames = fieldNames;
  }

  /**
   * Validates an object based on the defined rules.
   * @param {Object} obj - The object to validate.
   * @returns {[boolean, Object]} - A tuple where the first element is `true` if validation passes, `false` otherwise,
   * and the second element is an object mapping field names to error messages or field values if valid.
   */
  validate(obj=null) {

    let data = obj
    /**
     * When refState is available, it can automatically validate 
     * without passing the data, as it will build the data on the fly
     * in this instance
     * $Validator.validate()
     */
    if (data === null && this._refState) {
      data = {}
      for (const k of Object.keys(this.validations)) {
        data[k] = this._refState?.[k]
      }
    }

    // clear errors
    this.clear()

    const errors = {};
  
    for (const [field, rules] of Object.entries(this.validations)) {
      const value = data[field];
      for (const rule of rules) {
        // Extract validation function and parameter from rule
        const [validation, param] = rule.split(/(?=\()/);
        const validatorName = validation.replace(/\(.*\)/, ''); // Remove parameters from function name
        const paramValue = param ? param.replace(/[()]/g, '') : undefined;
  
        // Get the appropriate validator
        const validator = this.defaultValidations[validatorName] || this[validatorName];
        if (!validator) {
          throw new Error(`Unknown validation function: ${validatorName}`);
        }
  
        // Execute the validator function
        let result;
        if (paramValue !== undefined) {
          result = validator(paramValue)(value, data);
        } else {
          result = validator(value, data);
        }
  
        if (result !== true) {
          errors[field] = (this.fieldNames[field] || field) + ' ' + result;
          break; // Stop validating this field on the first error
        }
      }
    }
  
    // Create resultMap with all fields, setting to null if valid or error string if invalid
    const resultMap = Object.keys(data).reduce((map, field) => {
      map[field] = errors[field] || null;
      return map;
    }, {});
  
    // Set the error on the class
    this.errors.value = resultMap

    // Return [true, resultMap] if no errors; otherwise [false, resultMap]
    return [Object.keys(errors).length === 0, resultMap];
  }

  /**
   * Return null or the error of the field
   * @param field 
   * @returns string|null
   */
  get(field) {
    return this.errors?.value?.[field]
  }

  /**
   * Clear errors
   */
  clear() {
    this.errors.value = {}
  }
  
}

export default Validator;




const DEFAULT_PASSWORD_POLICY = {
  LENGTH: [8, 64],
  SYMBOLS: true,
  NUMBERS: true,
  LOWERCASE: false,
  UPPERCASE: false
}
/**
 * Validates a password based on a provided password policy.
 *
 * @param {string} password - The password string to validate.
 * @param {Object} [policy] - An optional password policy object.
 * @param {Array<number>} [policy.LENGTH=[8, 64]] - Minimum and maximum password lengths.
 * @param {boolean} [policy.SYMBOLS=true] - Whether at least one symbol is required.
 * @param {boolean} [policy.NUMBERS=true] - Whether at least one number is required.
 * @param {boolean} [policy.LOWERCASE=false] - Whether at least one lowercase letter is required.
 * @param {boolean} [policy.UPPERCASE=false] - Whether at least one uppercase letter is required.
 * @returns {true|string} - Returns true if the password is valid, otherwise returns an error message.
 */
export function validatePasswordPolicy(password, policy = {}) {

    // Merge default policy with the provided policy
    const passwordPolicy = { ...DEFAULT_PASSWORD_POLICY, ...policy };

    // Destructure policy for easier access
    const { LENGTH, SYMBOLS, NUMBERS, LOWERCASE, UPPERCASE } = passwordPolicy;
    const [minLength, maxLength] = LENGTH;

    // 1. Check password length
    if (password.length < minLength || password.length > maxLength) {
        return `must be between ${minLength} and ${maxLength} characters long.`;
    }

    // 2. Check for at least one number
    if (NUMBERS && !/\d/.test(password)) {
        return "must contain at least one number.";
    }

    // 3. Check for at least one symbol
    // You can adjust the symbol set as per your requirements
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (SYMBOLS && !symbolRegex.test(password)) {
        return "must contain at least one symbol (e.g., !, @, #, etc.).";
    }

    // 4. Check for at least one lowercase letter (if required)
    if (LOWERCASE && !/[a-z]/.test(password)) {
        return "must contain at least one lowercase letter.";
    }

    // 5. Check for at least one uppercase letter (if required)
    if (UPPERCASE && !/[A-Z]/.test(password)) {
        return "must contain at least one uppercase letter.";
    }

    // If all validations pass
    return true;
}



/**
 * Generates a sophisticated and user-friendly password hint based on the provided password policy.
 *
 * @param {Object} policy - The password policy object.
 * @param {Array<number>} [policy.LENGTH=[8, 64]] - Minimum and maximum password lengths.
 * @param {boolean} [policy.SYMBOLS=true] - Whether at least one special character is required.
 * @param {boolean} [policy.NUMBERS=true] - Whether at least one number is required.
 * @param {boolean} [policy.LOWERCASE=false] - Whether at least one lowercase letter is required.
 * @param {boolean} [policy.UPPERCASE=false] - Whether at least one uppercase letter is required.
 * @returns {string} - A concise string containing the password requirements.

const customPolicy = {
  LENGTH: [10, 20],
  SYMBOLS: true,
  NUMBERS: true,
  LOWERCASE: true,
  UPPERCASE: true
};

// Output: "Password must be between 10 and 20 characters with lowercase letters, uppercase letters, numbers, and special characters."

*/
export function generatePasswordPolicyHint(policy = {}) {

  // Merge default policy with the provided policy
  const passwordPolicy = { ...DEFAULT_PASSWORD_POLICY, ...policy };

  const { LENGTH, SYMBOLS, NUMBERS, LOWERCASE, UPPERCASE } = passwordPolicy;
  const [minLength, maxLength] = LENGTH;

  // Construct the length requirement part
  let lengthPart = "";
  if (minLength && maxLength) {
      if (minLength === maxLength) {
          lengthPart = `exactly ${minLength} characters`;
      } else {
          lengthPart = `between ${minLength} and ${maxLength} characters`;
      }
  } else if (minLength) {
      lengthPart = `at least ${minLength} characters`;
  } else if (maxLength) {
      lengthPart = `no more than ${maxLength} characters`;
  }

  // Initialize an array to hold character type requirements
  const charTypes = [];

  if (LOWERCASE) charTypes.push("lowercase letters");
  if (UPPERCASE) charTypes.push("uppercase letters");
  if (NUMBERS) charTypes.push("numbers");
  if (SYMBOLS) charTypes.push("special characters");

  // Construct the character types part
  let charTypesPart = "";
  if (charTypes.length > 0) {
      // Format the character types with proper punctuation
      if (charTypes.length === 1) {
          charTypesPart = ` with ${charTypes[0]}`;
      } else if (charTypes.length === 2) {
          charTypesPart = ` with ${charTypes[0]} and ${charTypes[1]}`;
      } else {
          const lastType = charTypes.pop();
          charTypesPart = ` with ${charTypes.join(", ")}, and ${lastType}`;
      }
  }

  // Combine length and character types parts
  const hint = ` must be ${lengthPart}${charTypesPart}.`;

  return hint;
}


