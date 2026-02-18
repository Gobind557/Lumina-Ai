import { ReactNode } from 'react'

/**
 * Query Provider - wraps the app with React Query (when installed)
 * For now, this is a placeholder that can be enhanced when @tanstack/react-query is added
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // TODO: Add React Query when @tanstack/react-query is installed
  // import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  // const queryClient = new QueryClient()
  // return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  
  return <>{children}</>
}
