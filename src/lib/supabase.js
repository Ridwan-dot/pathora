import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// The key here is the PUBLIC (publishable / anon) key. It is safe in the browser because
// the database rules (Row Level Security) decide what each person can see.
// Never put the secret / service_role key anywhere in this project.
export const supabase = url && key ? createClient(url, key) : null
