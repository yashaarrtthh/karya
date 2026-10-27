import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, BriefcaseBusiness, Building2, ClipboardList, Clock3, DollarSign, Factory, Languages, LogOut, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { readDemoState, resetDemoState, writeDemoState } from './services/storage'
import { calculateOvertimeHours, calculatePayBreakdown, calculateShiftDuration, detectFatigueWarnings, validateSafetyReport } from './services/calculations'
import { getText } from './i18n/translations'
import './styles/app.css'

function App() {
  const [state, setState] = useState(() => readDemoState())
  const [selectedRole, setSelectedRole] = useState('worker')

  useEffect(() => {
    writeDemoState(state)
  }, [state])

  const currentLanguage = state.language || 'en'
  const t = (key, fallback = '') => getText(currentLanguage, key, fallback)

  return (
    <BrowserRouter>
      <Layout state={state} setState={setState} _selectedRole={selectedRole} setSelectedRole={setSelectedRole} t={t} />
    </BrowserRouter>
  )
}

function Layout({ state, setState, _selectedRole, setSelectedRole, t }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isWorkerRoute = location.pathname.startsWith('/worker')
  const isAdminRoute = location.pathname.startsWith('/admin')
  const showNav = !['/login', '/'].includes(location.pathname)

  const changeLanguage = (language) => {
    setState((prev) => ({ ...prev, language }))
  }

  const resetData = () => {
    const next = resetDemoState()
    setState(next)
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">F</div>
          <div>
            <strong>{t('appName')}</strong>
            <small>{t('tagline')}</small>
          </div>
        </div>

        <nav className="top-nav" aria-label="Main navigation">
          <Link to="/">{t('navHome')}</Link>
          {isWorkerRoute && (
            <>
              <Link to="/worker">{t('navWorker')}</Link>
              <Link to="/worker/pay">{t('navPay')}</Link>
              <Link to="/worker/safety">{t('navSafety')}</Link>
              <Link to="/worker/skills">{t('navSkills')}</Link>
            </>
          )}
          {isAdminRoute && (
            <>
              <Link to="/admin">{t('navAdmin')}</Link>
              <Link to="/admin/safety">{t('navSafety')}</Link>
              <Link to="/admin/workforce">{t('navWorkforce')}</Link>
              <Link to="/admin/feedback">{t('navFeedback')}</Link>
            </>
          )}
        </nav>

        <div className="top-actions">
          <label className="language-select" htmlFor="language-switcher">
            <Languages size={16} />
            <select id="language-switcher" value={state.language} onChange={(e) => changeLanguage(e.target.value)} aria-label={t('selectLanguage')}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </label>
          <button type="button" className="secondary" onClick={resetData}>{t('resetData')}</button>
          <button type="button" className="ghost" onClick={() => navigate('/login')}>
            <LogOut size={14} />
            {t('loginTitle')}
          </button>
        </div>
      </header>

      <main className={showNav ? 'page-layout' : 'page-layout full-width'}>
        <Routes>
          <Route path="/" element={<LandingPage t={t} />} />
          <Route path="/login" element={<LoginPage state={state} setState={setState} setSelectedRole={setSelectedRole} t={t} />} />
          <Route path="/worker" element={<WorkerDashboard state={state} setState={setState} t={t} />} />
          <Route path="/worker/pay" element={<WorkerPayPage state={state} setState={setState} t={t} />} />
          <Route path="/worker/safety" element={<WorkerSafetyPage state={state} setState={setState} t={t} />} />
          <Route path="/worker/skills" element={<WorkerSkillsPage state={state} setState={setState} t={t} />} />
          <Route path="/admin" element={<AdminDashboard state={state} setState={setState} t={t} />} />
          <Route path="/admin/safety" element={<AdminSafetyPage state={state} setState={setState} t={t} />} />
          <Route path="/admin/workforce" element={<AdminWorkforcePage state={state} setState={setState} t={t} />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage state={state} setState={setState} t={t} />} />
          <Route path="*" element={<NotFoundPage t={t} />} />
        </Routes>
      </main>
    </div>
  )
}

