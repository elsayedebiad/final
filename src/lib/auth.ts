import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { db } from './db'

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024'
  private static readonly SALT_ROUNDS = 12

  /**
   * Register a new user
   */
  static async register(
    email: string,
    password: string,
    name: string,
    role: Role = Role.USER
  ) {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })

    return user
  }

  /**
   * Authenticate user with email and password
   */
  static async login(email: string, password: string) {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Ensure userId is a number before creating a session
    const userIdAsNumber = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;

    if (isNaN(userIdAsNumber)) {
      throw new Error('Invalid user ID for session creation');
    }

    // Create session
    const session = await db.session.create({
      data: {
        userId: userIdAsNumber,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      token,
      session: session.id
    }
  }

  /**
   * Verify JWT token and return user data
   */
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        userId: number
        email: string
        role: Role
      }

      // Check if session exists and is valid
      const session = await db.session.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            }
          }
        }
      })

      if (!session || !session.user.isActive) {
        throw new Error('Invalid or expired session')
      }

      return session.user
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  /**
   * Logout user by invalidating session
   */
  static async logout(token: string) {
    await db.session.deleteMany({
      where: { token }
    })
  }

  /**
   * Change user password
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      throw new Error('Current password is incorrect')
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS)

    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    // Invalidate all sessions for this user
    await db.session.deleteMany({
      where: { userId }
    })
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: number, data: { name?: string; email?: string }) {
    // Check if email is already taken by another user
    if (data.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        throw new Error('Email is already taken')
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    })

    return user
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: number) {
    await db.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    // Invalidate all sessions for this user
    await db.session.deleteMany({
      where: { userId }
    })
  }

  /**
   * Activate user account
   */
  static async activateUser(userId: number) {
    await db.user.update({
      where: { id: userId },
      data: { isActive: true }
    })
  }
}
