
/**
 * Extend the Window interface to add our custom properties
 */
interface Window {
  /**
   * Flag to indicate if React is initialized
   */
  reactInitialized?: boolean;
  
  /**
   * React global instance
   */
  React?: typeof import('react');
}
