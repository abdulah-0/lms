// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytmnzfidfxvshlzztgxc.supabase.co'; // Replace this
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bW56ZmlkZnh2c2hsenp0Z3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTYzMzgsImV4cCI6MjA2NDM3MjMzOH0.TOj0OMSze6y2fduE15xXBOECnxadO3yT_2_BrbfJy-8'; // Replace this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
