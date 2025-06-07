import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://txsxevjbooxmchmmmuyb.supabase.co';
const SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4c3hldmpib294bWNobW1tdXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDQ1MjEsImV4cCI6MjA2NDc4MDUyMX0.4eX71h06q2JZBwR5JXU3sW-ZkRurbQtIm3G55nbB9WI'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);