function LandingPage({ t }) {
  return (
    <div className="landing-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">SDG 8 • {t('appName')}</p>
          <h1>{t('landingTitle')}</h1>
          <p className="lead">{t('landingSubtitle')}</p>
          <div className="cta-row">
            <Link to="/login" className="primary-btn">{t('loginTitle')}</Link>
            <Link to="/worker" className="secondary-btn">{t('workerRole')}</Link>
          </div>
        </div>
        <div className="stats-grid">
          <StatCard label={t('hoursWorked')} value="54.5h" icon={<Clock3 />} tone="blue" />
          <StatCard label={t('estimatedEarnings')} value="₹8,220" icon={<DollarSign />} tone="green" />
          <StatCard label={t('overtimeHours')} value="5.2h" icon={<TrendingUp />} tone="amber" />
          <StatCard label={t('fatigueWarnings')} value="2 alerts" icon={<AlertTriangle />} tone="rose" />
        </div>
      </section>

      <section className="info-grid">
        <InfoCard icon={<Factory />} title="Construction" text="Track site hours, overtime exposure, and visible safety updates on active projects." />
        <InfoCard icon={<Building2 />} title="College facilities" text="Manage maintenance workloads, facility safety checks, and shift coverage for campus operations." />
        <InfoCard icon={<ShieldCheck />} title="Safety-first" text="Raise reports with severity, location, and status tracking so concerns are actioned quickly." />
      </section>
    </div>
  )
}

