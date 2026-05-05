'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'
import { Amplify } from 'aws-amplify'
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:       process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain:           process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes:           ['email', 'openid', 'profile'],
          redirectSignIn:   [process.env.NEXT_PUBLIC_APP_URL + '/dashboard'],
          redirectSignOut:  [process.env.NEXT_PUBLIC_APP_URL + '/login'],
          responseType:     'code',
        },
      },
    },
  },
})

interface AuthUser {
  userId:   string
  email:    string
  username: string
}

interface AuthContextType {
  user:            AuthUser | null
  isAuthenticated: boolean
  isLoading:       boolean
  signIn:          (email: string, password: string) => Promise<void>
  signOut:         () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null, isAuthenticated: false, isLoading: true,
  signIn: async () => {}, signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkCurrentUser()
  }, [])

  async function checkCurrentUser() {
    try {
      const cognitoUser = await getCurrentUser()
      const attrs       = await fetchUserAttributes()
      setUser({
        userId:   cognitoUser.userId,
        email:    attrs.email ?? '',
        username: attrs.preferred_username ?? attrs.email ?? '',
      })
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoading(true)
    try {
      await amplifySignIn({ username: email, password })
      await checkCurrentUser()
    } finally {
      setIsLoading(false)
    }
  }

  async function signOut() {
    await amplifySignOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
