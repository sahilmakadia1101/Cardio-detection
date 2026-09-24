import { useState } from 'react';
import {
  Database,
  BarChart3,
  Sliders,
  Filter,
  Search,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Heart,
  Scale,
  Zap,
} from 'lucide-react';
import {
  DATASET_OVERVIEW,
  DATASET_PROPERTIES,
  CORRELATION_RANKING,
} from '../data/datasetInfo';

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePropertyId, setActivePropertyId] = useState('ap_hi');

  // Interactive Simulator State inside Dashboard
  const [simBp, setSimBp] = useState(130);
  const [simAge, setSimAge] = useState(54);
  const [simChol, setSimChol] = useState(2);
  const [simActive, setSimActive] = useState(1);
  const [simWeight, setSimWeight] = useState(76);

  // Filter properties
  const filteredProperties = DATASET_PROPERTIES.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeProp =
    DATASET_PROPERTIES.find((p) => p.id === activePropertyId) ||
    DATASET_PROPERTIES[0];

  // Quick mathematical simulator formula from model coefficients
  function calculateSimulatedRisk() {
    // scaled values
    const scaledBp = (simBp - 128.82) / 154.01;
    const scaledAge = (simAge - 52.84) / 6.77;
    const scaledChol = (simChol - 1.37) / 0.68;
    const scaledWeight = (simWeight - 74.21) / 14.4;
    const scaledActive = (simActive - 0.8) / 0.4;

    const z =
      0.106 +
      scaledBp * 6.037 +
      scaledAge * 0.368 +
      scaledChol * 0.356 +
      scaledWeight * 0.222 +
      scaledActive * -0.083;

    const prob = 1 / (1 + Math.exp(-z));
    return Math.min(Math.max(Math.round(prob * 100), 2), 99);
  }

  const simulatedRisk = calculateSimulatedRisk();

  return (
    <div className="page-container dashboard-page">
      {/* Dashboard Header */}
      <section className="dashboard-hero">
        <div className="hero-tag">
          <Database size={14} />
          <span>Exploratory Data Analysis · 70,000 Patient Cohort</span>
        </div>
        <h1 className="hero-title">
          Dataset Properties &amp; <span className="gradient-text">Feature Analytics</span>
        </h1>
        <p className="hero-subtitle">
          Examine the 11 biometric and clinical features extracted from the Kaggle Cardiovascular
          Disease dataset, their distributions, and their mathematical weights in our machine learning model.
        </p>
      </section>

      {/* Dataset KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap blue">
            <Database size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Training Records</span>
            <span className="kpi-value">{DATASET_OVERVIEW.totalRecords.toLocaleString()}</span>
            <span className="kpi-sub">Verified patient entries</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap red">
            <Heart size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Target Balance</span>
            <span className="kpi-value">{DATASET_OVERVIEW.balanceRatio}</span>
            <span className="kpi-sub">34,979 CVD+ vs 35,021 CVD-</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap purple">
            <Layers size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Model Architecture</span>
            <span className="kpi-value">Pipeline</span>
            <span className="kpi-sub">StandardScaler + LogisticReg</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap green">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Model Accuracy</span>
            <span className="kpi-value">{DATASET_OVERVIEW.modelAccuracy}</span>
            <span className="kpi-sub">AUC-ROC: {DATASET_OVERVIEW.modelAuc}</span>
          </div>
        </div>
      </div>

      {/* Feature Impact / Model Coefficients Chart */}
      <section className="dash-section">
        <div className="section-head">
          <div className="section-head-title">
            <BarChart3 size={18} className="accent-icon" />
            <h2>Feature Impact on Heart Disease (Model Coefficients)</h2>
          </div>
          <span className="section-badge">Logistic Regression Odds Ratios</span>
        </div>

        <div className="weights-container">
          <p className="weights-desc">
            Positive coefficients raise cardiovascular disease probability; negative coefficients represent protective factors.
            Notice how <strong>Systolic Blood Pressure (ap_hi)</strong> and <strong>Age</strong> overwhelmingly dominate risk determination.
          </p>

          <div className="weights-list">
            {CORRELATION_RANKING.map((item, idx) => {
              const isPositive = item.score > 0;
              const barWidth = Math.min(Math.abs(item.score) * 200, 100);

              return (
                <div
                  key={idx}
                  className={`weight-row ${item.highlight ? 'highlighted' : ''}`}
                >
                  <div className="weight-meta">
                    <span className="weight-name">{item.feature}</span>
                    <span
                      className={`weight-dir ${
                        item.direction === 'protective'
                          ? 'protective'
                          : isPositive
                          ? 'positive'
                          : 'negative'
                      }`}
                    >
                      {item.direction === 'protective'
                        ? '🛡️ Protective'
                        : isPositive
                        ? '▲ Increases Risk'
                        : '▼ Inverse/Neutral'}
                    </span>
                  </div>

                  <div className="weight-bar-track">
                    <div
                      className={`weight-bar-fill ${
                        item.direction === 'protective'
                          ? 'protective'
                          : isPositive
                          ? 'positive'
                          : 'negative'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <span className="weight-score">
                    {isPositive ? `+${item.score}` : `${item.score}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dataset Properties Explorer */}
      <section className="dash-section">
        <div className="section-head">
          <div className="section-head-title">
            <Sliders size={18} className="accent-icon" />
            <h2>Dataset Properties &amp; Biometric Variables (11 Features)</h2>
          </div>
          <span className="section-badge">{filteredProperties.length} Properties Displayed</span>
        </div>

        {/* Filter and Search Bar */}
        <div className="filter-bar">
          <div className="filter-pills">
            <Filter size={15} className="filter-icon" />
            {['All', 'Examination', 'Demographic', 'Lab Result', 'Lifestyle'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search features (e.g. cholesterol, BP, age)…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Properties Grid */}
        <div className="properties-grid">
          {filteredProperties.map((p) => {
            const isSelected = p.id === activePropertyId;
            return (
              <div
                key={p.id}
                className={`property-card ${isSelected ? 'active-card' : ''}`}
                onClick={() => setActivePropertyId(p.id)}
              >
                <div className="property-header">
                  <div>
                    <span className="prop-code">{p.id}</span>
                    <h3 className="prop-title">{p.name}</h3>
                  </div>
                  <span className={`prop-badge ${p.category.toLowerCase().replace(' ', '-')}`}>
                    {p.category}
                  </span>
                </div>

                <p className="prop-desc">{p.description}</p>

                <div className="prop-specs-grid">
                  <div className="prop-spec">
                    <span className="spec-k">Dataset Mean</span>
                    <span className="spec-v">
                      {p.mean} {p.unit}
                    </span>
                  </div>
                  <div className="prop-spec">
                    <span className="spec-k">Normal Range</span>
                    <span className="spec-v">{p.normalRange}</span>
                  </div>
                  <div className="prop-spec">
                    <span className="spec-k">Model Impact</span>
                    <span
                      className="spec-v"
                      style={{
                        color: p.modelImpact.startsWith('+') ? '#ff6b6b' : '#38bdf8',
                      }}
                    >
                      {p.modelImpact} ({p.impactLevel})
                    </span>
                  </div>
                </div>

                {/* Distribution preview */}
                <div className="prop-distro-preview">
                  <div className="distro-label">Cohort Breakdown &amp; CVD Rate:</div>
                  <div className="distro-bars">
                    {p.distribution.map((d, i) => (
                      <div key={i} className="distro-item">
                        <div className="distro-meta">
                          <span className="d-label">{d.label}</span>
                          <span className="d-val">
                            {d.share}% share ·{' '}
                            <strong style={{ color: d.cvdRate > 50 ? '#ef4444' : '#10b981' }}>
                              {d.cvdRate}% CVD
                            </strong>
                          </span>
                        </div>
                        <div className="d-track">
                          <div
                            className="d-fill"
                            style={{
                              width: `${d.cvdRate}%`,
                              background:
                                d.cvdRate > 50
                                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                  : 'linear-gradient(90deg, #10b981, #38bdf8)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Feature Sensitivity Simulator */}
      <section className="dash-section sim-section">
        <div className="section-head">
          <div className="section-head-title">
            <Zap size={18} className="accent-icon" />
            <h2>Interactive Biomarker Simulator</h2>
          </div>
          <span className="section-badge">Live ML Response</span>
        </div>

        <p className="weights-desc">
          Adjust the sliders below to see how varying key physiological parameters impacts the model's
          computed cardiovascular disease risk in real time.
        </p>

        <div className="sim-layout">
          <div className="sim-controls">
            {/* Slider 1: Systolic BP */}
            <div className="sim-slider-row">
              <div className="slider-label-row">
                <span className="s-name">Systolic Blood Pressure (ap_hi)</span>
                <span className="s-val">{simBp} mmHg</span>
              </div>
              <input
                type="range"
                min="90"
                max="200"
                value={simBp}
                onChange={(e) => setSimBp(Number(e.target.value))}
                className="sim-slider"
              />
              <div className="slider-hints">
                <span>90 (Optimal)</span>
                <span>120 (Normal)</span>
                <span>140+ (Stage 2)</span>
                <span>200 (Crisis)</span>
              </div>
            </div>

            {/* Slider 2: Age */}
            <div className="sim-slider-row">
              <div className="slider-label-row">
                <span className="s-name">Patient Age</span>
                <span className="s-val">{simAge} Years</span>
              </div>
              <input
                type="range"
                min="30"
                max="75"
                value={simAge}
                onChange={(e) => setSimAge(Number(e.target.value))}
                className="sim-slider"
              />
              <div className="slider-hints">
                <span>30 yrs</span>
                <span>45 yrs</span>
                <span>60 yrs</span>
                <span>75 yrs</span>
              </div>
            </div>

            {/* Slider 3: Weight */}
            <div className="sim-slider-row">
              <div className="slider-label-row">
                <span className="s-name">Body Weight</span>
                <span className="s-val">{simWeight} kg</span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                value={simWeight}
                onChange={(e) => setSimWeight(Number(e.target.value))}
                className="sim-slider"
              />
              <div className="slider-hints">
                <span>50 kg</span>
                <span>70 kg</span>
                <span>90 kg</span>
                <span>130 kg</span>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="sim-toggles-row">
              <div className="sim-toggle-block">
                <span className="s-name">Cholesterol Level:</span>
                <div className="sim-btn-group">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`sim-mini-btn ${simChol === lvl ? 'active' : ''}`}
                      onClick={() => setSimChol(lvl)}
                    >
                      Level {lvl} {lvl === 1 ? '(Normal)' : lvl === 2 ? '(Above)' : '(High)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sim-toggle-block">
                <span className="s-name">Physical Activity:</span>
                <div className="sim-btn-group">
                  <button
                    type="button"
                    className={`sim-mini-btn ${simActive === 1 ? 'active-green' : ''}`}
                    onClick={() => setSimActive(1)}
                  >
                    Active 🏃
                  </button>
                  <button
                    type="button"
                    className={`sim-mini-btn ${simActive === 0 ? 'active' : ''}`}
                    onClick={() => setSimActive(0)}
                  >
                    Inactive 🛋️
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Simulator Output Meter */}
          <div className="sim-output-card">
            <div className="sim-meter-title">Simulated Model Output</div>
            <div
              className="sim-big-score"
              style={{
                color: simulatedRisk >= 60 ? '#ef4444' : simulatedRisk >= 35 ? '#f59e0b' : '#10b981',
              }}
            >
              {simulatedRisk}%
            </div>
            <div className="sim-status-label">
              {simulatedRisk >= 60
                ? '🚨 High Risk Prediction'
                : simulatedRisk >= 35
                ? '⚠️ Moderate Risk Prediction'
                : '✅ Low Risk Prediction'}
            </div>

            <div className="sim-meter-bar">
              <div
                className="sim-meter-fill"
                style={{
                  width: `${simulatedRisk}%`,
                  background:
                    simulatedRisk >= 60
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                      : 'linear-gradient(90deg, #10b981, #38bdf8)',
                }}
              />
            </div>

            <p className="sim-explanation">
              {simBp >= 140
                ? 'Elevated Systolic Blood Pressure strongly shifts the logistic sigmoid toward a positive CVD prediction.'
                : simAge >= 55
                ? 'Age combined with cholesterol elevation contributes heavily to the risk profile.'
                : 'Current parameters reside within lower risk bounds.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
