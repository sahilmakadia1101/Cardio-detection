import { useState, useRef } from 'react';
import {
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { predictCardioRisk } from '../services/api';
import { PRESET_PATIENTS } from '../data/datasetInfo';

const VALIDATORS = {
  age: (v) => {
    const n = Number(v);
    if (!v) return 'Age is required';
    if (n < 1 || n > 120) return 'Age must be between 1–120 years';
    return null;
  },
  height: (v) => {
    const n = Number(v);
    if (!v) return 'Height is required';
    if (n < 50 || n > 250) return 'Height must be between 50–250 cm';
    return null;
  },
  weight: (v) => {
    const n = Number(v);
    if (!v) return 'Weight is required';
    if (n < 10 || n > 300) return 'Weight must be between 10–300 kg';
    return null;
  },
  ap_hi: (v) => {
    const n = Number(v);
    if (!v) return 'Systolic BP is required';
    if (n < 60 || n > 300) return 'Value must be between 60–300 mmHg';
    return null;
  },
  ap_lo: (v, form) => {
    const n = Number(v);
    if (!v) return 'Diastolic BP is required';
    if (n < 40 || n > 200) return 'Value must be between 40–200 mmHg';
    if (form && Number(form.ap_hi) && n >= Number(form.ap_hi))
      return 'Must be less than systolic BP';
    return null;
  },
};

const DEFAULT_FORM = {
  age: '50',
  gender: 2,
  height: '170',
  weight: '65',
  ap_hi: '120',
  ap_lo: '80',
  cholesterol: '1',
  gluc: '1',
  smoke: 0,
  alco: 0,
  active: 1,
};

function calcBMI(h, w) {
  if (!h || !w) return null;
  const hM = Number(h) / 100;
  if (hM <= 0) return null;
  return (Number(w) / (hM * hM)).toFixed(1);
}

function getBmiInfo(bmi) {
  if (!bmi) return { label: 'Awaiting values', color: '#8892b0' };
  const b = Number(bmi);
  if (b < 18.5) return { label: 'Underweight (<18.5)', color: '#38bdf8' };
  if (b < 25) return { label: 'Normal Weight (18.5–24.9)', color: '#10b981' };
  if (b < 30) return { label: 'Overweight (25–29.9)', color: '#f59e0b' };
  return { label: 'Obese (≥30)', color: '#ef4444' };
}

function getBpStage(sys, dia) {
  const s = Number(sys);
  const d = Number(dia);
  if (!s || !d) return null;
  if (s >= 140 || d >= 90) return { label: 'Stage 2 Hypertension', color: '#ef4444' };
  if (s >= 130 || d >= 80) return { label: 'Stage 1 Hypertension', color: '#f97316' };
  if (s >= 120 && d < 80) return { label: 'Elevated BP', color: '#eab308' };
  return { label: 'Normal Blood Pressure', color: '#10b981' };
}

export default function AssessmentPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  const set = (key) => (val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: null }));
    if (result) setResult(null);
  };

  const bmi = calcBMI(form.height, form.weight);
  const bmiInfo = getBmiInfo(bmi);
  const bpStage = getBpStage(form.ap_hi, form.ap_lo);

  function applyPreset(preset) {
    setForm(preset.data);
    setErrors({});
    setResult(null);
  }

  function validate() {
    const newErrors = {};
    Object.entries(VALIDATORS).forEach(([key, fn]) => {
      const err = fn(form[key], form);
      if (err) newErrors[key] = err;
    });
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.cholesterol) newErrors.cholesterol = 'Cholesterol level is required';
    if (!form.gluc) newErrors.gluc = 'Glucose level is required';
    if (form.smoke === null) newErrors.smoke = 'Please select smoking status';
    if (form.alco === null) newErrors.alco = 'Please select alcohol status';
    if (form.active === null) newErrors.active = 'Please select physical activity status';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstErrEl = document.querySelector('.error, .field-error');
      firstErrEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await predictCardioRisk(form);
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
    setErrors({});
    setResult(null);
  }

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>Cardiovascular Risk Inference Engine · Trained on 70,000 Records</span>
        </div>

        <h1 className="hero-title">
          Cardiovascular Disease<br />
          <span className="gradient-text">Clinical Risk Assessment</span>
        </h1>

        <p className="hero-subtitle">
          Input your physiological and lifestyle biomarkers to evaluate heart disease risk.
          Predictions are computed in real time using our trained Machine Learning pipeline (<code>cardio_model.pkl</code>).
        </p>

        {/* ECG SVG */}
        <div className="ecg-wrapper" aria-hidden="true">
          <svg className="ecg-svg" viewBox="0 0 360 50" preserveAspectRatio="none">
            <path
              className="ecg-path"
              d="M0,25 L30,25 L40,25 L50,5 L60,45 L70,5 L80,25 L100,25 L110,25 L120,5 L130,45 L140,5 L150,25 L180,25 L190,25 L200,8 L210,42 L220,8 L230,25 L260,25 L270,25 L280,5 L290,45 L300,5 L310,25 L360,25"
            />
          </svg>
        </div>
      </section>

      {/* Preset Profiles Bar */}
      <div className="presets-bar">
        <span className="presets-label">
          <Zap size={14} className="accent-icon" />
          <span>Quick Test Profiles:</span>
        </span>
        <div className="presets-list">
          {PRESET_PATIENTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="preset-btn"
              onClick={() => applyPreset(p)}
              title={p.badge}
            >
              <span>{p.label}</span>
              <span className="preset-pill">{p.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Health Indicators Bar */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon heart-icon">🫀</div>
          <div className="stat-info">
            <div className="stat-value">ML Model Active</div>
            <div className="stat-name">StandardScaler + LogisticReg</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bmi-icon">⚖️</div>
          <div className="stat-info">
            <div className="stat-value">
              {bmi ? `BMI ${bmi}` : 'BMI —'}
            </div>
            <div className="stat-name" style={{ color: bmiInfo.color }}>
              {bmiInfo.label}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bp-icon">🩺</div>
          <div className="stat-info">
            <div className="stat-value">
              {form.ap_hi && form.ap_lo
                ? `${form.ap_hi}/${form.ap_lo} mmHg`
                : 'BP —/—'}
            </div>
            <div
              className="stat-name"
              style={{ color: bpStage ? bpStage.color : 'var(--text-muted)' }}
            >
              {bpStage ? bpStage.label : 'Blood Pressure Status'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Assessment Form */}
      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Demographics */}
          <div className="form-section-title">
            <span className="section-icon">👤</span>
            <span>1. Personal & Body Metrics</span>
          </div>

          <div className="form-group form-group-3">
            <div className="field">
              <label className="field-label" htmlFor="age">
                Age <span className="unit">(years)</span>
              </label>
              <input
                id="age"
                type="number"
                className={`field-input ${errors.age ? 'error' : ''}`}
                placeholder="e.g. 52"
                value={form.age}
                onChange={(e) => set('age')(e.target.value)}
                min="1"
                max="120"
              />
              {errors.age && <span className="field-error">⚠ {errors.age}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="height">
                Height <span className="unit">(cm)</span>
              </label>
              <input
                id="height"
                type="number"
                className={`field-input ${errors.height ? 'error' : ''}`}
                placeholder="e.g. 172"
                value={form.height}
                onChange={(e) => set('height')(e.target.value)}
                min="50"
                max="250"
              />
              {errors.height && <span className="field-error">⚠ {errors.height}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="weight">
                Weight <span className="unit">(kg)</span>
              </label>
              <input
                id="weight"
                type="number"
                className={`field-input ${errors.weight ? 'error' : ''}`}
                placeholder="e.g. 74"
                value={form.weight}
                onChange={(e) => set('weight')(e.target.value)}
                min="10"
                max="300"
              />
              {errors.weight && <span className="field-error">⚠ {errors.weight}</span>}
            </div>
          </div>

          <div className="form-group">
            <div className="field">
              <label className="field-label">Biological Gender</label>
              <div className="radio-group">
                <button
                  type="button"
                  className={`radio-btn ${form.gender === 2 ? 'active' : ''}`}
                  onClick={() => set('gender')(2)}
                  aria-pressed={form.gender === 2}
                >
                  ♂ Male
                </button>
                <button
                  type="button"
                  className={`radio-btn ${form.gender === 1 ? 'active' : ''}`}
                  onClick={() => set('gender')(1)}
                  aria-pressed={form.gender === 1}
                >
                  ♀ Female
                </button>
              </div>
              {errors.gender && <span className="field-error">⚠ {errors.gender}</span>}
            </div>
          </div>

          <div className="form-divider" data-label="Cardiovascular Vitals" />

          {/* Section 2: Blood Pressure */}
          <div className="form-section-title">
            <span className="section-icon">🩺</span>
            <span>2. Arterial Blood Pressure</span>
          </div>

          <div className="form-group">
            <div className="field">
              <label className="field-label" htmlFor="ap_hi">
                Systolic Pressure (ap_hi) <span className="unit">(mmHg)</span>
              </label>
              <input
                id="ap_hi"
                type="number"
                className={`field-input ${errors.ap_hi ? 'error' : ''}`}
                placeholder="e.g. 120 (Standard normal)"
                value={form.ap_hi}
                onChange={(e) => set('ap_hi')(e.target.value)}
                min="60"
                max="300"
              />
              {errors.ap_hi && <span className="field-error">⚠ {errors.ap_hi}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="ap_lo">
                Diastolic Pressure (ap_lo) <span className="unit">(mmHg)</span>
              </label>
              <input
                id="ap_lo"
                type="number"
                className={`field-input ${errors.ap_lo ? 'error' : ''}`}
                placeholder="e.g. 80 (Standard normal)"
                value={form.ap_lo}
                onChange={(e) => set('ap_lo')(e.target.value)}
                min="40"
                max="200"
              />
              {errors.ap_lo && <span className="field-error">⚠ {errors.ap_lo}</span>}
            </div>
          </div>

          <div className="form-divider" data-label="Laboratory Tests" />

          {/* Section 3: Lab Results */}
          <div className="form-section-title">
            <span className="section-icon">🧪</span>
            <span>3. Serum Lab Markers</span>
          </div>

          <div className="form-group">
            <div className="field">
              <label className="field-label" htmlFor="cholesterol">
                Serum Cholesterol Level
              </label>
              <div className="select-wrapper">
                <select
                  id="cholesterol"
                  className={`field-select ${errors.cholesterol ? 'error' : ''}`}
                  value={form.cholesterol}
                  onChange={(e) => set('cholesterol')(e.target.value)}
                >
                  <option value="">Select cholesterol range…</option>
                  <option value="1">Level 1: Normal (&lt; 200 mg/dL)</option>
                  <option value="2">Level 2: Above Normal (200–239 mg/dL)</option>
                  <option value="3">Level 3: Well Above Normal (≥ 240 mg/dL)</option>
                </select>
              </div>
              {errors.cholesterol && <span className="field-error">⚠ {errors.cholesterol}</span>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="gluc">
                Fasting Blood Glucose Level
              </label>
              <div className="select-wrapper">
                <select
                  id="gluc"
                  className={`field-select ${errors.gluc ? 'error' : ''}`}
                  value={form.gluc}
                  onChange={(e) => set('gluc')(e.target.value)}
                >
                  <option value="">Select glucose range…</option>
                  <option value="1">Level 1: Normal (&lt; 100 mg/dL)</option>
                  <option value="2">Level 2: Above Normal (100–125 mg/dL)</option>
                  <option value="3">Level 3: Well Above Normal (≥ 126 mg/dL)</option>
                </select>
              </div>
              {errors.gluc && <span className="field-error">⚠ {errors.gluc}</span>}
            </div>
          </div>

          <div className="form-divider" data-label="Lifestyle & Behavior" />

          {/* Section 4: Lifestyle */}
          <div className="form-section-title">
            <span className="section-icon">🏃</span>
            <span>4. Subjective Lifestyle Factors</span>
          </div>

          <div className="form-group form-group-3">
            <div className="field">
              <label className="field-label">🚬 Tobacco Smoking</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${form.smoke === 1 ? 'active' : ''}`}
                  onClick={() => set('smoke')(1)}
                >
                  Smoker
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.smoke === 0 ? 'active-green' : ''}`}
                  onClick={() => set('smoke')(0)}
                >
                  Non-Smoker
                </button>
              </div>
              {errors.smoke && <span className="field-error">⚠ {errors.smoke}</span>}
            </div>

            <div className="field">
              <label className="field-label">🍷 Alcohol Intake</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${form.alco === 1 ? 'active' : ''}`}
                  onClick={() => set('alco')(1)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.alco === 0 ? 'active-green' : ''}`}
                  onClick={() => set('alco')(0)}
                >
                  No
                </button>
              </div>
              {errors.alco && <span className="field-error">⚠ {errors.alco}</span>}
            </div>

            <div className="field">
              <label className="field-label">🏃 Physical Activity</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${form.active === 1 ? 'active-green' : ''}`}
                  onClick={() => set('active')(1)}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.active === 0 ? 'active' : ''}`}
                  onClick={() => set('active')(0)}
                >
                  Sedentary
                </button>
              </div>
              {errors.active && <span className="field-error">⚠ {errors.active}</span>}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="form-divider" />
          <div className="submit-area">
            <button
              type="submit"
              id="btn-analyze"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Evaluating with ML Model…</span>
                </>
              ) : (
                <>
                  <Heart size={20} className="pulse-heart" />
                  <span>Run Model Risk Assessment</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>Reset All Fields</span>
            </button>
          </div>
        </form>

        {/* Prediction Results Display */}
        <div ref={resultRef}>
          {result && (
            <div className="result-panel">
              <div
                className={`result-card-rich ${
                  result.prediction === 0 ? 'healthy' : 'at-risk'
                }`}
              >
                {/* Result Top Banner */}
                <div className="result-header-row">
                  <div className="result-main-badge">
                    {result.prediction === 0 ? (
                      <CheckCircle className="badge-icon-svg" size={24} />
                    ) : (
                      <ShieldAlert className="badge-icon-svg" size={24} />
                    )}
                    <div>
                      <div className="badge-sub">Cardiovascular Prediction</div>
                      <h2 className="badge-title">
                        {result.prediction === 0
                          ? 'Low Cardiovascular Risk Detected'
                          : 'Elevated Cardiovascular Risk Detected'}
                      </h2>
                    </div>
                  </div>

                  <div className="source-tag">
                    <Activity size={13} />
                    <span>
                      {result.source === 'fastapi_backend'
                        ? 'FastAPI Server: cardio_model.pkl'
                        : 'Local Pipeline: cardio_model.pkl'}
                    </span>
                  </div>
                </div>

                {/* Score & Risk Breakdown */}
                <div className="result-grid-cols">
                  {/* Gauge Card */}
                  <div className="result-metric-box">
                    <div className="metric-box-title">Disease Probability</div>
                    <div className="risk-percentage-wrap">
                      <span
                        className="risk-percentage-num"
                        style={{
                          color:
                            result.probability_disease > 0.5
                              ? '#ef4444'
                              : '#10b981',
                        }}
                      >
                        {Math.round(result.probability_disease * 100)}%
                      </span>
                      <span className="risk-percentage-label">
                        Risk Probability
                      </span>
                    </div>

                    <div className="risk-meter-bar">
                      <div
                        className="risk-meter-fill"
                        style={{
                          width: `${Math.round(result.probability_disease * 100)}%`,
                          background:
                            result.probability_disease > 0.5
                              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                              : 'linear-gradient(90deg, #10b981, #38bdf8)',
                        }}
                      />
                    </div>

                    <div className="risk-meter-legend">
                      <span>0% Healthy</span>
                      <span>50% Threshold</span>
                      <span>100% Risk</span>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="result-metric-box">
                    <div className="metric-box-title">Clinical Interpretation</div>
                    <p className="metric-summary-text">
                      {result.prediction === 0
                        ? `The model calculates a ${(result.probability_no_disease * 100).toFixed(1)}% probability of healthy cardiovascular function based on current physiological markers.`
                        : `The model identifies a ${(result.probability_disease * 100).toFixed(1)}% probability of underlying cardiovascular pathology or risk traits.`}
                    </p>
                    <div className="key-metrics-inline">
                      <div className="key-pill">
                        <span className="pill-k">Calculated BMI</span>
                        <span className="pill-v">{result.bmi || bmi} kg/m²</span>
                      </div>
                      <div className="key-pill">
                        <span className="pill-k">Blood Pressure</span>
                        <span className="pill-v">{form.ap_hi}/{form.ap_lo} mmHg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contributing Risk Factors */}
                {result.contributing_factors && result.contributing_factors.length > 0 && (
                  <div className="factors-section">
                    <h3 className="section-subheading">
                      <AlertCircle size={16} />
                      <span>Identified Contributing Risk Factors:</span>
                    </h3>
                    <ul className="factors-list">
                      {result.contributing_factors.map((f, i) => (
                        <li key={i} className="factor-item">
                          <span className="factor-bullet">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h3 className="section-subheading">
                      <TrendingUp size={16} />
                      <span>Actionable Clinical Recommendations:</span>
                    </h3>
                    <div className="recommendations-grid">
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="rec-card">
                          <ChevronRight size={16} className="rec-arrow" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="result-actions-row">
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} />
                    <span>Print Report</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn primary"
                    onClick={handleReset}
                  >
                    <RotateCcw size={15} />
                    <span>Test Another Patient</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medical Disclaimer */}
      <p className="disclaimer">
        ⚠️ <strong>Medical Disclaimer:</strong> This software is engineered for educational, clinical research,
        and machine learning demonstration purposes only. It is not a certified diagnostic device.
        Always consult a licensed medical professional for cardiovascular diagnoses and prescriptions.
      </p>
    </div>
  );
}
