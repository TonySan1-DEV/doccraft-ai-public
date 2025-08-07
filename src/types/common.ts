// Common type definitions to replace `any` types throughout the codebase

export interface UserPreferences {
  copilotEnabled: boolean;
  defaultCommandView: 'list' | 'grid';
  language: 'en' | 'es' | 'fr';
  tone: 'friendly' | 'professional' | 'casual';
  memoryEnabled: boolean;
  lockedFields: string[];
  lockedFieldsCount: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationParams;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  tier: 'Free' | 'Pro' | 'Admin';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  personality: Record<string, unknown>;
  background: string;
  relationships: CharacterRelationship[];
}

export interface CharacterRelationship {
  characterId: string;
  relationshipType: 'friend' | 'enemy' | 'family' | 'romantic' | 'mentor';
  description: string;
}

export interface EmotionalArcData {
  sceneId: string;
  emotion: string;
  intensity: number;
  timestamp: number;
  context: string;
}

export interface ImageSuggestion {
  id: string;
  url: string;
  altText: string;
  relevance: number;
  source: string;
  tags: string[];
}

export interface PresetData {
  id: string;
  name: string;
  description: string;
  category: string;
  preferences: UserPreferences;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  userId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

export interface MarketTrendData {
  keyword: string;
  trend: number;
  volume: number;
  competition: number;
  opportunity: number;
  timestamp: string;
}

export interface FeedbackData {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'reviewing' | 'in-progress' | 'resolved';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Generic types for flexible data handling
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Form data types
export interface FormData {
  [key: string]: string | number | boolean | File | File[];
}

// Component props with proper typing
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface ClickableProps extends BaseComponentProps {
  onClick: EventHandler;
  onKeyDown?: EventHandler<KeyboardEvent>;
  disabled?: boolean;
  tabIndex?: number;
}

// API function types
export type ApiFunction<TParams = unknown, TResult = unknown> = (
  params: TParams
) => Promise<ApiResponse<TResult>>;

// Hook return types
export interface UseStateReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
}
