export interface ShortenUrlRequest {
  url: string;
  customCode?: string;
  expiresAtUtc?: string;
  maxClicks?: number;
}

export interface ShortenedUrlResponse {
  shortUrl: string;
  originalUrl: string;
  code: string;
  clicks: number;
  isActive: boolean;
  expiresAtUtc?: string;
  maxClicks?: number;
  isCustom: boolean;
  qrCodeUrl: string;
  createdOnUtc: string;
}

export interface UrlAnalyticsResponse {
  code: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  clicksByDate: Record<string, number>;
  topBrowsers: Record<string, number>;
  topOperatingSystems: Record<string, number>;
  topDeviceTypes: Record<string, number>;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  plan: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: string;
  plan: string;
  totalLinksCreated: number;
  createdAtUtc: string;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  secretKey?: string;
  createdAtUtc: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
