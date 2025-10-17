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

  return output;
}
