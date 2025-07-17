// Frontend Configuration Management
export interface AppConfig {
  // API Configuration
  apiUrl: string;
  apiTimeout: number;
  
  // Application Configuration
  appName: string;
  appVersion: string;
  appEnvironment: string;
  
  // Authentication Configuration
  authStorageKey: string;
  refreshTokenKey: string;
  
  // Feature Flags
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableAnalytics: boolean;
  
  // External Services
  sentryDsn?: string;
  googleAnalyticsId?: string;
  
  // File Upload Configuration
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Development Configuration
  debugMode: boolean;
  logLevel: string;
  
  // Branding Configuration
  brandColor: string;
  brandName: string;
}

// Environment variable getter with fallbacks
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvVarAsNumber = (key: string, defaultValue: number = 0): number => {
  const value = getEnvVar(key);
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvVarAsBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key);
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

const getEnvVarAsArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = getEnvVar(key);
  return value ? value.split(',').map(item => item.trim()) : defaultValue;
};

// Configuration object
export const config: AppConfig = {
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8000'),
  apiTimeout: getEnvVarAsNumber('VITE_API_TIMEOUT', 10000),
  
  // Application Configuration
  appName: getEnvVar('VITE_APP_NAME', 'Wingstop Inventory'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appEnvironment: getEnvVar('VITE_APP_ENVIRONMENT', 'development'),
  
  // Authentication Configuration
  authStorageKey: getEnvVar('VITE_AUTH_STORAGE_KEY', 'wingstop_auth_token'),
  refreshTokenKey: getEnvVar('VITE_REFRESH_TOKEN_KEY', 'wingstop_refresh_token'),
  
  // Feature Flags
  enableOfflineMode: getEnvVarAsBoolean('VITE_ENABLE_OFFLINE_MODE', true),
  enablePushNotifications: getEnvVarAsBoolean('VITE_ENABLE_PUSH_NOTIFICATIONS', true),
  enableAnalytics: getEnvVarAsBoolean('VITE_ENABLE_ANALYTICS', false),
  
  // External Services
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
  
  // File Upload Configuration
  maxFileSize: getEnvVarAsNumber('VITE_MAX_FILE_SIZE', 10485760), // 10MB
  allowedFileTypes: getEnvVarAsArray('VITE_ALLOWED_FILE_TYPES', [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]),
  
  // Development Configuration
  debugMode: getEnvVarAsBoolean('VITE_DEBUG_MODE', true),
  logLevel: getEnvVar('VITE_LOG_LEVEL', 'info'),
  
  // Branding Configuration
  brandColor: getEnvVar('VITE_BRAND_COLOR', '#E31837'),
  brandName: getEnvVar('VITE_BRAND_NAME', 'Wingstop'),
};

// Validation function
export const validateConfig = (): void => {
  const requiredFields: (keyof AppConfig)[] = ['apiUrl', 'appName'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required configuration: ${field}`);
    }
  }
  
  // Validate API URL format
  try {
    new URL(config.apiUrl);
  } catch {
    throw new Error(`Invalid API URL: ${config.apiUrl}`);
  }
  
  // Validate file size
  if (config.maxFileSize <= 0) {
    throw new Error('maxFileSize must be greater than 0');
  }
};

// Initialize configuration
export const initializeConfig = (): void => {
  try {
    validateConfig();
    console.log('Configuration loaded successfully:', {
      appName: config.appName,
      appVersion: config.appVersion,
      environment: config.appEnvironment,
      apiUrl: config.apiUrl,
    });
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw error;
  }
};

// Export default config
export default config; 