import { createClient } from '@supabase/supabase-js'

// Usar variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ruhuqufxtoeqgjiqgcii.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_KEY não está definida nas variáveis de ambiente')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
