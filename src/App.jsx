import React, { useState, useEffect } from 'react';
import { getActivePorts, killProcess } from './utils/system';

function App() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState(new Date().toLocaleTimeString());

  const refreshPorts = async () => {
    setLoading(true);
    const data = await getActivePorts();
    setPorts(data);
    setLastScan(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    refreshPorts();
    const interval = setInterval(refreshPorts, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleKill = async (pid) => {
    if (confirm(`INITIATE TERMINATION SEQUENCE FOR PID ${pid}?`)) {
      const success = await killProcess(pid);
      if (success) {
        refreshPorts();
      } else {
        alert('TERMINATION FAILED: INSUFFICIENT PERMISSIONS OR TARGET PROTECTED.');
      }
    }
  };

  return (
    <div className="combat-deck">
      <header>
        <div className="title-glow">PORTGUARD // COMBAT_DECK_V1.0</div>
      </header>

      <div className="dashboard-grid">
        {/* Main Monitoring Panel */}
        <section className="panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="panel-title">CONNECTIONS</span>
              <span className="count-badge">{ports.length}</span>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span className="scan-timestamp">SYNC: {lastScan}</span>
              <button className="btn-action refresh" onClick={refreshPorts}>
                {loading ? '...' : 'REFRESH'}
              </button>
            </div>
          </div>

          <div className="table-header">
            <span>PORT</span>
            <span>PROCESS</span>
            <span>PID</span>
            <span>ACTION</span>
          </div>

          <div className="port-list">
            {ports.length === 0 ? (
              <div className="empty-state">NO ACTIVE PORTS</div>
            ) : (
              ports.map((p, idx) => (
                <div key={idx} className="port-row">
                  <span className="port-val">{p.port}</span>
                  <span className="proc-name">{p.protocol}</span>
                  <span className="pid-val">{p.pid}</span>
                  <button className="btn-kill" onClick={() => handleKill(p.pid)}>TERMINATE</button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* System Info Sidebar */}
        <aside className="panel sidebar">
          <div className="panel-header">PROFILES</div>
          <div className="sidebar-content">
            <div className="intro-card">
              <h3>PortGuard Pro</h3>
              <p>Professional system port monitoring and process management tool. Designed to resolve port conflicts in development environments with one-click termination of zombie processes.</p>
            </div>

            <div className="stats-list">
              <div className="stat-item">
                <span>STATUS</span>
                <span className="val-active">SECURE</span>
              </div>
              <div className="stat-item">
                <span>ENCRYPTION</span>
                <span>SHA-256</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-nav {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 12px;
          text-align: left;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: 0.3s;
        }
        .btn-nav:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .btn-nav.active {
          background: var(--bg-card);
          color: var(--accent-blue);
          border-left: 3px solid var(--accent-blue);
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default App;
