/**
 * Centralized Error Handler
 * Provides consistent error handling and logging throughout the application
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.warnLog = [];
  }

  /**
   * Log error with context and optional user-facing message
   * @param {Error|string} error - The error object or message
   * @param {string} context - Where the error occurred
   * @param {Object} metadata - Additional context data
   * @param {boolean} showToUser - Whether to show error to user
   */
  error(error, context = 'Unknown', metadata = {}, showToUser = false) {
    const errorObj = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      context,
      metadata,
      showToUser
    };

    this.errorLog.push(errorObj);

    // Log to console for debugging (in production, this would go to a service)
    console.error(`[${context}]`, error, metadata);

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      this.sendToErrorTracking(errorObj);
    }

    return errorObj;
  }

  /**
   * Log warning with context
   * @param {string} message - Warning message
   * @param {string} context - Where the warning occurred
   * @param {Object} metadata - Additional context data
   */
  warn(message, context = 'Unknown', metadata = {}) {
    const warnObj = {
      timestamp: new Date().toISOString(),
      message,
      context,
      metadata
    };

    this.warnLog.push(warnObj);
    console.warn(`[${context}]`, message, metadata);

    return warnObj;
  }

  /**
   * Handle async errors with fallback
   * @param {Promise} promise - The promise to handle
   * @param {Function} fallback - Fallback function
   * @param {string} context - Error context
   */
  async handleAsync(promise, fallback, context = 'Async Operation') {
    try {
      return await promise;
    } catch (error) {
      this.error(error, context);
      if (typeof fallback === 'function') {
        return fallback(error);
      }
      return null;
    }
  }

  /**
   * Validate required fields and throw error if missing
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - Required field names
   * @param {string} context - Validation context
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Send error to tracking service (placeholder for production)
   * @param {Object} errorObj - Error object to send
   */
  sendToErrorTracking(errorObj) {
    // In production, integrate with Sentry, LogRocket, etc.
    // For now, we'll store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errors.push(errorObj);
      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.shift();
      }
      localStorage.setItem('errorLog', JSON.stringify(errors));
    } catch {
      // Silent fail if localStorage is unavailable
    }
  }

  /**
   * Get recent errors for debugging
   * @param {number} limit - Number of errors to return
   */
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  }

  /**
   * Get recent warnings for debugging
   * @param {number} limit - Number of warnings to return
   */
  getRecentWarnings(limit = 10) {
    return this.warnLog.slice(-limit);
  }

  /**
   * Clear error logs
   */
  clearLogs() {
    this.errorLog = [];
    this.warnLog = [];
    localStorage.removeItem('errorLog');
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context, metadata, showToUser) => 
  errorHandler.error(error, context, metadata, showToUser);

export const handleWarn = (message, context, metadata) => 
  errorHandler.warn(message, context, metadata);

export const handleAsync = (promise, fallback, context) => 
  errorHandler.handleAsync(promise, fallback, context);

export const validateRequired = (data, requiredFields, context) => 
  errorHandler.validateRequired(data, requiredFields, context);

export default errorHandler;
