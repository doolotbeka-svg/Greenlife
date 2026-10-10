// Safe storage wrapper for iframes where window.localStorage might throw SecurityError
class MemoryStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

const memoryFallback = new MemoryStorage();

function getStorage() {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      // Test read/write to ensure not blocked by security policy
      const testKey = '__test_storage__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // Blocked by third-party iframe cookie/storage policy
  }
  return memoryFallback;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return getStorage().getItem(key);
    } catch {
      return memoryFallback.getItem(key);
    }
  },
  setItem(key: string, value: string): void {
    try {
      getStorage().setItem(key, value);
    } catch {
      memoryFallback.setItem(key, value);
    }
  },
  removeItem(key: string): void {
    try {
      getStorage().removeItem(key);
    } catch {
      memoryFallback.removeItem(key);
    }
  },
};
