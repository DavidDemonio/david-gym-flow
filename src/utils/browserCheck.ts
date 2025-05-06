
/**
 * Utility for checking browser capabilities and features
 */

/**
 * Checks if the current environment supports the required APIs
 */
export function checkEnvironmentSupport(): { 
  supported: boolean; 
  features: { [key: string]: boolean };
} {
  const features = {
    localStorage: typeof window !== 'undefined' && !!window.localStorage,
    fetch: typeof window !== 'undefined' && !!window.fetch,
    json: typeof JSON !== 'undefined',
    cors: typeof window !== 'undefined' && 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest(),
  };
  
  const supported = Object.values(features).every(Boolean);
  
  return {
    supported,
    features
  };
}

/**
 * Checks if running in a development environment
 */
export function isDevelopmentMode(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
}

/**
 * Checks if running in a production environment
 */
export function isProductionMode(): boolean {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
}

/**
 * Checks if MySQL support is available in the current environment
 * (Only available in Node.js environments, not in browsers directly)
 */
export function isMySQLSupported(): boolean {
  // In browser environments, direct MySQL is not supported
  // We use a backend API instead
  return false;
}

/**
 * Checks if SMTP/Email support is available in the current environment
 * (Only available in Node.js environments, not in browsers directly)
 */
export function isEmailSupported(): boolean {
  // In browser environments, direct SMTP is not supported
  // We use a backend API instead
  return false;
}
