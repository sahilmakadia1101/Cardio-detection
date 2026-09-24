import {
  Info,
  Cpu,
  Layers,
  ShieldCheck,
  Code2,
  Terminal,
  Activity,
  FileText,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="page-container about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-tag">
          <Info size={14} />
          <span>Project Overview &amp; Technical Architecture</span>
        </div>
        <h1 className="hero-title">
          Cardiovascular Disease Detection <br />
          <span className="gradient-text">Machine Learning System</span>
        </h1>
        <p className="hero-subtitle">
          An end-to-end clinical decision support prototype merging an optimized Scikit-Learn
          classification pipeline (<code>cardio_model.pkl</code>) with a high-performance FastAPI
          backend and a modern responsive user interface.
        </p>
      </section>

      {/* Grid of Core Pillars */}
      <div className="about-cards-grid">
        <div className="about-feature-card">
          <div className="about-card-icon red">
            <Activity size={24} />
          </div>
          <h3>Clinical Challenge</h3>
          <p>
            Cardiovascular diseases (CVDs) remain the leading cause of mortality globally,
            claiming an estimated 17.9 million lives each year according to the World Health
            Organization. Early identification of asymptomatic risk factors drastically lowers acute
            coronary events.
          </p>
        </div>

        <div className="about-feature-card">
          <div className="about-card-icon blue">
            <Cpu size={24} />
          </div>
          <h3>ML Model Pipeline</h3>
          <p>
            Trained on 70,000 real patient medical records from the Kaggle CVD dataset.
            Employs a two-stage <code>Pipeline</code> consisting of <code>StandardScaler</code> feature
            normalization followed by an L2-regularized <code>LogisticRegression</code> classifier.
          </p>
        </div>

        <div className="about-feature-card">
          <div className="about-card-icon green">
            <Terminal size={24} />
          </div>
          <h3>FastAPI Backend</h3>
          <p>
            Asynchronous Python microservice providing sub-5ms inference latency.
            Utilizes Pydantic for rigid input data validation, calculates dynamic clinical
            recommendations, and returns probability distributions via <code>POST /predict</code>.
          </p>
        </div>

        <div className="about-feature-card">
          <div className="about-card-icon purple">
            <Layers size={24} />
          </div>
          <h3>Modern React Frontend</h3>
          <p>
            Vite-powered single page application featuring real-time BMI computation,
            blood pressure stage classifications, interactive dataset property visualizer,
            and preset clinical test profiles.
          </p>
        </div>
      </div>

      {/* End-to-End Architecture Flow */}
      <section className="about-section">
        <div className="section-head">
          <div className="section-head-title">
            <GitBranch size={18} className="accent-icon" />
            <h2>System Architecture &amp; Data Pipeline</h2>
          </div>
          <span className="section-badge">Full Stack Integration</span>
        </div>

        <div className="pipeline-flow">
          <div className="pipeline-step">
            <div className="step-num">01</div>
            <h4>Data Ingestion</h4>
            <p>70,000 Patient Records</p>
            <span className="step-detail">Kaggle CVD Dataset with 11 physiological variables</span>
          </div>

          <div className="pipeline-arrow">➔</div>

          <div className="pipeline-step">
            <div className="step-num">02</div>
            <h4>StandardScaler</h4>
            <p>Z-Score Normalization</p>
            <span className="step-detail">μ=0, σ=1 transformation across continuous features</span>
          </div>

          <div className="pipeline-arrow">➔</div>

          <div className="pipeline-step">
            <div className="step-num">03</div>
            <h4>Logistic Regression</h4>
            <p>Binary Classification</p>
            <span className="step-detail">Sigmoid probability: P(CVD=1 | X), 73.2% accuracy</span>
          </div>

          <div className="pipeline-arrow">➔</div>

          <div className="pipeline-step">
            <div className="step-num">04</div>
            <h4>FastAPI Server</h4>
            <p>Inference Microservice</p>
            <span className="step-detail">Loads cardio_model.pkl &amp; serves /predict</span>
          </div>

          <div className="pipeline-arrow">➔</div>

          <div className="pipeline-step">
            <div className="step-num">05</div>
            <h4>React UI</h4>
            <p>Interactive Client</p>
            <span className="step-detail">User inputs, dynamic charts, live risk analytics</span>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="about-section">
        <div className="section-head">
          <div className="section-head-title">
            <Code2 size={18} className="accent-icon" />
            <h2>Backend API Specification</h2>
          </div>
          <span className="section-badge">FastAPI REST Endpoints</span>
        </div>

        <div className="api-docs-grid">
          <div className="api-doc-box">
            <div className="api-endpoint-badge post">
              <span className="http-method">POST</span>
              <code>/predict</code>
            </div>
            <p className="api-doc-desc">
              Accepts 11 patient features and outputs the binary diagnosis (0 or 1), probability scores,
              identified risk factors, and actionable lifestyle recommendations.
            </p>

            <div className="code-block-header">Example Request JSON:</div>
            <pre className="code-block">
{`{
  "age_years": 54.0,
  "gender": 2,
  "height": 175.0,
  "weight": 82.0,
  "ap_hi": 140,
  "ap_lo": 90,
  "cholesterol": 2,
  "gluc": 1,
  "smoke": 0,
  "alco": 0,
  "active": 1
}`}
            </pre>
          </div>

          <div className="api-doc-box">
            <div className="api-endpoint-badge get">
              <span className="http-method">GET</span>
              <code>/health</code> &amp; <code>/model-info</code>
            </div>
            <p className="api-doc-desc">
              Returns operational status, model weights, dataset means, and confirms that
              <code>cardio_model.pkl</code> is loaded into backend memory.
            </p>

            <div className="code-block-header">Example Response JSON:</div>
            <pre className="code-block">
{`{
  "prediction": 1,
  "risk_level": "High Risk",
  "probability_disease": 0.764,
  "probability_no_disease": 0.236,
  "bmi": 26.8,
  "bmi_category": "Overweight",
  "contributing_factors": [
    "Elevated Blood Pressure (Stage 2: 140/90 mmHg)",
    "Borderline High Cholesterol (Level 2)"
  ]
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Dataset & Biomarker Reference */}
      <section className="about-section">
        <div className="section-head">
          <div className="section-head-title">
            <FileText size={18} className="accent-icon" />
            <h2>Clinical Biomarker Definitions</h2>
          </div>
          <span className="section-badge">11 Input Variables</span>
        </div>

        <div className="biomarkers-table-wrap">
          <table className="biomarkers-table">
            <thead>
              <tr>
                <th>Feature Name</th>
                <th>Variable Type</th>
                <th>Units / Encoding</th>
                <th>Clinical Relevance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ap_hi</strong> (Systolic BP)</td>
                <td><span className="tag-type">Continuous</span></td>
                <td>mmHg</td>
                <td>Peak arterial pressure during ventricular contraction; primary driver of stroke and heart failure.</td>
              </tr>
              <tr>
                <td><strong>ap_lo</strong> (Diastolic BP)</td>
                <td><span className="tag-type">Continuous</span></td>
                <td>mmHg</td>
                <td>Arterial resting pressure between heartbeats; reflects vascular compliance and systemic resistance.</td>
              </tr>
              <tr>
                <td><strong>age_years</strong></td>
                <td><span className="tag-type">Continuous</span></td>
                <td>Years</td>
                <td>Strongest non-modifiable demographic risk indicator; vascular elasticity degrades over decades.</td>
              </tr>
              <tr>
                <td><strong>cholesterol</strong></td>
                <td><span className="tag-type">Ordinal</span></td>
                <td>1: Normal, 2: Above, 3: High</td>
                <td>Elevated LDL promotes atheromatous plaque build-up inside arterial walls.</td>
              </tr>
              <tr>
                <td><strong>gluc</strong> (Fasting Glucose)</td>
                <td><span className="tag-type">Ordinal</span></td>
                <td>1: Normal, 2: Above, 3: High</td>
                <td>Hyperglycemia and diabetic conditions cause chronic microvascular inflammation.</td>
              </tr>
              <tr>
                <td><strong>weight &amp; height</strong></td>
                <td><span className="tag-type">Continuous</span></td>
                <td>kg / cm</td>
                <td>Determines Body Mass Index (BMI). Excess adiposity strains cardiovascular output.</td>
              </tr>
              <tr>
                <td><strong>active</strong> (Exercise)</td>
                <td><span className="tag-type">Binary</span></td>
                <td>0: Inactive, 1: Active</td>
                <td>Regular aerobic exercise improves endothelial nitric oxide synthesis and lowers resting heart rate.</td>
              </tr>
              <tr>
                <td><strong>smoke</strong></td>
                <td><span className="tag-type">Binary</span></td>
                <td>0: No, 1: Yes</td>
                <td>Accelerates arterial hardening, elevates heart rate, and drastically increases thrombotic risk.</td>
              </tr>
              <tr>
                <td><strong>alco</strong></td>
                <td><span className="tag-type">Binary</span></td>
                <td>0: No, 1: Yes</td>
                <td>Excessive alcohol consumption contributes to cardiomyopathy, arrhythmias, and elevated BP.</td>
              </tr>
              <tr>
                <td><strong>gender</strong></td>
                <td><span className="tag-type">Categorical</span></td>
                <td>1: Female, 2: Male</td>
                <td>Accounts for sex-specific hormonal and physiological cardiovascular patterns.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimers & Ethics */}
      <section className="about-disclaimer-card">
        <div className="disclaimer-header">
          <AlertTriangle size={22} className="amber-icon" />
          <h3>Academic Research &amp; Clinical Ethics Statement</h3>
        </div>
        <p>
          This application is developed strictly for educational research, artificial intelligence
          demonstration, and computer science study. It does not provide medical diagnoses, treatment plans,
          or clinical prescriptions. Predictions generated by machine learning models are statistical
          estimates based on historical dataset distributions and should never supersede the judgment of a
          licensed physician, cardiologist, or qualified healthcare professional.
        </p>
      </section>
    </div>
  );
}
