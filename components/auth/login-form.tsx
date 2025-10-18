
// "use client"

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import Image from 'next/image'
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Eye, EyeOff, Mail, Lock, Loader2, Store, AlertCircle } from 'lucide-react'
// import { useAuth } from './auth-provider'
// import type { LoginCredentials } from '@/types/auth'

// export function LoginForm() {
//   const [credentials, setCredentials] = useState<LoginCredentials>({
//     email: '',
//     password: '',
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

//   const { login, error, isAuthenticated, clearError } = useAuth()
//   const router = useRouter()

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       router.push('/') // Redirect to dashboard
//     }
//   }, [isAuthenticated, router])

//   // Clear error when component mounts or credentials change
//   useEffect(() => {
//     if (error) {
//       clearError()
//     }
//   }, [credentials, error, clearError]) // Added error and clearError to dependencies

//   // Validation function
//   const validateForm = (): boolean => {
//     const errors: Partial<LoginCredentials> = {}

//     // Email validation
//     if (!credentials.email.trim()) {
//       errors.email = 'Email is required'
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
//       errors.email = 'Please enter a valid email address'
//     }

//     // Password validation
//     if (!credentials.password) {
//       errors.password = 'Password is required'
//     } else if (credentials.password.length < 6) {
//       errors.password = 'Password must be at least 6 characters long'
//     }

//     setValidationErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   // Handle input changes
//   const handleInputChange = (field: keyof LoginCredentials, value: string) => {
//     setCredentials(prev => ({
//       ...prev,
//       [field]: value,
//     }))
    
//     // Clear validation error for this field
//     if (validationErrors[field]) {
//       setValidationErrors(prev => ({
//         ...prev,
//         [field]: undefined,
//       }))
//     }
//   }

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!validateForm()) {
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const success = await login(credentials)
      
//       if (success) {
//         // Login successful, redirect will happen via useEffect
//         router.push('/')
//       }
//     } catch (err) {
//       console.error('Login error:', err)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
//       <div className="w-full max-w-md space-y-6">
//         {/* Logo/Branding */}
//         <div className="text-center space-y-2">
//           <div className="flex justify-center">
//             <Image src="/logo.webp" alt="Logo" width={64} height={64} className="h-16 w-16 object-contain" />
//           </div>
//           <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
//           <p className="text-muted-foreground">Sign in to your Admin account</p>
//         </div>

//         {/* Login Form */}
//         <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
//           <CardHeader className="space-y-1 pb-4">
//             <CardTitle className="text-xl text-center">Login</CardTitle>
//           </CardHeader>
          
//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               {/* Global Error Alert */}
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               {/* Email Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm font-medium">
//                   Email Address
//                 </Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="Enter your email"
//                     value={credentials.email}
//                     onChange={(e) => handleInputChange('email', e.target.value)}
//                     className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
//                     disabled={isSubmitting}
//                     autoComplete="email"
//                     required
//                   />
//                 </div>
//                 {validationErrors.email && (
//                   <p className="text-sm text-destructive">{validationErrors.email}</p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-sm font-medium">
//                   Password
//                 </Label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your password"
//                     value={credentials.password}
//                     onChange={(e) => handleInputChange('password', e.target.value)}
//                     className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
//                     disabled={isSubmitting}
//                     autoComplete="current-password"
//                     required
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                     onClick={() => setShowPassword(!showPassword)}
//                     disabled={isSubmitting}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-muted-foreground" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-muted-foreground" />
//                     )}
//                   </Button>
//                 </div>
//                 {validationErrors.password && (
//                   <p className="text-sm text-destructive">{validationErrors.password}</p>
//                 )}
//               </div>

//               {/* Remember Me & Forgot Password */}
//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
//                   />
//                   <Label htmlFor="remember" className="text-muted-foreground cursor-pointer">
//                     Remember me
//                   </Label>
//                 </div>
//                 <Link
//                   href="/forgot-password"
//                   className="text-primary hover:text-primary/80 font-medium transition-colors"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//             </CardContent>

//             <CardFooter className="flex flex-col space-y-4 pt-2">
//               {/* Submit Button */}
//               <Button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium py-2.5"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Signing In...
//                   </>
//                 ) : (
//                   'Sign In'
//                 )}
//               </Button>

//             </CardFooter>
//           </form>
//         </Card>

        
//       </div>
//     </div>
//   )
// }



"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, Loader2, User, AlertCircle } from 'lucide-react'
import { useAuth } from './auth-provider'
import type { LoginCredentials } from '@/types/auth'

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

  const { login, error, isAuthenticated, clearError } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/') // Redirect to dashboard
    }
  }, [isAuthenticated, router])

  // Clear error when component mounts or credentials change
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [credentials, error, clearError])

  // Validation function
  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {}

    // Username validation
    if (!credentials.username.trim()) {
      errors.username = 'Username is required'
    }

    // Password validation
    if (!credentials.password) {
      errors.password = 'Password is required'
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle input changes
  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const success = await login(credentials)
      
      if (success) {
        router.push('/')
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Image src="/logo.webp" alt="Logo" width={64} height={64} className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Admin account</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Login</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Global Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`pl-10 ${validationErrors.username ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    autoComplete="username"
                    required
                  />
                </div>
                {validationErrors.username && (
                  <p className="text-sm text-destructive">{validationErrors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="remember" className="text-muted-foreground cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-medium py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
