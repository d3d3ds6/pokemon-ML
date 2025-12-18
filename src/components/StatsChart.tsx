import { Pokemon } from '../lib/supabase';

interface Props {
  pokemon: Pokemon[];
}

export default function StatsChart({ pokemon }: Props) {
  const avgStats = {
    hp: pokemon.reduce((sum, p) => sum + p.points_de_vie, 0) / pokemon.length || 0,
    attack: pokemon.reduce((sum, p) => sum + p.points_attaque, 0) / pokemon.length || 0,
    defense: pokemon.reduce((sum, p) => sum + p.points_deffence, 0) / pokemon.length || 0,
    speed: pokemon.reduce((sum, p) => sum + p.points_vitesse, 0) / pokemon.length || 0,
  };

  const maxStat = Math.max(avgStats.hp, avgStats.attack, avgStats.defense, avgStats.speed);

  const stats = [
    { name: 'HP', value: avgStats.hp, color: 'bg-red-500' },
    { name: 'Attack', value: avgStats.attack, color: 'bg-orange-500' },
    { name: 'Defense', value: avgStats.defense, color: 'bg-blue-500' },
    { name: 'Speed', value: avgStats.speed, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-blue-300 mb-6">
        Average Combat Stats Distribution
      </h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-200 font-medium">{stat.name}</span>
              <span className="text-sm text-white font-bold">
                {stat.value.toFixed(0)}
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                style={{ width: `${(stat.value / maxStat) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
