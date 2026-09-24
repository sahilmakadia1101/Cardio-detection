import { Activity, Heart, Shield, Terminal, Database } from 'lucide-react';

export default function Footer({ onTabChange }) {
  return (
    <footer className="footer-rich">
      <div className="footer-top">
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div className="footer-logo">
              <Activity size={18} />
            </div>
            <div className="footer-title">
              Cardio<span>Detect</span>
            </div>
          </div>
          <p className="footer-desc">
            Early cardiovascular disease risk stratification powered by Machine Learning
            and trained on 70,000 real patient examinations from the Kaggle CVD dataset.
          </p>
          <div className="footer-pills">
            <span className="footer-pill">
              <Terminal size={11} />
              <span>FastAPI Backend</span>
            </span>
            <span className="footer-pill">
              <Database size={11} />
              <span>cardio_model.pkl</span>
            </span>
            <span className="footer-pill">
              <Shield size={11} />
              <span>Scikit-Learn Pipeline</span>
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={() => onTabChange('assessment')}>
                Risk Assessment Check
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onTabChange('dashboard')}>
                Dataset &amp; Properties Dashboard
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onTabChange('about')}>
                About &amp; ML Architecture
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">11 Biometric Properties</h4>
          <ul className="footer-links muted-links">
            <li>Systolic &amp; Diastolic BP (ap_hi / ap_lo)</li>
            <li>Serum Cholesterol &amp; Blood Glucose</li>
            <li>Age, Gender, Height &amp; Body Weight</li>
            <li>Smoking, Alcohol &amp; Physical Activity</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          Designed with <Heart size={13} className="heart-inline" /> for Cardiovascular Health &amp; ML Research ·
          Powered by FastAPI &amp; Scikit-Learn
        </p>
        <p className="footer-sub-copy">
          Educational Demonstration · Not a Medical Diagnostic Device
        </p>
      </div>
    </footer>
  );
}
