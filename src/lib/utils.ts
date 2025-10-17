
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function isObject(value: any): value is Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function defaultsDeep(obj: any, defaults: any): any {
  if (!isObject(obj)) {
    return defaults;
  }

  const output = { ...obj };

  for (const key in defaults) {
    if (isObject(defaults[key])) {
      output[key] = defaultsDeep(output[key], defaults[key]);
    } else if (output[key] === undefined) {
      output[key] = defaults[key];
    }
  }

  // Ensure all keys from defaults are present in arrays of objects
  if (Array.isArray(defaults) && Array.isArray(output)) {
      return output.map(item => defaultsDeep(item, defaults[0] || {}));
  }

  // This handles the case where the top-level structure has arrays (like education)
  for (const key in defaults) {
    if(Array.isArray(defaults[key]) && Array.isArray(output[key])) {
      output[key] = output[key].map((item: any) => defaultsDeep(item, defaults[key][0] || {}));
    }
  }


  return output;
}
