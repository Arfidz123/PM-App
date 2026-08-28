import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fpqgwlzyiubzniiguaui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcWd3bHp5aXViem5paWd1YXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjkxMjgsImV4cCI6MjA5OTU0NTEyOH0.6s6hsFJOFUwY0cZqFQV8UWQUm5pIlpH0hX3OycqN5N8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
