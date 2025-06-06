// Live Search types and utilities for xAI Grok API

export interface SearchSource {
  type: 'web' | 'x' | 'news' | 'rss';
  country?: string; // ISO alpha-2 code for web and news
  excluded_websites?: string[]; // Max 5 websites for web and news
  allowed_websites?: string[]; // Max 5 websites for web only
  safe_search?: boolean; // For web and news
  x_handles?: string[]; // For X source
  links?: string[]; // For RSS source (currently 1 link max)
}

export interface SearchParameters {
  mode: 'auto' | 'on' | 'off';
  return_citations?: boolean;
  from_date?: string; // ISO8601 format YYYY-MM-DD
  to_date?: string; // ISO8601 format YYYY-MM-DD
  max_search_results?: number; // Default 20
  sources?: SearchSource[];
}

// Helper function to create search parameters for common use cases
export const createSearchParameters = {
  // Auto-search with citations (most common use case)
  auto: (options?: Partial<SearchParameters>): SearchParameters => ({
    mode: 'auto',
    return_citations: true,
    max_search_results: 10,
    ...options
  }),

  // Force search on
  on: (options?: Partial<SearchParameters>): SearchParameters => ({
    mode: 'on',
    return_citations: true,
    max_search_results: 10,
    ...options
  }),

  // Search recent news
  recentNews: (days: number = 7): SearchParameters => {
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      mode: 'auto',
      return_citations: true,
      from_date: fromDate,
      to_date: toDate,
      sources: [{ type: 'news' }, { type: 'web' }]
    };
  },

  // Search specific websites
  specificSites: (websites: string[], mode: 'auto' | 'on' = 'auto'): SearchParameters => ({
    mode,
    return_citations: true,
    sources: [{
      type: 'web',
      allowed_websites: websites.slice(0, 5) // Max 5 websites
    }]
  }),

  // Search X posts from specific handles
  xHandles: (handles: string[], mode: 'auto' | 'on' = 'auto'): SearchParameters => ({
    mode,
    return_citations: true,
    sources: [{
      type: 'x',
      x_handles: handles
    }]
  }),

  // Search by country
  byCountry: (countryCode: string, mode: 'auto' | 'on' = 'auto'): SearchParameters => ({
    mode,
    return_citations: true,
    sources: [
      { type: 'web', country: countryCode },
      { type: 'news', country: countryCode }
    ]
  }),

  // Search RSS feeds
  rss: (feedUrls: string[], mode: 'auto' | 'on' = 'auto'): SearchParameters => ({
    mode,
    return_citations: true,
    sources: feedUrls.map(url => ({
      type: 'rss' as const,
      links: [url]
    }))
  })
};

// Helper function to detect if a query should use search
export const shouldUseSearch = (query: string): boolean => {
  const searchKeywords = [
    // Time-sensitive queries
    'news', 'latest', 'recent', 'current', 'today', 'yesterday', 
    'this week', 'this month', 'breaking', 'update', 'happening',
    
    // Current data queries
    'what\'s new', 'stock price', 'weather', 'events', 'now',
    'currently', 'as of', 'live', 'real-time',
    
    // Market/financial data
    'price of', 'stock', 'crypto', 'bitcoin', 'market',
    
    // Social media trends
    'trending', 'viral', 'popular', 'buzz',
    
    // Location-specific current info
    'near me', 'local', 'in my area'
  ];
  
  const lowerQuery = query.toLowerCase();
  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
};

// Helper to validate search parameters
export const validateSearchParameters = (params: SearchParameters): string[] => {
  const errors: string[] = [];
  
  if (!['auto', 'on', 'off'].includes(params.mode)) {
    errors.push('Mode must be "auto", "on", or "off"');
  }
  
  if (params.max_search_results && (params.max_search_results < 1 || params.max_search_results > 50)) {
    errors.push('max_search_results must be between 1 and 50');
  }
  
  if (params.sources) {
    params.sources.forEach((source, index) => {
      if (source.excluded_websites && source.excluded_websites.length > 5) {
        errors.push(`Source ${index}: excluded_websites cannot exceed 5 items`);
      }
      
      if (source.allowed_websites && source.allowed_websites.length > 5) {
        errors.push(`Source ${index}: allowed_websites cannot exceed 5 items`);
      }
      
      if (source.excluded_websites && source.allowed_websites) {
        errors.push(`Source ${index}: cannot use both excluded_websites and allowed_websites`);
      }
      
      if (source.type === 'rss' && source.links && source.links.length > 1) {
        errors.push(`Source ${index}: RSS sources currently support only 1 link`);
      }
    });
  }
  
  return errors;
}; 