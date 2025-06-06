import { useState, useCallback } from 'react';
import { SearchParameters, createSearchParameters, validateSearchParameters } from '@/lib/live-search';

interface UseLiveSearchOptions {
  defaultEnabled?: boolean;
  defaultParameters?: Partial<SearchParameters>;
}

export function useLiveSearch(options: UseLiveSearchOptions = {}) {
  const [isSearchEnabled, setIsSearchEnabled] = useState(options.defaultEnabled || false);
  const [searchParameters, setSearchParameters] = useState<SearchParameters | null>(
    options.defaultParameters ? createSearchParameters.auto(options.defaultParameters) : null
  );
  const [searchErrors, setSearchErrors] = useState<string[]>([]);

  // Toggle search on/off
  const toggleSearch = useCallback(() => {
    setIsSearchEnabled(prev => {
      const newEnabled = !prev;
      if (!newEnabled) {
        setSearchParameters(null);
      } else if (!searchParameters) {
        setSearchParameters(createSearchParameters.auto());
      }
      return newEnabled;
    });
  }, [searchParameters]);

  // Enable search with specific parameters
  const enableSearch = useCallback((params?: Partial<SearchParameters>) => {
    const fullParams = createSearchParameters.auto(params);
    const errors = validateSearchParameters(fullParams);
    
    if (errors.length > 0) {
      setSearchErrors(errors);
      return false;
    }
    
    setSearchParameters(fullParams);
    setIsSearchEnabled(true);
    setSearchErrors([]);
    return true;
  }, []);

  // Disable search
  const disableSearch = useCallback(() => {
    setIsSearchEnabled(false);
    setSearchParameters(null);
    setSearchErrors([]);
  }, []);

  // Update search parameters
  const updateSearchParameters = useCallback((params: Partial<SearchParameters>) => {
    if (!searchParameters) return false;
    
    const updatedParams = { ...searchParameters, ...params };
    const errors = validateSearchParameters(updatedParams);
    
    if (errors.length > 0) {
      setSearchErrors(errors);
      return false;
    }
    
    setSearchParameters(updatedParams);
    setSearchErrors([]);
    return true;
  }, [searchParameters]);

  // Convenience methods for common search types
  const searchMethods = {
    // Search recent news
    recentNews: (days?: number) => {
      const params = createSearchParameters.recentNews(days);
      setSearchParameters(params);
      setIsSearchEnabled(true);
      setSearchErrors([]);
    },

    // Search specific websites
    specificSites: (websites: string[]) => {
      const params = createSearchParameters.specificSites(websites);
      setSearchParameters(params);
      setIsSearchEnabled(true);
      setSearchErrors([]);
    },

    // Search X handles
    xHandles: (handles: string[]) => {
      const params = createSearchParameters.xHandles(handles);
      setSearchParameters(params);
      setIsSearchEnabled(true);
      setSearchErrors([]);
    },

    // Search by country
    byCountry: (countryCode: string) => {
      const params = createSearchParameters.byCountry(countryCode);
      setSearchParameters(params);
      setIsSearchEnabled(true);
      setSearchErrors([]);
    }
  };

  return {
    // State
    isSearchEnabled,
    searchParameters,
    searchErrors,
    
    // Actions
    toggleSearch,
    enableSearch,
    disableSearch,
    updateSearchParameters,
    
    // Convenience methods
    ...searchMethods,
    
    // Utility
    hasErrors: searchErrors.length > 0,
    isConfigured: isSearchEnabled && searchParameters !== null
  };
} 