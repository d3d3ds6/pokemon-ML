/*
  # Pokémon Combat Prediction Database Schema

  1. New Tables
    - `pokemon`
      - `numero` (int, primary key) - Pokémon ID
      - `nom` (text) - Pokémon name
      - `type_1` (text) - Primary type
      - `type_2` (text, nullable) - Secondary type
      - `points_de_vie` (int) - HP stat
      - `points_attaque` (int) - Attack stat
      - `points_deffence` (int) - Defense stat
      - `points_attaque_speciale` (int) - Special Attack stat
      - `point_defense_speciale` (int) - Special Defense stat
      - `points_vitesse` (int) - Speed stat
      - `nombre_generations` (int) - Generation number
      - `legendaire` (boolean) - Is legendary
      - `combats` (int) - Number of combats
      - `victoires` (int) - Number of victories
      - `taux_de_victoire` (float) - Win rate
      - `created_at` (timestamp)

    - `combats`
      - `id` (uuid, primary key)
      - `first_pokemon` (int) - First Pokémon ID
      - `second_pokemon` (int) - Second Pokémon ID
      - `winner` (int) - Winner Pokémon ID
      - `created_at` (timestamp)

    - `model_results`
      - `id` (uuid, primary key)
      - `model_name` (text) - Name of the model
      - `model_type` (text) - regression or classification
      - `accuracy` (float, nullable)
      - `mse` (float, nullable)
      - `mae` (float, nullable)
      - `r2_score` (float, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS pokemon (
  numero int PRIMARY KEY,
  nom text NOT NULL,
  type_1 text NOT NULL,
  type_2 text,
  points_de_vie int NOT NULL DEFAULT 0,
  points_attaque int NOT NULL DEFAULT 0,
  points_deffence int NOT NULL DEFAULT 0,
  points_attaque_speciale int NOT NULL DEFAULT 0,
  point_defense_speciale int NOT NULL DEFAULT 0,
  points_vitesse int NOT NULL DEFAULT 0,
  nombre_generations int NOT NULL DEFAULT 1,
  legendaire boolean NOT NULL DEFAULT false,
  combats int DEFAULT 0,
  victoires int DEFAULT 0,
  taux_de_victoire float DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS combats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_pokemon int NOT NULL,
  second_pokemon int NOT NULL,
  winner int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  model_type text NOT NULL,
  accuracy float,
  mse float,
  mae float,
  r2_score float,
  precision float,
  recall float,
  f1_score float,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE combats ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to pokemon"
  ON pokemon
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to combats"
  ON combats
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to model_results"
  ON model_results
  FOR SELECT
  TO anon
  USING (true);

-- Insert sample Pokémon data
INSERT INTO pokemon (numero, nom, type_1, type_2, points_de_vie, points_attaque, points_deffence, points_attaque_speciale, point_defense_speciale, points_vitesse, nombre_generations, legendaire, combats, victoires, taux_de_victoire)
VALUES 
  (1, 'Bulbizarre', 'Herbe', 'Poison', 45, 49, 49, 65, 65, 45, 1, false, 133, 37, 0.278),
  (3, 'Florizarre', 'Herbe', 'Poison', 80, 82, 83, 100, 100, 80, 1, false, 132, 89, 0.674),
  (6, 'Dracaufeu', 'Feu', 'Vol', 78, 84, 78, 109, 85, 100, 1, false, 145, 98, 0.676),
  (9, 'Tortank', 'Eau', null, 79, 83, 100, 85, 105, 78, 1, false, 128, 72, 0.563),
  (25, 'Pikachu', 'Électrik', null, 35, 55, 40, 50, 50, 90, 1, false, 142, 68, 0.479),
  (150, 'Mewtwo', 'Psy', null, 106, 110, 90, 154, 90, 130, 1, true, 125, 118, 0.944),
  (151, 'Mew', 'Psy', null, 100, 100, 100, 100, 100, 100, 1, true, 120, 95, 0.792),
  (249, 'Lugia', 'Psy', 'Vol', 106, 90, 130, 90, 154, 110, 2, true, 118, 102, 0.864),
  (384, 'Rayquaza', 'Dragon', 'Vol', 105, 150, 90, 150, 90, 95, 3, true, 130, 121, 0.931),
  (445, 'Carchacrok', 'Dragon', 'Sol', 108, 130, 95, 80, 85, 102, 4, false, 156, 112, 0.718)
ON CONFLICT (numero) DO NOTHING;

-- Insert sample combat data
INSERT INTO combats (first_pokemon, second_pokemon, winner)
VALUES 
  (1, 25, 25),
  (6, 9, 6),
  (150, 151, 150),
  (3, 1, 3),
  (249, 384, 384),
  (6, 25, 6),
  (150, 6, 150),
  (445, 3, 445)
ON CONFLICT DO NOTHING;

-- Insert model results
INSERT INTO model_results (model_name, model_type, accuracy, mse, mae, r2_score)
VALUES 
  ('Linear Regression', 'regression', null, 0.0022, 0.0310, 0.9711),
  ('Random Forest Regressor', 'regression', null, 0.0008, 0.0187, 0.9891),
  ('Decision Tree Regressor', 'regression', null, 0.0014, 0.0235, 0.9818)
ON CONFLICT DO NOTHING;

INSERT INTO model_results (model_name, model_type, accuracy, precision, recall, f1_score)
VALUES 
  ('Logistic Regression', 'classification', 0.95, 0.75, 0.50, 0.60),
  ('SVM', 'classification', 0.95, 0.76, 0.51, 0.61),
  ('KNN', 'classification', 0.9125, 0.70, 0.48, 0.57)
ON CONFLICT DO NOTHING;