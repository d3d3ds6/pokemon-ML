import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Pokemon {
  numero: number;
  nom: string;
  type_1: string;
  type_2: string | null;
  points_de_vie: number;
  points_attaque: number;
  points_deffence: number;
  points_attaque_speciale: number;
  point_defense_speciale: number;
  points_vitesse: number;
  nombre_generations: number;
  legendaire: boolean;
  combats: number;
  victoires: number;
  taux_de_victoire: number;
}

export interface Combat {
  id: string;
  first_pokemon: number;
  second_pokemon: number;
  winner: number;
  created_at: string;
}

export interface ModelResult {
  id: string;
  model_name: string;
  model_type: string;
  accuracy?: number;
  mse?: number;
  mae?: number;
  r2_score?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
}
