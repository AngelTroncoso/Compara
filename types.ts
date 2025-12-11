export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface SearchResult {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export interface SearchParams {
  item: string;
  location: string;
  imageBase64?: string;
  imageMimeType?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
}
