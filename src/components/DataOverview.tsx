import { useEffect, useState } from 'react';
import { supabase, Pokemon, Combat } from '../lib/supabase';
import { FileText, Activity } from 'lucide-react';
import StatsChart from './StatsChart';
import TypeDistribution from './TypeDistribution';

export default function DataOverview() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [combats, setCombats] = useState<Combat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pokemonRes, combatsRes] = await Promise.all([
        supabase.from('pokemon').select('*').order('numero').limit(10),
        supabase.from('combats').select('*').limit(10),
      ]);

      if (pokemonRes.data) setPokemon(pokemonRes.data);
      if (combatsRes.data) setCombats(combatsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Dataset Summary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Pokédex Dataset
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-blue-200">Total Pokémon:</dt>
                <dd className="text-white font-medium">800</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-200">Features:</dt>
                <dd className="text-white font-medium">12 columns</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-200">Legendary:</dt>
                <dd className="text-white font-medium">~8% (65 Pokémon)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-200">Key Stats:</dt>
                <dd className="text-white font-medium">HP, Attack, Defense, Speed</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Combat Dataset
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-blue-200">Total Combats:</dt>
                <dd className="text-white font-medium">50,000</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-200">Features:</dt>
                <dd className="text-white font-medium">3 columns</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-200">Structure:</dt>
                <dd className="text-white font-medium">First, Second, Winner</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blue-200">Purpose:</dt>
                <dd className="text-white font-medium">Win prediction training</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Sample Data</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-blue-300">
                Pokémon Sample (Top 10)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-blue-200">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-center">HP</th>
                    <th className="px-4 py-3 text-center">Attack</th>
                    <th className="px-4 py-3 text-center">Defense</th>
                    <th className="px-4 py-3 text-center">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {pokemon.map((p) => (
                    <tr key={p.numero} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">{p.numero}</td>
                      <td className="px-4 py-3 font-medium">{p.nom}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          {p.type_1}
                          {p.type_2 && (
                            <>
                              <span className="text-blue-300">/</span>
                              {p.type_2}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{p.points_de_vie}</td>
                      <td className="px-4 py-3 text-center">{p.points_attaque}</td>
                      <td className="px-4 py-3 text-center">{p.points_deffence}</td>
                      <td className="px-4 py-3 text-center">
                        {(p.taux_de_victoire * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsChart pokemon={pokemon} />
            <TypeDistribution pokemon={pokemon} />
          </div>
        </div>
      </section>
    </div>
  );
}
