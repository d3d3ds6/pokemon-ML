import { Pokemon } from '../lib/supabase';

interface Props {
  pokemon: Pokemon[];
}

export default function TypeDistribution({ pokemon }: Props) {
  const typeWins: Record<string, { wins: number; total: number }> = {};

  pokemon.forEach((p) => {
    if (!typeWins[p.type_1]) {
      typeWins[p.type_1] = { wins: 0, total: 0 };
    }
    typeWins[p.type_1].wins += p.victoires;
    typeWins[p.type_1].total += p.combats;
  });

  const typeStats = Object.entries(typeWins)
    .map(([type, stats]) => ({
      type,
      winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      wins: stats.wins,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-blue-300 mb-6">
        Winner Count by Type
      </h3>
      <div className="space-y-3">
        {typeStats.map((stat, idx) => (
          <div key={stat.type} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-blue-200 font-medium capitalize">
                  {stat.type}
                </span>
                <span className="text-xs text-white font-bold">
                  {stat.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                  style={{ width: `${stat.winRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
