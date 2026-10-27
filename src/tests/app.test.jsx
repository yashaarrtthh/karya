import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach } from 'vitest'
import App from '../App'
import { calculateShiftDuration, calculateOvertimeHours, calculatePayBreakdown, detectFatigueWarnings, createSafetyReport, updateSafetyReportStatus, createFeedbackEntry } from '../services/calculations'
import { createSeedState } from '../data/demoData'
import { readDemoState, resetDemoState, writeDemoState } from '../services/storage'

describe('FairShift calculations', () => {
  it('calculates shift duration', () => {
    expect(calculateShiftDuration('2026-10-24T07:00:00.000Z', '2026-10-24T14:30:00.000Z')).toBe(7.5)
  })

  it('prevents invalid shift transitions', () => {
    expect(calculateShiftDuration('2026-10-24T14:00:00.000Z', '2026-10-24T13:00:00.000Z')).toBe(0)
  })

  it('calculates overtime', () => {
    expect(calculateOvertimeHours(9.5, 8)).toBe(1.5)
  })

  it('builds salary breakdown', () => {
    expect(calculatePayBreakdown({ regularHours: 40, hourlyRate: 18, overtimeHours: 3, overtimeMultiplier: 1.5 })).toMatchObject({ regularEarnings: 720, overtimeEarnings: 81, total: 801 })
  })

  it('validates safety report inputs', () => {
    const errors = createSafetyReport({ title: 'Bad', category: 'Equipment', severity: 'High', description: 'Short', area: 'A' })
    expect(errors.ok).toBe(false)
    expect(errors.errors.title).toBeTruthy()
  })

  it('creates a safety report', () => {
    const result = createSafetyReport({ title: 'Loose rail', category: 'Equipment', severity: 'High', description: 'The handrail near the workshop is loose and needs urgent inspection.', area: 'Workshop B' })
    expect(result.ok).toBe(true)
    expect(result.report.status).toBe('Submitted')
  })

  it('updates report status', () => {
    const reports = [{ id: 'r1', status: 'Submitted', updates: [] }]
    const updated = updateSafetyReportStatus(reports, 'r1', 'Resolved')
    expect(updated[0].status).toBe('Resolved')
  })

  it('detects fatigue warnings', () => {
    const warnings = detectFatigueWarnings({
      shifts: [
        { workerId: 'w1', start: '2026-10-01T08:00:00Z', end: '2026-10-01T20:00:00Z', duration: 12 },
        { workerId: 'w1', start: '2026-10-02T07:00:00Z', end: '2026-10-02T16:00:00Z', duration: 9 },
      ],
      settings: { fatigueHighShiftHours: 10, fatigueWindowDays: 7, overtimeThreshold: 8, restThresholdHours: 8 },
      workerId: 'w1',
      workers: [{ id: 'w1', warningCount: 1 }],
    })
    expect(warnings.some((warning) => warning.type === 'Long shift')).toBe(true)
  })

  it('accepts feedback without a name field', () => {
    const result = createFeedbackEntry({ category: 'Safety', area: 'Zone 3', text: 'The toolbox talk was clear and useful.', rating: 5 })
    expect(result.ok).toBe(true)
    expect(result.item.category).toBe('Safety')
  })

  it('reads and resets demo storage data', () => {
    const mockState = createSeedState()
    writeDemoState(mockState)
    expect(readDemoState().selectedIndustry).toBe('construction')
    resetDemoState()
    expect(readDemoState().language).toBe('en')
  })
})

describe('FairShift app UI', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the landing page and supports navigation', () => {
    render(<App />)
    expect(screen.getByText(/FairShift helps workers and employers/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument()
  })

  it('switches interface language', async () => {
    render(<App />)
    const selector = screen.getByLabelText(/language/i)
    fireEvent.change(selector, { target: { value: 'hi' } })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /फेयरशिफ्ट श्रमिकों और/i })).toBeInTheDocument()
    })
  })

  it('lets a worker add a skill to their demo passport', async () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('link', { name: /explore the demo/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /worker/i }))
    fireEvent.click(screen.getByRole('link', { name: /skill passport/i }))
    fireEvent.click(screen.getByRole('button', { name: /add skill or training/i }))
    fireEvent.change(screen.getByRole('textbox', { name: /skill or training name/i }), { target: { value: 'Confined space awareness' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText('Confined space awareness')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/added to your skill passport/i)
  })
})
