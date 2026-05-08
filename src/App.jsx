import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Link as LinkIcon, 
  TrendingUp, 
  Search, 
  Bell, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Crown,
  Gift,
  MousePointerClick,
  Sun,
  Moon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { authService } from './services/api';

const StatCard = ({ label, value, icon: Icon, trend, colorClass }) => (
  <div className="glass-card">
    <div className="stat-header">
      <div className={`stat-icon-bg ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00ea8b', fontSize: '12px', fontWeight: '800' }}>
        <TrendingUp size={12} />
        {trend}
      </div>
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getUser());
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [newPartnerCode, setNewPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      const data = await authService.getUsers();
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      const loggedUser = data.user;
      
      if (!loggedUser.isPartner) {
        setUser(loggedUser);
        setShowPartnerModal(true);
      } else {
        setUser(loggedUser);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPartner = async () => {
    setLoading(true);
    try {
      await authService.updateUser(user.userId, {
        isPartner: true
      });
      
      setUser(authService.getUser());
      setShowPartnerModal(false);
      setIsAuthenticated(true);
      // After accepting, if they don't have a code, we could show the create code modal
      // but the user query says "if it's empty show the button", so we'll just let them see the button.
    } catch (err) {
      setError('Error al activar programa de partners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartnerCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const code = newPartnerCode.trim();
    if (!code) {
      setError('El código no puede estar vacío');
      setLoading(false);
      return;
    }

    try {
      // Check for duplicates case-insensitively
      const users = await authService.getUsers();
      const duplicate = users.find(u => u.partnerCode?.toLowerCase() === code.toLowerCase());
      
      if (duplicate) {
        setError('Este código ya está en uso por otra cuenta');
        setLoading(false);
        return;
      }

      await authService.updateUser(user.userId, {
        partnerCode: code
      });
      
      setUser(authService.getUser());
      setShowCreateCodeModal(false);
      setNewPartnerCode('');
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError('Error al guardar el código de partner');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setAllUsers([]);
  };

  const myReferrals = allUsers.filter(u => u.partnerCode === user?.partnerCode);
  const myProspects = myReferrals.filter(u => u.planName === 'Basic');
  const myClients = myReferrals.filter(u => u.planName === 'Premium' || u.planName === 'All Inclusive');

  const renderUserTable = (users, title) => (
    <div className="p-10 animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>{title}</h2>
        <div className="stats-pill" style={{ background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Total: </span>
          <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{users.length}</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table-container">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Plan Actual</th>
              <th>Fecha Registro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((u) => (
              <tr key={u.userId}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white' }}>
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{u.name}</p>
                  </div>
                </td>
                <td>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{u.email}</p>
                </td>
                <td>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '800', 
                    color: u.planName === 'Basic' ? '#94a3b8' : u.planName === 'Premium' ? '#818cf8' : '#a855f7',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    {u.planName}
                  </span>
                </td>
                <td>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </td>
                <td>
                  <span className={`status-pill ${u.planName !== 'Basic' ? 'status-active' : 'status-pending'}`}>
                    {u.planName !== 'Basic' ? 'Cliente' : 'Prospecto'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                  No se encontraron registros vinculados a tu código de partner.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!isAuthenticated && !showPartnerModal) {
    return (
      <div className="login-container">
        <div className="login-card animate-fade-in">
          <div className="login-header">
            <div className="logo-icon">
              <Crown className="text-white" size={32} />
            </div>
            <h1>Bondoo Partners</h1>
            <p>Inicia sesión para gestionar tus referidos</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Cargando...' : 'Entrar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showPartnerModal) {
    return (
      <div className="modal-overlay">
        <div className="partner-modal animate-scale-in">
          <div className="modal-icon">
            <CheckCircle2 size={48} color="#00ea8b" />
          </div>
          <h2>¡Bienvenido al programa de Partners Bondoo!</h2>
          <p>
            Estamos encantados de tenerte con nosotros. Al unirte, podrás generar ingresos 
            recomendando Bondoo a tus clientes y amigos.
          </p>
          <div className="modal-benefits">
            <div className="benefit-item">
              <TrendingUp size={18} />
              <span>Comisiones por cada suscripción</span>
            </div>
            <div className="benefit-item">
              <Users size={18} />
              <span>Panel de gestión de clientes</span>
            </div>
            <div className="benefit-item">
              <Gift size={18} />
              <span>Bonos y premios semanales</span>
            </div>
          </div>
          <button 
            className="modal-btn" 
            onClick={handleAcceptPartner}
            disabled={loading}
          >
            {loading ? 'Activando...' : 'Comenzar ahora'}
          </button>
        </div>
      </div>
    );
  }

  const mockReferrals = [
    { id: 1, name: 'Juan Pérez', email: 'j.perez@email.com', plan: 'Premium', reward: '$12.00', date: '12 Abr, 2026', status: 'active' },
    { id: 2, name: 'María García', email: 'm.garcia@retail.cl', plan: 'All Inclusive', reward: '$24.00', date: '11 Abr, 2026', status: 'active' },
    { id: 3, name: 'Roberto Muñoz', email: 'roberto.m@gmail.com', plan: 'Basic', reward: '$0.00', date: '10 Abr, 2026', status: 'pending' },
    { id: 4, name: 'Camila Soto', email: 'cami.soto@outlook.com', plan: 'Premium', reward: '$12.00', date: '09 Abr, 2026', status: 'active' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Crown className="text-white" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Bondoo</h1>
            <p style={{ fontSize: '10px', fontWeight: '800', color: '#ff3366', letterSpacing: '2px', textTransform: 'uppercase' }}>Partners</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'prospects' ? 'active' : ''}`} onClick={() => setActiveTab('prospects')}>
            <UserPlus size={20} /> Mis Prospectos
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Mis Clientes
          </button>
          <button className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
            <Wallet size={20} /> Cobros y Saldo
          </button>
          <button className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
            <MousePointerClick size={20} /> Material Gráfico
          </button>
        </nav>

        <div style={{ padding: '24px' }}>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="search-bar">
            <Search size={18} color="var(--text-dim)" />
            <input type="text" placeholder="Buscar prospecto o cliente..." style={{ color: 'var(--text-main)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsLightMode(!isLightMode)}
              style={{
                width: '40px', height: '40px', borderRadius: '12px', 
                background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button style={{ color: 'var(--text-dim)', position: 'relative' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ff3366', borderRadius: '50%', border: '2px solid var(--bg-deep)' }} />
            </button>

            <div style={{ height: '32px', width: '1px', background: 'var(--glass-border)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: 'white' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>{user?.name || 'Usuario'}</p>
                <p style={{ fontSize: '10px', color: '#00ea8b', fontWeight: '800', textTransform: 'uppercase' }}>
                  {user?.partnerCode || 'Partner'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>¡Hola, {user?.name?.split(' ')[0] || 'Partner'}! 👋</h2>
              <p style={{ color: 'var(--text-dim)', fontWeight: '500' }}>Es un gran día para conectar parejas y ganar comisiones.</p>
              {user?.partnerCode ? (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Tu Código:</span>
                  <span style={{ 
                    background: 'rgba(0, 234, 139, 0.1)', 
                    color: '#00ea8b', 
                    padding: '4px 12px', 
                    borderRadius: '8px', 
                    fontWeight: '800',
                    fontSize: '14px',
                    letterSpacing: '1px'
                  }}>
                    {user.partnerCode}
                  </span>
                </div>
              ) : (
                <button 
                  onClick={() => setShowCreateCodeModal(true)}
                  style={{ 
                    marginTop: '16px',
                    padding: '8px 16px',
                    background: 'rgba(255, 51, 102, 0.1)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Crear PartnerCode
                </button>
              )}
            </div>
            <button className="btn-primary" onClick={() => {
              if (user?.partnerCode) {
                navigator.clipboard.writeText(`https://www.bondoo.app/q=${user.partnerCode}`);
                alert('¡Link copiado al portapapeles!');
              } else {
                alert('Primero debes crear tu PartnerCode');
                setShowCreateCodeModal(true);
              }
            }}>
              <LinkIcon size={18} /> Copiar Link de Afiliado
            </button>
          </div>

          {showCreateCodeModal && (
            <div className="modal-overlay">
              <div className="partner-modal animate-scale-in" style={{ maxWidth: '550px' }}>
                <div className="modal-icon">
                  <LinkIcon size={40} color="var(--primary)" />
                </div>
                <h2>Crea tu PartnerCode</h2>
                <p style={{ textAlign: 'left', fontSize: '14px' }}>
                  El <b>PartnerCode</b> es tu identificador único. Permite vincular a las personas que invitas para que sus compras se te atribuyan automáticamente.
                  <br /><br />
                  La primera vez que alguien use tu enlace, tu código se guardará en su dispositivo. Así, aunque realice el pago días después, la venta seguirá siendo tuya.
                </p>
                
                <form onSubmit={handleCreatePartnerCode} style={{ marginTop: '24px' }}>
                  <div className="input-group" style={{ textAlign: 'left' }}>
                    <label>Tu Código Personalizado</label>
                    <input 
                      type="text" 
                      placeholder="EJ: MiNombre2026" 
                      value={newPartnerCode}
                      onChange={(e) => setNewPartnerCode(e.target.value)}
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '14px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '800',
                        textAlign: 'center',
                        letterSpacing: '2px'
                      }}
                    />
                  </div>
                  
                  {newPartnerCode && (
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
                      Tu URL de afiliado será:<br />
                      <span style={{ color: 'var(--primary)', fontWeight: '700' }}>www.bondoo.app/q={newPartnerCode}</span>
                    </p>
                  )}

                  {error && <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button 
                      type="button" 
                      className="modal-btn" 
                      style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-dim)' }}
                      onClick={() => setShowCreateCodeModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="modal-btn" disabled={loading}>
                      {loading ? 'Validando...' : 'Guardar Código'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

              <div className="stats-grid">
                <StatCard label="Tus Ganancias" value={`$${(myClients.length * 12).toFixed(2)}`} icon={Wallet} trend="+12%" colorClass="bg-green" />
                <StatCard label="Clientes Activos" value={myClients.length.toString()} icon={Users} trend="+8%" colorClass="bg-indigo" />
                <StatCard label="Prospectos" value={myProspects.length.toString()} icon={MousePointerClick} trend="+24%" colorClass="bg-pink" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                {/* Table Area */}
                <div>
                  <h3 className="section-title" style={{ color: 'var(--text-main)' }}>
                    <Users color="#ff3366" /> Últimos Clientes
                  </h3>
                  <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table-container">
                      <thead>
                        <tr>
                          <th style={{ color: 'var(--text-dim)' }}>Cliente</th>
                          <th style={{ color: 'var(--text-dim)' }}>Suscripción</th>
                          <th style={{ color: 'var(--text-dim)' }}>Tu Comisión</th>
                          <th style={{ color: 'var(--text-dim)' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myClients.slice(0, 5).map((item) => (
                          <tr key={item.userId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white' }}>{item.name?.charAt(0)}</div>
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{item.name}</p>
                                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.email}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p style={{ fontSize: '13px', fontWeight: '700', color: '#818cf8' }}>{item.planName}</p>
                              <p style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
                            </td>
                            <td>
                              <span style={{ fontSize: '14px', fontWeight: '800', color: '#00ea8b' }}>$12.00</span>
                            </td>
                            <td>
                              <span className="status-pill status-active">Completado</span>
                            </td>
                          </tr>
                        ))}
                        {myClients.length === 0 && (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)' }}>No hay clientes registrados aún.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'prospects' && renderUserTable(myProspects, 'Mis Prospectos')}
          {activeTab === 'users' && renderUserTable(myClients, 'Mis Clientes')}
        </div>
      </main>
      
      <style>{`
        .bg-green { background: rgba(0, 234, 139, 0.1); color: #00ea8b; }
        .bg-indigo { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
        .bg-pink { background: rgba(255, 51, 102, 0.1); color: #ff3366; }
        .bg-purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
        
        @media (max-width: 1024px) {
          .app-container { flex-direction: column; }
          .sidebar { width: 100%; height: auto; position: relative; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          div[style*="gridTemplateColumns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