function LoginPage({ state, setState, setSelectedRole, t }) {
  const navigate = useNavigate()
  const selectedIndustry = state.selectedIndustry || 'construction'

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    const nextDefaultWorker = role === 'admin' ? 'worker-zoe' : 'worker-aisha'
    setState((prev) => ({ ...prev, demoWorkerId: nextDefaultWorker, selectedIndustry }))
    navigate(role === 'admin' ? '/admin' : '/worker')
  }

  return (
    <div className="login-panel">
      <div className="card auth-card">
        <p className="eyebrow">{t('loginDemo')}</p>
        <h2>{t('loginTitle')}</h2>
        <p className="muted">{t('loginSubtitle')}</p>
        <div className="role-grid">
          <button className="role-card" type="button" onClick={() => handleRoleSelect('worker')}>
            <Users size={24} />
            <strong>{t('workerRole')}</strong>
            <span>{t('workerLoginHint')}</span>
          </button>
          <button className="role-card" type="button" onClick={() => handleRoleSelect('admin')}>
            <BriefcaseBusiness size={24} />
            <strong>{t('adminRole')}</strong>
            <span>{t('adminLoginHint')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkerDashboard({ state, setState, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const selectedWorker = industryData.workers.find((worker) => worker.id === state.demoWorkerId) || industryData.workers[0]
  const activeShifts = industryData.shifts.filter((shift) => shift.workerId === selectedWorker.id)
  const warnings = detectFatigueWarnings({ shifts: industryData.shifts, settings: state.settings, workerId: selectedWorker.id, workers: industryData.workers })

  const totalHours = activeShifts.reduce((sum, shift) => sum + Number(shift.duration || 0), 0)
  const pay = calculatePayBreakdown({ regularHours: totalHours, hourlyRate: selectedWorker.hourlyRate, overtimeHours: selectedWorker.overtimeHours || 0, overtimeMultiplier: state.settings.overtimeMultiplier })

  const startShift = () => {
    const now = new Date().toISOString()
    const duplicate = industryData.shifts.some((shift) => shift.workerId === selectedWorker.id && shift.status === 'Open')
    if (duplicate) {
      alert('A shift is already running for this worker. End it before starting another one.')
      return
    }

    const nextShift = { id: `shift-${Date.now()}`, workerId: selectedWorker.id, start: now, end: null, duration: 0, overtime: 0, status: 'Open' }
    const updated = { ...state }
    updated.industries[currentIndustryKey].shifts = [nextShift, ...industryData.shifts]
    setState(updated)
  }

  const endShift = () => {
    const openShift = industryData.shifts.find((shift) => shift.workerId === selectedWorker.id && shift.status === 'Open')
    if (!openShift) {
      alert('No active shift is available to end.')
      return
    }
    const end = new Date().toISOString()
    const duration = calculateShiftDuration(openShift.start, end)
    const overtime = calculateOvertimeHours(duration, state.settings.overtimeThreshold)
    const updated = { ...state }
    updated.industries[currentIndustryKey].shifts = updated.industries[currentIndustryKey].shifts.map((shift) => shift.id === openShift.id ? { ...shift, end, duration, overtime, status: 'Completed' } : shift)
    setState(updated)
  }

  return (
    <div className="page-block">
      <section className="card hero-card">
        <div>
          <p className="eyebrow">{selectedWorker.name}</p>
          <h2>{selectedWorker.workplace}</h2>
          <p className="muted">{selectedWorker.role} • {selectedWorker.industry}</p>
        </div>
        <div className="status-pill">{selectedWorker.status}</div>
      </section>

      <section className="metrics-grid">
        <MetricTile label={t('currentShiftStatus')} value={selectedWorker.status} icon={<Clock3 size={18} />} />
        <MetricTile label={t('hoursWorked')} value={`${totalHours.toFixed(1)}h`} icon={<Clock3 size={18} />} />
        <MetricTile label={t('estimatedEarnings')} value={`₹${pay.total}`} icon={<DollarSign size={18} />} />
        <MetricTile label={t('overtimeHours')} value={`${selectedWorker.overtimeHours || 0}h`} icon={<TrendingUp size={18} />} />
      </section>

      <section className="content-grid">
        <div className="panel">
          <h3>{t('shiftHistory')}</h3>
          <div className="stacked-list">
            {activeShifts.slice(0, 4).map((shift) => (
              <div className="list-item" key={shift.id}>
                <div>
                  <strong>{shift.status === 'Open' ? 'Open shift' : 'Completed'}</strong>
                  <small>{shift.start ? new Date(shift.start).toLocaleString() : 'Unknown start'} → {shift.end ? new Date(shift.end).toLocaleString() : 'In progress'}</small>
                </div>
                <span>{Number(shift.duration || 0).toFixed(1)}h</span>
              </div>
            ))}
          </div>
          <div className="button-row">
            <button type="button" className="primary" onClick={startShift}>{t('startShift')}</button>
            <button type="button" className="secondary" onClick={endShift}>{t('endShift')}</button>
          </div>
        </div>

        <div className="panel">
          <h3>{t('notices')}</h3>
          <div className="stacked-list">
            {industryData.notices.map((notice) => (
              <div className="notice-item" key={notice.id}>
                <strong>{notice.title}</strong>
                <p>{notice.text}</p>
                <span>{notice.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <h3>{t('recentSafetyReports')}</h3>
          <div className="stacked-list">
            {industryData.safetyReports.slice(0, 3).map((report) => (
              <div className="list-item" key={report.id}>
                <div>
                  <strong>{report.title}</strong>
                  <small>{report.severity} • {report.status}</small>
                </div>
                <span>{report.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>{t('fatigueWarnings')}</h3>
          <div className="stacked-list">
            {warnings.length > 0 ? warnings.map((warning, index) => (
              <div className="warning-item" key={`${warning.type}-${index}`}>
                <strong>{warning.type}</strong>
                <p>{warning.reason}</p>
                <small>{JSON.stringify(warning.values)}</small>
              </div>
            )) : <p className="muted">{t('noData')}</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

function WorkerPayPage({ state, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const worker = industryData.workers.find((item) => item.id === state.demoWorkerId) || industryData.workers[0]
  const regularHours = Number((worker.shiftHours || 0).toFixed(2))
  const overtimeHours = Number((worker.overtimeHours || 0).toFixed(2))
  const breakdown = calculatePayBreakdown({ regularHours, hourlyRate: worker.hourlyRate || 0, overtimeHours, overtimeMultiplier: state.settings.overtimeMultiplier, additionalEarnings: 80, deductions: 20 })

  return (
    <div className="page-block">
      <section className="card panel-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">{worker.name}</p>
            <h2>{t('payBreakdown')}</h2>
          </div>
          <span className="status-pill success">{t('totalEstimatedPay')}: ₹{breakdown.total}</span>
        </div>
        <div className="pay-grid">
          <div className="pay-row"><span>{t('regularHours')}</span><strong>{regularHours}h</strong></div>
          <div className="pay-row"><span>{t('regularRate')}</span><strong>₹{worker.hourlyRate}/h</strong></div>
          <div className="pay-row"><span>{t('overtimeHours')}</span><strong>{overtimeHours}h</strong></div>
          <div className="pay-row"><span>{t('overtimeMultiplier')}</span><strong>{state.settings.overtimeMultiplier}x</strong></div>
          <div className="pay-row"><span>Estimated regular earnings</span><strong>₹{breakdown.regularEarnings}</strong></div>
          <div className="pay-row"><span>Estimated overtime earnings</span><strong>₹{breakdown.overtimeEarnings}</strong></div>
          <div className="pay-row"><span>Additional earnings</span><strong>₹{breakdown.additionalEarnings}</strong></div>
          <div className="pay-row"><span>Deductions</span><strong>₹{breakdown.deductions}</strong></div>
          <div className="pay-row total"><span>{t('totalEstimatedPay')}</span><strong>₹{breakdown.total}</strong></div>
        </div>
      </section>
    </div>
  )
}

function WorkerSafetyPage({ state, setState, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const [form, setForm] = useState({ title: '', category: 'Equipment', severity: 'Medium', description: '', area: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  const submitReport = (event) => {
    event.preventDefault()
    const validationErrors = validateSafetyReport(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const report = {
      id: `report-${Date.now()}`,
      workerId: state.demoWorkerId,
      title: form.title.trim(),
      category: form.category,
      severity: form.severity,
      area: form.area.trim(),
      description: form.description.trim(),
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updates: [],
    }

    const next = { ...state }
    next.industries[currentIndustryKey].safetyReports = [report, ...industryData.safetyReports]
    setState(next)
    setSuccess('Report submitted successfully. It is now visible to the admin workflow.')
    setForm({ title: '', category: 'Equipment', severity: 'Medium', description: '', area: '' })
  }

  return (
    <div className="page-block">
      <div className="content-grid">
        <form className="card form-card" onSubmit={submitReport}>
          <h3>{t('reportSafety')}</h3>
          <div className="field-grid">
            <label>
              <span>{t('title')}</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <small>{errors.title}</small>}
            </label>
            <label>
              <span>{t('category')}</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Equipment">Equipment</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Workload">Workload</option>
              </select>
            </label>
            <label>
              <span>{t('severity')}</span>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label>
              <span>{t('area')}</span>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              {errors.area && <small>{errors.area}</small>}
            </label>
          </div>
          <label>
            <span>{t('description')}</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} />
            {errors.description && <small>{errors.description}</small>}
          </label>
          <button type="submit" className="primary">{t('submit')}</button>
          {success && <p className="success-message">{success}</p>}
        </form>

        <div className="card panel">
          <h3>{t('safetyList')}</h3>
          <div className="stacked-list">
            {industryData.safetyReports.map((report) => (
              <div className="list-item" key={report.id}>
                <div>
                  <strong>{report.title}</strong>
                  <small>{report.status} • {report.severity}</small>
                </div>
                <span>{report.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkerSkillsPage({ state, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]

  return (
    <div className="page-block">
      <div className="content-grid">
        <div className="card panel">
          <h3>{t('skillPassport')}</h3>
          <div className="stacked-list">
            {industryData.skills.map((skill) => (
              <div className="list-item" key={skill.id}>
                <div>
                  <strong>{skill.name}</strong>
                  <small>{skill.status} • {skill.date}</small>
                </div>
                <span>{skill.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel">
          <h3>{t('skillAdd')}</h3>
          <div className="stacked-list">
            {industryData.training.map((item) => (
              <div className="list-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.status}</small>
                </div>
                <span>{item.date}</span>
              </div>
            ))}
          </div>
          <button type="button" className="primary">{t('skillAdd')}</button>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ state, setState, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const workerCount = industryData.workers.length
  const onShiftCount = industryData.workers.filter((worker) => worker.status === 'On shift').length
  const totalHours = industryData.workers.reduce((sum, worker) => sum + (worker.shiftHours || 0), 0)
  const payroll = industryData.workers.reduce((sum, worker) => sum + ((worker.hourlyRate || 0) * (worker.shiftHours || 0)), 0)
  const openReports = industryData.safetyReports.filter((report) => report.status !== 'Resolved').length
  const warningCount = industryData.workers.reduce((sum, worker) => sum + (worker.warningCount || 0), 0)

  return (
    <div className="page-block">
      <div className="card hero-card admin-header">
        <div>
          <p className="eyebrow">{t('adminDashboard')}</p>
          <h2>{t('workforceOverview')}</h2>
        </div>
        <label className="industry-select" htmlFor="industry-selector">
          <span>{t('industryLabel')}</span>
          <select id="industry-selector" value={state.selectedIndustry} onChange={(event) => setState((prev) => ({ ...prev, selectedIndustry: event.target.value }))} aria-label={t('industryLabel')}>
            <option value="construction">{t('construction')}</option>
            <option value="college">{t('college')}</option>
          </select>
        </label>
      </div>

      <section className="metrics-grid">
        <MetricTile label={t('workerSummary')} value={workerCount.toString()} icon={<Users size={18} />} />
        <MetricTile label="Currently on shift" value={onShiftCount.toString()} icon={<Clock3 size={18} />} />
        <MetricTile label={t('workingHours')} value={`${totalHours.toFixed(1)}h`} icon={<ClipboardList size={18} />} />
        <MetricTile label={t('payroll')} value={`₹${payroll.toFixed(0)}`} icon={<DollarSign size={18} />} />
      </section>

      <section className="content-grid">
        <div className="panel card">
          <h3>{t('openReports')}</h3>
          <div className="stacked-list">
            {industryData.safetyReports.slice(0, 3).map((report) => (
              <div className="list-item" key={report.id}>
                <div>
                  <strong>{report.title}</strong>
                  <small>{report.status} • {report.severity}</small>
                </div>
                <span>{report.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel card">
          <h3>{t('fatigueAlerts')}</h3>
          <div className="stacked-list">
            <div className="list-item"><div><strong>Overtime concentration</strong><small>{warningCount} warning records</small></div><span>{warningCount}</span></div>
            <div className="list-item"><div><strong>Open safety issues</strong><small>{openReports} active</small></div><span>{openReports}</span></div>
          </div>
        </div>
      </section>

      <section className="panel card">
        <h3>{t('operationActivity')}</h3>
        <div className="stacked-list">
          {industryData.activity.map((item) => (
            <div className="list-item" key={item.id}>
              <div><strong>{item.text}</strong></div>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AdminSafetyPage({ state, setState, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const [statusFilter, setStatusFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')

  const filteredReports = industryData.safetyReports.filter((report) => {
    const statusMatch = statusFilter === 'All' || report.status === statusFilter
    const severityMatch = severityFilter === 'All' || report.severity === severityFilter
    return statusMatch && severityMatch
  })

  const updateStatus = (reportId, status) => {
    const next = { ...state }
    next.industries[currentIndustryKey].safetyReports = next.industries[currentIndustryKey].safetyReports.map((report) =>
      report.id === reportId ? { ...report, status, updates: [...report.updates, { at: new Date().toISOString(), note: `Status moved to ${status} by demo admin.` }] } : report,
    )
    setState(next)
  }

  return (
    <div className="page-block">
      <div className="card panel-block">
        <div className="section-head">
          <h2>{t('safetyManagement')}</h2>
          <div className="filter-row">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under review">Under review</option>
              <option value="Action in progress">Action in progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="All">All severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="stacked-list">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div>
                  <strong>{report.title}</strong>
                  <small>{report.area} • {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Date unavailable'}</small>
                </div>
                <span className="status-pill">{report.status}</span>
              </div>
              <p>{report.description}</p>
              <div className="button-row compact">
                <button type="button" onClick={() => updateStatus(report.id, 'Under review')}>Under review</button>
                <button type="button" onClick={() => updateStatus(report.id, 'Action in progress')}>Action in progress</button>
                <button type="button" onClick={() => updateStatus(report.id, 'Resolved')}>Resolved</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminWorkforcePage({ state, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredWorkers = industryData.workers.filter((worker) => {
    const matchesQuery = worker.name.toLowerCase().includes(query.toLowerCase()) || worker.role.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'All' || worker.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="page-block">
      <div className="card panel-block">
        <h2>{t('workforceTable')}</h2>
        <div className="filter-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchWorkers')} aria-label={t('searchWorkers')} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            <option value="On shift">On shift</option>
            <option value="Off shift">Off shift</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('id')}</th>
                <th>{t('name')}</th>
                <th>{t('role')}</th>
                <th>{t('industryLabel')}</th>
                <th>{t('status')}</th>
                <th>{t('hoursWorked')}</th>
                <th>{t('overtimeHours')}</th>
                <th>{t('fatigueWarnings')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.id}</td>
                  <td>{worker.name}</td>
                  <td>{worker.role}</td>
                  <td>{worker.industry}</td>
                  <td>{worker.status}</td>
                  <td>{worker.shiftHours}h</td>
                  <td>{worker.overtimeHours}h</td>
                  <td>{worker.warningCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWorkers.length === 0 && <p className="empty-state">{t('noData')}</p>}
        </div>
      </div>
    </div>
  )
}

function AdminFeedbackPage({ state, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]

  return (
    <div className="page-block">
      <div className="card panel-block">
        <h2>{t('anonymousFeedback')}</h2>
        <div className="feedback-grid">
          {industryData.feedback.map((item) => (
            <article className="feedback-card" key={item.id}>
              <div className="feedback-top">
                <span>{item.category}</span>
                <strong>{item.rating}/5</strong>
              </div>
              <p>{item.text}</p>
              <small>{item.area || 'General'} • {new Date(item.createdAt).toLocaleDateString()}</small>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function NotFoundPage({ t }) {
  return (
    <div className="page-block centered-block">
      <div className="card empty-state-card">
        <h2>{t('notFound')}</h2>
        <p>{t('goHome')}</p>
        <Link to="/" className="primary-btn">{t('navHome')}</Link>
      </div>
    </div>
  )
}

function MetricTile({ value, label, icon }) {
  return (
    <div className="metric-tile card">
      <div className="metric-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="info-card card">
      <div className="metric-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default App
