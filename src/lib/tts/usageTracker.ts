const STORAGE_KEY = 'hume_tts_usage';
const MONTHLY_LIMIT = 10000; // characters per month
const RESET_DATE_KEY = 'hume_tts_reset_date';

interface UsageData {
  charactersUsed: number;
  resetDate: string; // ISO date string
}

/**
 * Get current usage data from localStorage
 */
export function getUsageData(): UsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const resetDate = localStorage.getItem(RESET_DATE_KEY);
    
    if (stored && resetDate) {
      const data = JSON.parse(stored);
      const resetDateObj = new Date(resetDate);
      const now = new Date();
      
      // Check if we need to reset (new month)
      if (now.getMonth() !== resetDateObj.getMonth() || 
          now.getFullYear() !== resetDateObj.getFullYear()) {
        // Reset for new month
        const newResetDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const newData: UsageData = {
          charactersUsed: 0,
          resetDate: newResetDate,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        localStorage.setItem(RESET_DATE_KEY, newResetDate);
        return newData;
      }
      
      return {
        charactersUsed: data.charactersUsed || 0,
        resetDate: resetDate,
      };
    }
  } catch (error) {
    console.error('Error reading usage data:', error);
  }
  
  // Initialize for current month
  const resetDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const newData: UsageData = {
    charactersUsed: 0,
    resetDate: resetDate,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  localStorage.setItem(RESET_DATE_KEY, resetDate);
  return newData;
}

/**
 * Record usage of characters
 */
export function recordUsage(characters: number): UsageData {
  const data = getUsageData();
  const newUsage = data.charactersUsed + characters;
  
  const updatedData: UsageData = {
    charactersUsed: newUsage,
    resetDate: data.resetDate,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
}

/**
 * Get remaining characters in current month
 */
export function getRemainingChars(): number {
  const data = getUsageData();
  return Math.max(0, MONTHLY_LIMIT - data.charactersUsed);
}

/**
 * Check if usage limit is exceeded
 */
export function isLimitExceeded(): boolean {
  return getRemainingChars() <= 0;
}

/**
 * Get usage percentage (0-100)
 */
export function getUsagePercentage(): number {
  const data = getUsageData();
  return Math.min(100, (data.charactersUsed / MONTHLY_LIMIT) * 100);
}

/**
 * Check if usage warning should be shown (80% threshold)
 */
export function shouldShowWarning(): boolean {
  const percentage = getUsagePercentage();
  return percentage >= 80 && percentage < 100;
}

/**
 * Check if usage is critical (95% threshold)
 */
export function isUsageCritical(): boolean {
  const percentage = getUsagePercentage();
  return percentage >= 95;
}

/**
 * Reset usage (for testing or manual reset)
 */
export function resetUsage(): void {
  const resetDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const newData: UsageData = {
    charactersUsed: 0,
    resetDate: resetDate,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  localStorage.setItem(RESET_DATE_KEY, resetDate);
}

/**
 * Get formatted usage stats
 */
export function getUsageStats() {
  const data = getUsageData();
  const remaining = getRemainingChars();
  const percentage = getUsagePercentage();
  
  return {
    used: data.charactersUsed,
    remaining,
    limit: MONTHLY_LIMIT,
    percentage: Math.round(percentage * 10) / 10,
    resetDate: new Date(data.resetDate),
  };
}

