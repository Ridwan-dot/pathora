import { createContext } from 'react'

// On the server (during the build) this collects each page's head details.
// In the browser it is null.
export const HeadContext = createContext(null)
