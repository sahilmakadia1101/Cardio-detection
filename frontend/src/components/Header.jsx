import { useState, useEffect } from 'react';
import { Activity, Database, Info, Stethoscope, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function Header({ activeTab, onTabChange }) {
  const [backendStatus, setBackendStatus] = useState({
    checking: true,
    connected: false,
    latency: null,
    modelLoaded: false,
  });

  async function verifyConnection() {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const health = await checkBackendHealth();
    setBackendStatus({
      checking: false,
      connected: health.connected,
      latency: health.latency,
      modelLoaded: health.modelLoaded,
    });
  }

  useEffect(() => {
    verifyConnection();
    const interval = setInterval(verifyConnection, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-brand-btn"
          onClick={() => onTabChange('assessment')}
          title="Return to Assessment"
        >
          <div className="header-logo">
            <Activity className="header-icon pulse-heart" size={20} />
          </div>
          <div className="header-title">
            Cardio<span>Detect</span>
          </div>
        </button>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'assessment' ? 'active' : ''}`}
          onClick={() => onTabChange('assessment')}
          id="nav-tab-assessment"
        >
          <Stethoscope size={16} />
          <span>Risk Assessment</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          id="nav-tab-dashboard"
        >
          <Database size={16} />
          <span>Dataset & Properties</span>
          <span className="nav-tag">11 Features</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => onTabChange('about')}
          id="nav-tab-about"
        >
          <Info size={16} />
          <span>About & ML Model</span>
        </button>
      </nav>

      <div className="header-right">
        <div
          className={`backend-pill ${backendStatus.connected ? 'online' : 'offline'}`}
          title={
            backendStatus.connected
              ? `FastAPI Backend Connected (${backendStatus.latency}ms) - cardio_model.pkl Loaded`
              : 'FastAPI Backend not detected on :8000. Running in local ML model pipeline mode.'
          }
        >
          {backendStatus.checking ? (
            <RefreshCw size={12} className="spin-icon" />
          ) : backendStatus.connected ? (
            <CheckCircle2 size={13} className="pill-dot green" />
          ) : (
            <AlertTriangle size={13} className="pill-dot amber" />
          )}

          <span className="pill-text">
            {backendStatus.checking
              ? 'Checking API...'
              : backendStatus.connected
              ? `FastAPI: Connected (${backendStatus.latency}ms)`
              : 'Local Model Mode'}
          </span>

          <button
            className="pill-refresh"
            onClick={verifyConnection}
            title="Check backend connection"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>
    </header>
  );
}
