import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rerntgzkmcdfzoyowyue.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Vqmnhe5vLoTgUwfDNL2jBQ_ZHr0U-Pn'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)