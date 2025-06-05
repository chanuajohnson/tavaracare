
/**
 * Generate a summary of the collected data
 */
export const generateDataSummary = (formData: Record<string, any>): string => {
  const entries = Object.entries(formData);
  if (entries.length === 0) {
    return "No information collected yet.";
  }
  
  const lines = entries.map(([key, value]) => {
    let displayValue = value;
    
    // Format arrays
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    }
    
    // Format the key for display
    const displayKey = key
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
      
    return `${displayKey}: ${displayValue}`;
  });
  
  return lines.join("\n");
};
