import { useEffect, useState } from 'react';
import { supabase, Pokemon } from '../lib/supabase';
import { Swords, Zap, Shield, Heart, Target, ChevronDown } from 'lucide-react';

export default function CombatPredictor() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [prediction, setPrediction] = useState<{
    winner: Pokemon;
    probability: number;
    explanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPokemon();
  }, []);

  const loadPokemon = async () => {
    try {
      const { data } = await supabase
        .from('pokemon')
        .select('*')
        .order('nom');

      if (data) setPokemon(data);
    } catch (error) {
      console.error('Error loading pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const predictWinner = () => {
    if (!pokemon1 || !pokemon2) return;

    // Calculate total stats for both Pokémon
    const totalStats1 = calculateTotalStats(pokemon1);
    const totalStats2 = calculateTotalStats(pokemon2);
    
    // Calculate battle score (weighted combination of stats)
    const score1 = calculateBattleScore(pokemon1);
    const score2 = calculateBattleScore(pokemon2);
    
    // Calculate type advantage multiplier
    const typeMultiplier1 = calculateTypeAdvantage(pokemon1, pokemon2);
    const typeMultiplier2 = calculateTypeAdvantage(pokemon2, pokemon1);
    
    // Apply type advantage to scores
    const finalScore1 = score1 * typeMultiplier1;
    const finalScore2 = score2 * typeMultiplier2;
    
    // Calculate probabilities
    const totalScore = finalScore1 + finalScore2;
    const prob1 = (finalScore1 / totalScore) * 100;
    const prob2 = (finalScore2 / totalScore) * 100;
    
    // Determine winner
    let winner: Pokemon;
    let probability: number;
    let explanation: string;
    
    if (finalScore1 > finalScore2) {
      winner = pokemon1;
      probability = prob1;
      explanation = generateExplanation(pokemon1, pokemon2, finalScore1, finalScore2, typeMultiplier1);
    } else {
      winner = pokemon2;
      probability = prob2;
      explanation = generateExplanation(pokemon2, pokemon1, finalScore2, finalScore1, typeMultiplier2);
    }
    
    setPrediction({ winner, probability, explanation });
  };

  const calculateTotalStats = (p: Pokemon): number => {
    return (
      p.points_de_vie +
      p.points_attaque +
      p.points_deffence +
      p.points_attaque_speciale +
      p.point_defense_speciale +
      p.points_vitesse
    );
  };

  const calculateBattleScore = (p: Pokemon): number => {
    // Weight different stats based on importance in battle
    return (
      p.points_de_vie * 0.7 +           // HP is important for survivability
      p.points_attaque * 0.9 +          // Physical attack
      p.points_deffence * 0.8 +         // Physical defense
      p.points_attaque_speciale * 0.9 + // Special attack
      p.point_defense_speciale * 0.8 +  // Special defense
      p.points_vitesse * 1.2            // Speed is very important (goes first)
    );
  };

  const calculateTypeAdvantage = (attacker: Pokemon, defender: Pokemon): number => {
    // Simple type advantage calculation
    // In a real app, you'd want a complete type chart
    const typeAdvantages: Record<string, string[]> = {
      '6': ['9', '10', '12'], // Fire > Grass, Bug, Ice
      '4': ['6', '16', '2'],  // Water > Fire, Rock, Ground
      '9': ['4', '16', '13'], // Grass > Water, Rock, Poison
      '5': ['4', '18'],       // Electric > Water, Flying
      '13': ['9'],            // Poison > Grass
      '2': ['5', '6', '13'],  // Flying > Electric, Fire, Poison
      '14': ['1', '14'],      // Psychic > Fighting, Psychic (for balance)
      '1': ['12', '15'],      // Fighting > Normal, Rock
      '12': ['14', '17'],     // Dark > Psychic, Ghost
      '17': ['14', '17'],     // Ghost > Psychic, Ghost
      '15': ['6', '2', '12'], // Rock > Fire, Flying, Bug
      '16': ['5', '13', '6'], // Ground > Electric, Poison, Fire
      '10': ['9', '14', '12'],// Bug > Grass, Psychic, Dark
      '8': ['2', '9', '16'],  // Ice > Flying, Grass, Ground
      '7': ['1', '10', '15'], // Fairy > Fighting, Bug, Rock
    };

    let multiplier = 1.0;
    
    // Check if attacker's type1 has advantage over defender's types
    if (typeAdvantages[attacker.type_1]) {
      if (typeAdvantages[attacker.type_1].includes(defender.type_1)) {
        multiplier *= 1.5;
      }
      if (defender.type_2 && typeAdvantages[attacker.type_1].includes(defender.type_2)) {
        multiplier *= 1.5;
      }
    }
    
    // Check if attacker's type2 has advantage
    if (attacker.type_2 && typeAdvantages[attacker.type_2]) {
      if (typeAdvantages[attacker.type_2].includes(defender.type_1)) {
        multiplier *= 1.5;
      }
      if (defender.type_2 && typeAdvantages[attacker.type_2].includes(defender.type_2)) {
        multiplier *= 1.5;
      }
    }
    
    return multiplier;
  };

  const generateExplanation = (
    winner: Pokemon, 
    loser: Pokemon, 
    winnerScore: number, 
    loserScore: number,
    typeMultiplier: number
  ): string => {
    const totalStatsWinner = calculateTotalStats(winner);
    const totalStatsLoser = calculateTotalStats(loser);
    
    let explanation = `${winner.nom} has stronger overall stats `;
    
    if (totalStatsWinner > totalStatsLoser) {
      explanation += `(${totalStatsWinner} vs ${totalStatsLoser}). `;
    } else {
      explanation += `with better stat distribution. `;
    }
    
    if (typeMultiplier > 1.0) {
      explanation += `Type advantage gives ${winner.nom} a significant edge. `;
    }
    
    if (winner.points_vitesse > loser.points_vitesse) {
      explanation += `${winner.nom}'s higher speed allows it to attack first.`;
    } else if (winner.points_vitesse < loser.points_vitesse) {
      explanation += `Despite being slower, ${winner.nom}'s other advantages outweigh the speed difference.`;
    }
    
    return explanation;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Combat Simulator</h2>
        <p className="text-blue-200">Select two Pokémon to predict the battle outcome</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 rounded-full border-2 border-white/20 items-center justify-center z-10 shadow-xl">
          <span className="text-white font-bold text-sm">VS</span>
        </div>

        <PokemonSelector
          pokemon={pokemon}
          selectedPokemon={pokemon1}
          onSelect={setPokemon1}
          label="Challenger 1"
          color="blue"
        />

        <PokemonSelector
          pokemon={pokemon}
          selectedPokemon={pokemon2}
          onSelect={setPokemon2}
          label="Challenger 2"
          color="red"
        />
      </div>

      {pokemon1 && pokemon2 && (
        <>
          <div className="flex justify-center pt-4">
            <button
              onClick={predictWinner}
              className="group relative px-8 py-4 bg-gradient-to-r from-violet-700 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.9)] transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3 text-lg">
                <Swords className="w-6 h-6" />
                Predict Winner
              </span>
            </button>
          </div>

          {prediction && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl p-8 border border-yellow-400/30 animate-fadeIn backdrop-blur-sm shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full mb-4">
                  <Target className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-100 font-semibold text-sm uppercase tracking-wide">Prediction Result</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-2 drop-shadow-md">
                  {prediction.winner.nom}
                  <span className="text-2xl font-normal text-yellow-200/80 ml-2">wins!</span>
                </h3>
                <p className="text-xl text-yellow-100 mb-4">
                  Probability: <span className="font-bold text-yellow-400">{prediction.probability.toFixed(1)}%</span>
                </p>
                <p className="text-blue-100 text-sm bg-slate-900/50 p-4 rounded-lg border border-white/10">
                  {prediction.explanation}
                </p>
              </div>

              <div className="h-5 bg-slate-900/50 rounded-full overflow-hidden p-1 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  style={{ width: `${prediction.probability}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface PokemonSelectorProps {
  pokemon: Pokemon[];
  selectedPokemon: Pokemon | null;
  onSelect: (pokemon: Pokemon) => void;
  label: string;
  color: 'blue' | 'red';
}

function PokemonSelector({
  pokemon,
  selectedPokemon,
  onSelect,
  label,
  color,
}: PokemonSelectorProps) {
  const isBlue = color === 'blue';
  const borderColor = isBlue ? 'border-blue-400/30' : 'border-red-400/30';
  const bgGradient = isBlue
    ? 'from-blue-600/20 to-cyan-600/20'
    : 'from-red-600/20 to-orange-600/20';
  const focusRing = isBlue ? 'focus:ring-blue-400' : 'focus:ring-red-400';

  const typeMap: Record<string, string> = {
    '1': 'Fighting',
    '2': 'Flying',
    '3': 'Poison',
    '4': 'Ground',
    '5': 'Rock',
    '6': 'Bug',
    '7': 'Ghost',
    '8': 'Steel',
    '9': 'Fire',
    '10': 'Water',
    '11': 'Grass',
    '12': 'Electric',
    '13': 'Psychic',
    '14': 'Ice',
    '15': 'Dragon',
    '16': 'Dark',
    '17': 'Fairy',
    '18': 'Normal',
  };

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 border ${borderColor} shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-opacity-50`}>
      <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider opacity-90 flex items-center gap-2">
        <span className={`w-2 h-8 rounded-full ${isBlue ? 'bg-blue-400' : 'bg-red-400'}`}></span>
        {label}
      </h3>

      <div className="relative mb-8 group">
        <select
          value={selectedPokemon?.numero || ''}
          onChange={(e) => {
            const p = pokemon.find((p) => p.numero === Number(e.target.value));
            if (p) onSelect(p);
          }}
          className={`appearance-none w-full px-5 py-4 bg-slate-900/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 ${focusRing} transition-all cursor-pointer hover:bg-slate-900/80 pr-12`}
        >
          <option value="" className="bg-slate-900 text-gray-400">
            Select a Pokémon...
          </option>
          {pokemon.map((p) => (
            <option key={p.numero} value={p.numero} className="bg-slate-900">
              {p.nom} ({typeMap[p.type_1] || p.type_1})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none group-hover:text-white transition-colors" />
      </div>

      {selectedPokemon ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center pb-6 border-b border-white/10">
            <h4 className="text-3xl font-black text-white mb-2 drop-shadow-sm">
              {selectedPokemon.nom}
            </h4>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-sm font-medium text-blue-100">
                {typeMap[selectedPokemon.type_1] || selectedPokemon.type_1}
              </span>
              {selectedPokemon.type_2 && selectedPokemon.type_2 !== '0' && (
                <>
                  <span className="text-white/20">|</span>
                  <span className="text-sm font-medium text-blue-100">
                    {typeMap[selectedPokemon.type_2] || selectedPokemon.type_2}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Heart}
              label="HP"
              value={selectedPokemon.points_de_vie}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <StatCard
              icon={Swords}
              label="Attack"
              value={selectedPokemon.points_attaque}
              color="text-red-400"
              bgColor="bg-red-500/10"
            />
            <StatCard
              icon={Shield}
              label="Defense"
              value={selectedPokemon.points_deffence}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <StatCard
              icon={Zap}
              label="Speed"
              value={selectedPokemon.points_vitesse}
              color="text-yellow-400"
              bgColor="bg-yellow-500/10"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-sm text-blue-200/80 font-medium">Special Attack</span>
              <span className="text-xl font-bold text-purple-400">
                {selectedPokemon.points_attaque_speciale}
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-blue-200/80 font-medium">Special Defense</span>
              <span className="text-xl font-bold text-cyan-400">
                {selectedPokemon.point_defense_speciale}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
          <p className="text-white/30 text-sm font-medium">Waiting for selection...</p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className={`rounded-xl p-3 border border-white/5 ${bgColor} transition-transform hover:scale-105`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}