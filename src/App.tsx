import { useState } from 'react';
import { Database, BarChart3, Swords } from 'lucide-react';
import DataOverview from './components/DataOverview';
import ModelEvaluation from './components/ModelEvaluation';
import CombatPredictor from './components/CombatPredictor';
import pokemonBackground from './images/pokemon-background.jpg'; // Adjust path as needed

type TabType = 'data' | 'models' | 'predictor';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const tabs = [
    { id: 'data' as TabType, label: 'Data Overview', icon: Database },
    { id: 'models' as TabType, label: 'Model Evaluation', icon: BarChart3 },
    { id: 'predictor' as TabType, label: 'Combat Predictor', icon: Swords },
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-fixed bg-center"
      style={{ backgroundImage: `url(${pokemonBackground})` }}
    >
      {/* Overlay for better readability - RESTORED ORIGINAL OPACITIES */}
      <div className="min-h-screen bg-gradient-to-b from-black/70 via-black/50 to-black/70">
        {/* Added pb-32 for dropdown space */}
        <div className="container mx-auto px-4 py-8 pb-32">
          <header className="mb-10 text-center">
            {/* Adjusted title styling for readability over the background */}
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4 drop-shadow-lg tracking-tight">
              Pokémon Combat Analysis
            </h1>
            <p className="text-blue-200 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Machine Learning-Powered Battle Prediction System
            </p>
          </header>

          {/* Main Content Card: Using white/10 and backdrop-blur for the original look */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/30 shadow-2xl">
            <nav className="flex flex-wrap border-b border-white/20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-white/30 text-white border-b-2 border-yellow-400 shadow-lg'
                        : 'text-blue-100 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-6 md:p-8">
              {activeTab === 'data' && <DataOverview />}
              {activeTab === 'models' && <ModelEvaluation />}
              {activeTab === 'predictor' && <CombatPredictor />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;