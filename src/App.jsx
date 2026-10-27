import { useEffect, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, DollarSign, Languages, ShieldCheck, TrendingUp, Users } from 'lucide-react'
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
  const isLanding = location.pathname === '/'
  const isLogin = location.pathname === '/login'

  const changeLanguage = (language) => {
    setState((prev) => ({ ...prev, language }))
  }

  const resetData = () => {
    if (window.confirm(`Reset all ${t('appName')} demo data in this browser?`)) {
      const next = resetDemoState()
      setState(next)
      navigate('/login')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand-wrap" aria-label={`${t('appName')} home`}>
          <span className="brand-mark" aria-hidden="true">K</span>
          <div>
            <strong>{t('appName')}</strong>
            <small>{t('tagline')}</small>
          </div>
        </Link>

        <nav className="top-nav" aria-label="Main navigation">
          <NavLink to="/" end>{t('navHome')}</NavLink>
          {isLanding && (
            <>
              <a href="#how-it-works">{t('howItWorks', 'How it works')}</a>
              <a href="#tools">{t('productTools', 'Product tools')}</a>
            </>
          )}
          {isWorkerRoute && (
            <>
              <NavLink to="/worker" end>{t('navWorker')}</NavLink>
              <NavLink to="/worker/pay">{t('navPay')}</NavLink>
              <NavLink to="/worker/safety">{t('navSafety')}</NavLink>
              <NavLink to="/worker/skills">{t('navSkills')}</NavLink>
            </>
          )}
          {isAdminRoute && (
            <>
              <NavLink to="/admin" end>{t('navAdmin')}</NavLink>
              <NavLink to="/admin/safety">{t('navSafety')}</NavLink>
              <NavLink to="/admin/workforce">{t('navWorkforce')}</NavLink>
              <NavLink to="/admin/feedback">{t('navFeedback')}</NavLink>
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
          {!isLanding && <button type="button" className="secondary" onClick={resetData} aria-label={t('resetData')}>{t('resetData')}</button>}
          {!isLogin && (
            <Link to="/login" className="topbar-cta">
              {t('demoAccess', 'Demo access')} <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      </header>

      <main className={`page-layout${isLanding ? ' landing-layout' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage state={state} t={t} />} />
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

function LandingPage({ state, t }) {
  const industry = state.industries[state.selectedIndustry || 'construction']
  const worker = industry.workers.find((item) => item.id === state.demoWorkerId) || industry.workers[0]
  const hours = Number(worker.shiftHours || 0)
  const estimatedPay = Math.round(hours * Number(worker.hourlyRate || 0))

  return (
    <div className="landing-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> {t('sdg8Label', 'SDG 8 · Decent Work and Economic Growth')}</p>
          <h1>{t('landingTitle')}</h1>
          <p className="lead">{t('landingSubtitle')}</p>
          <div className="cta-row">
            <Link to="/login" className="primary-btn">{t('exploreKarya', 'Explore Karya')} <ArrowRight size={17} aria-hidden="true" /></Link>
            <a href="#how-it-works" className="secondary-btn">{t('howItWorks', 'How it works')}</a>
          </div>
          <p className="prototype-note"><CheckCircle2 size={15} aria-hidden="true" /> {t('demoOnly')}</p>
        </div>
        <aside className="product-preview" aria-label={t('previewLabel', 'Illustrative worker dashboard preview')}>
          <div className="preview-topline">
            <div className="preview-brand"><span className="preview-mark" aria-hidden="true">K</span><strong>{t('appName')}</strong></div>
            <span className="preview-live"><span aria-hidden="true" /> {t('demoPreview', 'Sample record')}</span>
          </div>
          <div className="preview-greeting">
            <div>
              <small>{t('workerDashboardPreview', 'SHIFT SNAPSHOT')}</small>
              <h2>{worker.name}</h2>
              <p>{worker.role} · {worker.workplace}</p>
            </div>
            <span className="status-pill success">{worker.status}</span>
          </div>
          <div className="preview-metrics">
            <div className="preview-hours">
              <span>{t('hoursWorked')}</span>
              <strong>{hours.toFixed(1)}<small>h</small></strong>
              <div className="hours-track"><span style={{ width: `${Math.min(hours / 10 * 100, 100)}%` }} /></div>
              <small>{t('illustrativeData', 'Hours in this sample record')}</small>
            </div>
            <div className="preview-pay">
              <span><DollarSign size={16} aria-hidden="true" /> {t('estimatedEarnings')}</span>
              <strong>₹{estimatedPay.toLocaleString()}</strong>
              <small>{t('payEstimateNote', 'Hours × recorded hourly rate')}</small>
            </div>
          </div>
          <Link to="/worker/safety" className="preview-report" aria-label={t('recentSafetyReports')}>
            <span className="preview-report-icon"><ShieldCheck size={18} aria-hidden="true" /></span>
            <div><strong>{t('safetyAtAGlance', 'Safety, in view')}</strong><small>{industry.safetyReports.length} {t('demoReports', 'demo reports in this workspace')}</small></div>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <section className="story-section" id="how-it-works">
        <div className="story-heading">
          <p className="eyebrow">{t('aClearerWorkday', 'A clearer workday')}</p>
          <h2>{t('workShouldBeVisible', 'A clearer picture of every workday.')}</h2>
        </div>
        <div className="story-copy">
          <p>{t('workplaceStory', 'Keep the essentials connected: record a shift, understand its estimated pay, and make safety concerns visible to the people responsible for following up.')}</p>
          <ol className="how-steps">
            <li><span>01</span><div><strong>{t('howStepOneTitle', 'Record the shift')}</strong><small>{t('howStepOneCopy', 'Workers can start and end a shift in the demo.')}</small></div></li>
            <li><span>02</span><div><strong>{t('howStepTwoTitle', 'Review hours and pay')}</strong><small>{t('howStepTwoCopy', 'See recorded hours, overtime, and an estimated breakdown.')}</small></div></li>
            <li><span>03</span><div><strong>{t('howStepThreeTitle', 'Raise a safety concern')}</strong><small>{t('howStepThreeCopy', 'Submit a report and follow its status in the employer view.')}</small></div></li>
          </ol>
          <Link to="/login" className="text-link">{t('seeHowItWorks', 'Explore the working demo')} <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="tools-section" id="tools">
        <div className="tools-heading">
          <div>
            <p className="eyebrow">{t('builtForRealWork', 'Built around real work')}</p>
            <h2>{t('smallThingsMatter', 'Useful tools for a fairer workday.')}</h2>
          </div>
          <p>{t('toolsDescription', 'A practical set of tools for the people doing the work and the people responsible for supporting them.')}</p>
        </div>
        <div className="feature-list">
          <InfoCard to="/worker" icon={<Clock3 />} title={t('hoursPayFeature', 'Working-time tracking')} text={t('hoursPayDescription', 'Record shift start and end times, review shift history, and see overtime clearly.')} />
          <InfoCard to="/worker/pay" icon={<DollarSign />} title={t('wageFeature', 'Wage transparency')} text={t('wageDescription', 'Review regular and overtime hours alongside an estimated pay breakdown.')} />
          <InfoCard to="/worker/safety" icon={<ShieldCheck />} title={t('safetyFeature', 'Workplace safety reporting')} text={t('safetyDescription', 'Submit a concern with its location and severity, then track its review status.')} />
          <InfoCard to="/worker" icon={<TrendingUp />} title={t('wellbeingFeature', 'Worker wellbeing')} text={t('wellbeingDescription', 'Surface overtime and fatigue warnings from the sample shift records.')} />
          <InfoCard to="/admin" icon={<BriefcaseBusiness />} title={t('workforceFeature', 'Worker and employer tools')} text={t('workforceDescription', 'Workers see their shift details; employers review workforce records and reports.')} />
        </div>
      </section>

      <section className="closing-panel">
        <div>
          <p className="eyebrow">{t('startWithDemo', 'Start with the demo')}</p>
          <h2>{t('takeLookInside', 'Start with a sample shift.')}</h2>
          <p>{t('prototypeDisclaimer', 'Karya is a browser-based prototype. It uses fictional sample records, and changes remain in this browser; it is not connected to a live workforce system.')}</p>
        </div>
        <Link to="/login" className="primary-btn">{t('exploreKarya', 'Explore Karya')} <ArrowRight size={17} aria-hidden="true" /></Link>
      </section>

      <footer className="site-footer">
        <span>Karya · SDG 8</span>
        <span>{t('tagline')}</span>
        <Link to="/login" className="footer-demo-link">{t('demoAccess', 'Demo access')} <ArrowRight size={14} aria-hidden="true" /></Link>
      </footer>
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

function WorkerSkillsPage({ state, setState, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const [addingSkill, setAddingSkill] = useState(false)
  const [skillName, setSkillName] = useState('')
  const [skillError, setSkillError] = useState('')
  const [success, setSuccess] = useState('')

  const addSkill = (event) => {
    event.preventDefault()
    const name = skillName.trim()
    if (!name) {
      setSkillError(t('skillNameRequired', 'Enter a skill or training name.'))
      return
    }

    const skill = { id: `skill-${Date.now()}`, name, status: 'Pending review', date: new Date().toISOString().slice(0, 10), level: 'To be assessed' }
    setState((previous) => ({
      ...previous,
      industries: {
        ...previous.industries,
        [currentIndustryKey]: {
          ...previous.industries[currentIndustryKey],
          skills: [skill, ...previous.industries[currentIndustryKey].skills],
        },
      },
    }))
    setSkillName('')
    setSkillError('')
    setSuccess(t('skillRequestSuccess', 'Added to your skill passport for review.'))
    setAddingSkill(false)
  }

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
          {!addingSkill ? (
            <button type="button" className="primary" onClick={() => { setAddingSkill(true); setSuccess('') }}>{t('skillAdd')}</button>
          ) : (
            <form className="skill-add-form" onSubmit={addSkill}>
              <label>
                <span>{t('skillName', 'Skill or training name')}</span>
                <input autoFocus value={skillName} onChange={(event) => { setSkillName(event.target.value); setSkillError('') }} aria-describedby={skillError ? 'skill-error' : undefined} />
                {skillError && <small id="skill-error" role="alert">{skillError}</small>}
              </label>
              <div className="button-row">
                <button type="submit" className="primary">{t('submit')}</button>
                <button type="button" className="secondary" onClick={() => { setAddingSkill(false); setSkillError('') }}>{t('cancel', 'Cancel')}</button>
              </div>
            </form>
          )}
          {success && <p className="success-message" role="status">{success}</p>}
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ state, setState, t }) {
  const currentIndustryKey = state.selectedIndustry || 'construction'
  const industryData = state.industries[currentIndustryKey]
  const [reportQuery, setReportQuery] = useState('')
  const [reportStatusFilter, setReportStatusFilter] = useState('All')
  const [dateRange, setDateRange] = useState('7d')

  const workerCount = industryData.workers.length
  const onShiftCount = industryData.workers.filter((worker) => worker.status === 'On shift').length
  const totalHours = industryData.workers.reduce((sum, worker) => sum + (worker.shiftHours || 0), 0)
  const payroll = industryData.workers.reduce((sum, worker) => sum + ((worker.hourlyRate || 0) * (worker.shiftHours || 0)), 0)
  const openReports = industryData.safetyReports.filter((report) => report.status !== 'Resolved').length
  const warningCount = industryData.workers.reduce((sum, worker) => sum + (worker.warningCount || 0), 0)
  const atRiskWorkers = industryData.workers.filter((worker) => (worker.warningCount || 0) > 0 || (worker.overtimeHours || 0) > 0).length
  const recentRangeMs = { '7d': 7 * 24 * 60 * 60 * 1000, '14d': 14 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000 }[dateRange] || 7 * 24 * 60 * 60 * 1000
  const now = new Date()
  const oldestAllowedDate = now.getTime() - recentRangeMs
  const filteredReports = industryData.safetyReports.filter((report) => {
    const matchesQuery = !reportQuery || [report.title, report.category, report.area, report.description].join(' ').toLowerCase().includes(reportQuery.toLowerCase())
    const matchesStatus = reportStatusFilter === 'All' || report.status === reportStatusFilter
    const createdAt = report.createdAt ? new Date(report.createdAt).getTime() : null
    const matchesRange = !createdAt || createdAt >= oldestAllowedDate
    return matchesQuery && matchesStatus && matchesRange
  })

  const urgentReports = filteredReports.filter((report) => report.severity === 'High' || report.status === 'Submitted').slice(0, 3)
  const avgHours = workerCount ? totalHours / workerCount : 0
  const payrollSummary = [
    { label: 'Workers', value: workerCount.toString(), hint: `${onShiftCount} on shift now`, icon: <Users size={18} />, linkTo: '/admin/workforce' },
    { label: 'Labour hours', value: `${totalHours.toFixed(1)}h`, hint: `${avgHours.toFixed(1)}h average`, icon: <Clock3 size={18} />, linkTo: '/admin/workforce' },
    { label: 'Open safety cases', value: openReports.toString(), hint: `${filteredReports.length} in selected window`, icon: <ShieldCheck size={18} />, linkTo: '/admin/safety' },
    { label: 'Estimated payroll', value: `₹${payroll.toFixed(0)}`, hint: `${warningCount} fatigue alerts`, icon: <DollarSign size={18} />, linkTo: '/admin/workforce' },
  ]

  return (
    <div className="page-block dashboard-shell">
      <div className="card dashboard-hero">
        <div className="dashboard-header-copy">
          <p className="eyebrow">{t('adminDashboard', 'Employer dashboard')}</p>
          <h2>{t('workforceOverview', 'Executive overview')}</h2>
          <p className="dashboard-subtitle">Monitor labour coverage, act on safety follow-ups, and keep the workforce running within safe operating limits.</p>
        </div>

        <div className="dashboard-toolbar">
          <label className="field-inline" htmlFor="industry-selector">
            <span>{t('industryLabel')}</span>
            <select id="industry-selector" value={state.selectedIndustry} onChange={(event) => setState((prev) => ({ ...prev, selectedIndustry: event.target.value }))} aria-label={t('industryLabel')}>
              <option value="construction">{t('construction')}</option>
              <option value="college">{t('college')}</option>
            </select>
          </label>

          <div className="range-toggle" aria-label="Date range filter">
            {['7d', '14d', '30d'].map((value) => (
              <button
                key={value}
                type="button"
                className={dateRange === value ? 'range-button active' : 'range-button'}
                onClick={() => setDateRange(value)}
              >
                {value === '7d' ? '7 days' : value === '14d' ? '14 days' : '30 days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="kpi-grid">
        {payrollSummary.map((metric) => (
          <MetricTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            icon={metric.icon}
            linkTo={metric.linkTo}
          />
        ))}
      </section>

      <section className="content-grid dashboard-grid">
        <div className="panel card dashboard-panel">
          <div className="panel-header row-between">
            <div>
              <p className="panel-kicker">Priority follow-up</p>
              <h3>Safety cases</h3>
            </div>
            <Link to="/admin/safety" className="text-link">View all</Link>
          </div>

          <div className="filter-row dashboard-filters">
            <input
              value={reportQuery}
              onChange={(event) => setReportQuery(event.target.value)}
              placeholder="Search reports, area, or category"
              aria-label="Search safety reports"
            />
            <select value={reportStatusFilter} onChange={(event) => setReportStatusFilter(event.target.value)} aria-label="Filter safety reports by status">
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under review">Under review</option>
              <option value="Action in progress">Action in progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="stacked-list dashboard-list">
            {urgentReports.length > 0 ? urgentReports.map((report) => (
              <Link to="/admin/safety" key={report.id} className="list-item dashboard-list-item">
                <div className="list-copy">
                  <strong>{report.title}</strong>
                  <small>{report.area} • {report.status} • {report.severity}</small>
                </div>
                <span className={`status-badge ${report.status === 'Resolved' ? 'success' : report.severity === 'High' ? 'alert' : 'neutral'}`}>{report.severity}</span>
              </Link>
            )) : (
              <div className="empty-state compact-empty">
                <strong>No safety issues in this date window.</strong>
                <p>Everything is currently clear for the selected range.</p>
              </div>
            )}
          </div>
        </div>

        <div className="panel card dashboard-panel">
          <div className="panel-header row-between">
            <div>
              <p className="panel-kicker">Workforce signal</p>
              <h3>Operational notes</h3>
            </div>
            <Link to="/admin/workforce" className="text-link">View team</Link>
          </div>

          <div className="insight-list">
            <div className="insight-item">
              <span className="insight-label">At-risk workers</span>
              <strong>{atRiskWorkers}</strong>
              <small>Alerting on overtime or fatigue warnings.</small>
            </div>
            <div className="insight-item">
              <span className="insight-label">Shift pressure</span>
              <strong>{warningCount}</strong>
              <small>Recorded warning patterns across this team.</small>
            </div>
            <div className="insight-item">
              <span className="insight-label">Response load</span>
              <strong>{Math.max(openReports - 1, 0)}</strong>
              <small>Reports still requiring action from supervisors.</small>
            </div>
          </div>

          <div className="stacked-list compact-list">
            {industryData.activity.map((item) => (
              <div className="list-item notice-item" key={item.id}>
                <div className="list-copy">
                  <strong>{item.text}</strong>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel card dashboard-panel wide-panel">
        <div className="panel-header row-between">
          <div>
            <p className="panel-kicker">Operational summary</p>
            <h3>Actions with context</h3>
          </div>
          <div className="action-cluster">
            <Link to="/admin/safety" className="primary-btn small-btn">Review safety queue</Link>
            <Link to="/admin/workforce" className="secondary-btn small-btn">Open workforce view</Link>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-block">
            <span className="summary-label">Open safety review</span>
            <strong>{openReports}</strong>
            <p>Reports still pending attention from the operations team.</p>
          </div>
          <div className="summary-block">
            <span className="summary-label">Coverage level</span>
            <strong>{Math.round((onShiftCount / workerCount) * 100)}%</strong>
            <p>{onShiftCount} workers are currently on shift across {workerCount} active roles.</p>
          </div>
          <div className="summary-block">
            <span className="summary-label">Average weekly hours</span>
            <strong>{avgHours.toFixed(1)}h</strong>
            <p>Used to spot repeated overtime concentration without overreacting to a single shift.</p>
          </div>
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

function MetricTile({ value, label, hint, icon, linkTo }) {
  const content = (
    <>
      <div className="metric-icon">{icon}</div>
      <div className="metric-copy">
        <small>{label}</small>
        <strong>{value}</strong>
        {hint && <span>{hint}</span>}
      </div>
    </>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="metric-tile card dashboard-kpi" aria-label={`${label}: ${value}`}>
        {content}
      </Link>
    )
  }

  return (
    <div className="metric-tile card dashboard-kpi">
      {content}
    </div>
  )
}

function InfoCard({ icon, title, text, to }) {
  return (
    <Link to={to} className="info-card card">
      <div className="metric-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <ArrowRight className="info-card-arrow" size={16} aria-hidden="true" />
    </Link>
  )
}

export default App
