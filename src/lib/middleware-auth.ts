import { NextRequest } from 'next/server'
import { AuthService } from './auth'

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'SUB_ADMIN' | 'USER'
    isActive: boolean
  }
}

/**
 * Validates authentication from request headers
 */
import { Role } from '@prisma/client'

// Define a more specific type for the user object returned by auth
type AuthenticatedUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
}

export async function validateAuthFromRequest(request: NextRequest): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string }> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token and get user
    const user = await AuthService.verifyToken(token)
    
    return {
      success: true,
      user
    }
  } catch (error) {
    console.error('Auth validation error:', error)
    return { success: false, error: 'Invalid token' }
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const authResult = await validateAuthFromRequest(request)
    
    if (!authResult.success) {
      return { success: false, error: 'Unauthorized', status: 401 };
    }

    if (!authResult.user || !allowedRoles.includes(authResult.user.role)) {
      return { success: false, error: 'Forbidden', status: 403 };
    }

    return { success: true, user: authResult.user };
  }
}

/**
 * Check if user is admin
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await validateAuthFromRequest(request)
  
  if (!authResult.success) {
    return { success: false, error: 'Unauthorized', status: 401 };
  }

  if (!authResult.user || authResult.user.role !== 'ADMIN') {
    return { success: false, error: 'Admin access required', status: 403 };
  }

  return { success: true, user: authResult.user };
}

/**
 * Check if user is admin or sub-admin
 */
export async function requireAdminOrSubAdmin(request: NextRequest) {
  const authResult = await validateAuthFromRequest(request)
  
  if (!authResult.success) {
    return { success: false, error: 'Unauthorized', status: 401 };
  }

  if (!authResult.user || !['ADMIN', 'SUB_ADMIN'].includes(authResult.user.role)) {
    return { success: false, error: 'Admin or Sub-Admin access required', status: 403 };
  }

  return { success: true, user: authResult.user };
}
