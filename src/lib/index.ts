
// Helper function to check if a value is an object

export const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
export const isPlainObject = (value) => typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
export const isString = (value) => typeof value === 'string' || value instanceof String;
export const isEmpty = (value) => value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
export const isArray = obj => Array.isArray(obj)
export const isFn = (obj, key) => obj && typeof obj[key] === 'function';

/**
 * Helper function to handle nested properties
 */
export const getNestedProperty = (target, prop) => {
  return prop.split('.').reduce((acc, part) => acc && acc[part], target);
};

export const setNestedProperty = (target, prop, value) => {
  const parts = prop.split('.');
  const last = parts.pop();
  const nested = parts.reduce((acc, part) => {
    // Create a shallow copy to avoid mutation on frozen objects
    acc[part] = { ...acc[part] };
    return acc[part];
  }, target);
  nested[last] = value;
};

export const deleteNestedProperty = (target, prop) => {
  const parts = prop.split('.');
  const last = parts.pop();
  const nested = parts.reduce((acc, part) => acc && acc[part], target);
  if (nested && last in nested) {
    delete nested[last];
  }
};

// Main deep merge function
function _merge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (isObject(source[key]) && isObject(target[key])) {
        // Recursively merge objects
        _merge(target[key], source[key]);
      } else {
        // Assign value from source to target
        target[key] = source[key];
      }
    }
  }
}
/**
 * Deep merge object2 in object1
 * @param obj1 
 * @param obj2 
 * @returns {}
 */
export function merge(obj1, obj2) {
  const result = JSON.parse(JSON.stringify(obj1));
  _merge(result, obj2);
  return result;
}


/**
 * A function to wait until a condition is fullfilled
 * @param param0 
 * @returns 
 */
export async function waitUntil({
  condition,                // Function that returns a boolean indicating if the condition is met
  action,                   // Function to execute when the condition is met
  timeout = 5000,           // Timeout in milliseconds
  interval = 250,           // Polling interval in milliseconds
  errorMessage = 'Timeout exceeded' // Error message to throw if the timeout is reached
}) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      const result = await action(); // Await the action if it returns a promise
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(errorMessage);
}

export function toBoolean(value: any): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  } 
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === 'yes') {
      return true;
    } else if (lowerValue === 'false' || lowerValue === 'no') {
      return false;
    }
  }
  return null; // Return null for invalid values
}