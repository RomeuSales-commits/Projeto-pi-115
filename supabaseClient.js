// supabaseClient.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 🔗 Suas credenciais Supabase
const SUPABASE_URL = "https://xxgmufacvbzbxbcxmfcm.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z211ZmFjdmJ6YnhiY3htZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDkzMjIsImV4cCI6MjA3Nzc4NTMyMn0.5TtAULeW2b8_eExfWfFfz4YPkzn7J0ki1XlswTj5nNY"

// Cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
