export interface BloggerAuthor {
  id?: string;
  displayName: string;
  url?: string;
  image?: {
    url?: string;
  };
}

export interface BloggerImage {
  url: string;
}

export interface BloggerPost {
  kind?: string;
  id: string;
  blog?: {
    id: string;
  };
  published: string;
  updated: string;
  url: string;
  selfLink?: string;
  title: string;
  content: string;
  images?: BloggerImage[];
  author?: BloggerAuthor;
  replies?: {
    totalItems: string | number;
    selfLink?: string;
  };
  labels?: string[];
  etag?: string;
}

export interface BloggerPostsResponse {
  kind?: string;
  nextPageToken?: string;
  prevPageToken?: string;
  items?: BloggerPost[];
  etag?: string;
  totalItems?: number;
}

export interface BloggerBlogInfo {
  kind?: string;
  id: string;
  name: string;
  description?: string;
  published?: string;
  updated?: string;
  url: string;
  posts?: {
    totalItems: number;
  };
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface BloggerConfig {
  blogId: string;
  apiKey: string;
  blogUrl: string;
}

export type ErrorType = 
  | 'MISSING_API_KEY'
  | 'INVALID_BLOG_ID'
  | 'API_NOT_ENABLED'
  | 'INVALID_KEY_OR_PERMISSION'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_JSON'
  | 'EMPTY_POSTS'
  | 'UNKNOWN';

export interface APIErrorDetail {
  code?: number;
  type: ErrorType;
  message: string;
  help?: string;
}
