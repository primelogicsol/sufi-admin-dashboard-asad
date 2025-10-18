// types/auth.ts

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  data?: AuthTokens
  message?: string
  status?: number
  success: boolean
  error?: string
}

export interface RefreshTokenResponse {
  success: boolean
  data?: {
    accessToken: string
  }
  message?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name?: string
  role?: string
  // Add other user properties as needed
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
  clearError: () => void
}