// lib/auth/auth-service.ts

import type { LoginCredentials, AuthResponse, RefreshTokenResponse, User } from '@/types/auth'
import { TokenManager } from './token-manager'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Admin login endpoint (per collection): /user/admin/login
      const response = await fetch(`${API_BASE_URL}/user/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Backend expects { username, password }. We map email -> username to avoid changing UI types.
        body: JSON.stringify({ username: (credentials as any).email ?? (credentials as any).username, password: credentials.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        }
      }
     
      // Support both formats:
      // 1) { data: { token } }
      // 2) { data: { accessToken, refreshToken } }
      const tokenOnly: string | undefined = data?.data?.token
      const accessToken: string | undefined = data?.data?.accessToken || tokenOnly
      const refreshToken: string | undefined = data?.data?.refreshToken || tokenOnly

      if (accessToken) {
        const tokens = {
          accessToken,
          // Fallback: if backend doesn't return refreshToken, reuse accessToken to satisfy storage shape
          refreshToken: refreshToken ?? accessToken,
        }

        TokenManager.setTokens(tokens)

        if (data.user) {
          TokenManager.setUser(data.user)
        }

        return {
          success: true,
          data: tokens,
          message: 'Login successful',
        }
      }

      return {
        success: false,
        error: 'Invalid response format from server',
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      }
    }
  }

  // Refresh access token
  static async refreshAccessToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken()

      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token available',
        }
      }

      const response = await fetch(`${API_BASE_URL}/user/refresh-access-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // If refresh token is invalid, clear all tokens
        if (response.status === 401 || response.status === 403) {
          TokenManager.clearTokens()
        }
        
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        }
      }

      if (data.success && data.data?.accessToken) {
        // Your API format: { success: true, data: { accessToken } }
        TokenManager.setAccessToken(data.data.accessToken)

        return {
          success: true,
          data: {
            accessToken: data.data.accessToken,
          },
          message: data.message || 'Token refreshed successfully',
        }
      } 

      return {
        success: false,
        error: 'Invalid refresh response format',
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      }
    }
  }
  // Refresh access token


  // Logout user
  static async logout(): Promise<void> {
    try {
      // Clear tokens from storage
      TokenManager.clearTokens()
      // Hard refresh: reload the page to clear any client-side state
      window.location.href = '/'
      // Optional: Call logout endpoint if you have one
      // const refreshToken = TokenManager.getRefreshToken()
      // if (refreshToken) {
      //   await fetch(`${API_BASE_URL}/user/logout`, {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${refreshToken}`,
      //       'Content-Type': 'application/json',
      //     },
      //   })
      // }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear tokens even if API call fails
      TokenManager.clearTokens()
    }
  }

  // Check authentication status
  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated()
  }

  // Get current user
  static getCurrentUser(): User | null {
    return TokenManager.getUser() as User | null
  }

  // Auto-refresh token if needed
  static async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false
    }

    // Check if token needs refresh
    if (TokenManager.shouldRefreshToken()) {
      const refreshResult = await this.refreshAccessToken()
      return refreshResult.success
    }

    return true
  }

  // Verify current admin session token
  static async verifyAdmin(): Promise<boolean> {
    try {
      const accessToken = TokenManager.getAccessToken()
      if (!accessToken) return false
      const res = await fetch(`${API_BASE_URL}/user/admin/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return res.ok
    } catch (e) {
      return false
    }
  }
}