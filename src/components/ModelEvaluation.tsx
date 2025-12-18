import { useEffect, useState } from 'react';
import { supabase, ModelResult } from '../lib/supabase';
import { Award, TrendingUp } from 'lucide-react';

export default function ModelEvaluation() {
  const [models, setModels] = useState<ModelResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data } = await supabase
        .from('model_results')
        .select('*')
        .order('created_at');

      if (data) setModels(data);
    } catch (error) {
      console.error('Error loading models:', error);
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

  const regressionModels = models.filter((m) => m.model_type === 'regression');
  const classificationModels = models.filter((m) => m.model_type === 'classification');

  const bestRegression = regressionModels.reduce(
    (best, curr) => (!best || (curr.r2_score ?? 0) > (best.r2_score ?? 0) ? curr : best),
    regressionModels[0]
  );

  const bestClassification = classificationModels.reduce(
    (best, curr) => (!best || (curr.accuracy ?? 0) > (best.accuracy ?? 0) ? curr : best),
    classificationModels[0]
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Best Performing Models</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-400/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Regression (Win Rate)</h3>
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold text-white">{bestRegression?.model_name}</p>
              <p className="text-sm text-blue-200 mt-1">Predicting combat win rates</p>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <dt className="text-xs text-blue-200 mb-1">R² Score</dt>
                <dd className="text-xl font-bold text-white">
                  {(bestRegression?.r2_score ?? 0).toFixed(4)}
                </dd>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <dt className="text-xs text-blue-200 mb-1">MSE</dt>
                <dd className="text-xl font-bold text-white">
                  {(bestRegression?.mse ?? 0).toFixed(4)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-400/30">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Classification (Legendary)
              </h3>
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold text-white">
                {bestClassification?.model_name}
              </p>
              <p className="text-sm text-green-200 mt-1">
                Identifying legendary Pokémon
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <dt className="text-xs text-green-200 mb-1">Accuracy</dt>
                <dd className="text-xl font-bold text-white">
                  {((bestClassification?.accuracy ?? 0) * 100).toFixed(1)}%
                </dd>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <dt className="text-xs text-green-200 mb-1">F1 Score</dt>
                <dd className="text-xl font-bold text-white">
                  {(bestClassification?.f1_score ?? 0).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">
          Regression Models Comparison
        </h2>
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-blue-200">
              <tr>
                <th className="px-6 py-4 text-left">Model</th>
                <th className="px-6 py-4 text-center">R² Score</th>
                <th className="px-6 py-4 text-center">MSE</th>
                <th className="px-6 py-4 text-center">MAE</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {regressionModels.map((model) => (
                <tr
                  key={model.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-6 py-4 font-medium">{model.model_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                      {(model.r2_score ?? 0).toFixed(4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(model.mse ?? 0).toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(model.mae ?? 0).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">
          Classification Models Comparison
        </h2>
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-blue-200">
              <tr>
                <th className="px-6 py-4 text-left">Model</th>
                <th className="px-6 py-4 text-center">Accuracy</th>
                <th className="px-6 py-4 text-center">Precision</th>
                <th className="px-6 py-4 text-center">Recall</th>
                <th className="px-6 py-4 text-center">F1 Score</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {classificationModels.map((model) => (
                <tr
                  key={model.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-6 py-4 font-medium">{model.model_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-semibold">
                      {((model.accuracy ?? 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(model.precision ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(model.recall ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(model.f1_score ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-blue-500/10 rounded-lg p-6 border border-blue-400/20">
        <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
        <ul className="space-y-2 text-blue-100">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong>Random Forest Regressor</strong> achieved the highest R² score of{' '}
              <strong>0.9891</strong>, showing excellent prediction accuracy for win rates
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong>SVM</strong> achieved the highest accuracy of{' '}
              <strong>93.75%</strong> in classifying legendary Pokémon, followed by Logistic Regression (92.5%) and KNN (91.25%)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              The low MSE values across all regression models indicate reliable predictions
              with minimal error, with Random Forest Regressor having the lowest MSE (0.0008)
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}