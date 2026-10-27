export function calculateShiftDuration(start, end) {
  if (!start || !end) return 0
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0
  const diffMs = endDate.getTime() - startDate.getTime()
  if (diffMs <= 0) return 0
  return Number((diffMs / (1000 * 60 * 60)).toFixed(2))
}

export function calculateOvertimeHours(duration, overtimeThreshold = 8) {
  if (!Number.isFinite(duration)) return 0
  return Math.max(0, Number((duration - overtimeThreshold).toFixed(2)))
}

export function calculatePayBreakdown({ regularHours, hourlyRate, overtimeHours, overtimeMultiplier = 1.5, additionalEarnings = 0, deductions = 0 }) {
  const regularEarnings = Number((regularHours * hourlyRate).toFixed(2))
  const overtimeEarnings = Number((overtimeHours * hourlyRate * overtimeMultiplier).toFixed(2))
  const total = Number((regularEarnings + overtimeEarnings + additionalEarnings - deductions).toFixed(2))

  return {
    regularHours,
    hourlyRate,
    overtimeHours,
    overtimeMultiplier,
    regularEarnings,
    overtimeEarnings,
    additionalEarnings,
    deductions,
    total,
  }
}

export function validateSafetyReport({ title, category, severity, description, area }) {
  const errors = {}

  if (!title || title.trim().length < 5) errors.title = 'Please enter a clear title with at least 5 characters.'
  if (!category) errors.category = 'Please choose a report category.'
  if (!severity) errors.severity = 'Please choose a severity level.'
  if (!description || description.trim().length < 15) errors.description = 'Please provide a brief description with at least 15 characters.'
  if (!area || area.trim().length < 2) errors.area = 'Please state the workplace area or location.'

  return errors
}

export function createSafetyReport({ title, category, severity, description, area, workerId }) {
  const validation = validateSafetyReport({ title, category, severity, description, area })
  if (Object.keys(validation).length > 0) {
    return { ok: false, errors: validation }
  }

  return {
    ok: true,
    report: {
      id: `report-${Date.now()}`,
      workerId,
      title: title.trim(),
      category,
      severity,
      area: area.trim(),
      description: description.trim(),
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updates: [],
    },
  }
}

export function updateSafetyReportStatus(reports, reportId, nextStatus) {
  if (!Array.isArray(reports)) return []
  return reports.map((report) =>
    report.id === reportId
      ? {
          ...report,
          status: nextStatus,
          updates: [
            ...(report.updates || []),
            { at: new Date().toISOString(), note: `Status moved to ${nextStatus} by demo admin.` },
          ],
        }
      : report,
  )
}

export function createFeedbackEntry({ category, area, text, rating }) {
  const cleanText = (text || '').trim()
  if (!category || !cleanText || cleanText.length < 10) {
    return { ok: false, errors: { text: 'Please include a short feedback note.' } }
  }

  return {
    ok: true,
    item: {
      id: `feedback-${Date.now()}`,
      category,
      area: area?.trim() || 'General',
      rating: Number(rating || 0),
      text: cleanText,
      createdAt: new Date().toISOString(),
    },
  }
}

export function detectFatigueWarnings({ shifts = [], settings = {}, workerId = null, workers = [] }) {
  const warnings = []
  const current = shifts.filter((shift) => shift.workerId === workerId)
  const totalHours = current.reduce((sum, shift) => sum + Number(shift.duration || 0), 0)
  const longShift = current.some((shift) => Number(shift.duration || 0) > (settings.fatigueHighShiftHours || 10))
  const recentWindow = settings.fatigueWindowDays || 7

  if (longShift) {
    warnings.push({
      type: 'Long shift',
      reason: 'One or more shifts exceeded the configured high-shift threshold.',
      values: { threshold: settings.fatigueHighShiftHours || 10, actual: current.filter((shift) => Number(shift.duration || 0) > (settings.fatigueHighShiftHours || 10)).map((shift) => Number(shift.duration || 0)) },
    })
  }

  if (totalHours > (settings.overtimeThreshold || 8) * recentWindow) {
    warnings.push({
      type: 'Cumulative hours',
      reason: 'Recorded hours across the selected period exceed the configured fatigue window.',
      values: { threshold: (settings.overtimeThreshold || 8) * recentWindow, actual: totalHours },
    })
  }

  const sorted = [...current].sort((a, b) => new Date(a.end) - new Date(b.end))
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]
    const next = sorted[i]
    const restHours = (new Date(next.start) - new Date(prev.end)) / (1000 * 60 * 60)
    if (restHours < (settings.restThresholdHours || 8)) {
      warnings.push({
        type: 'Insufficient rest',
        reason: 'The break between shifts is shorter than the configured rest threshold.',
        values: { threshold: settings.restThresholdHours || 8, actual: Number(restHours.toFixed(2)) },
      })
    }
  }

  if (workers && workers.length > 0) {
    const worker = workers.find((person) => person.id === workerId)
    if (worker && worker.warningCount > 0) {
      warnings.push({
        type: 'Operational note',
        reason: 'One or more warning indicators are already recorded for this worker.',
        values: { threshold: 0, actual: worker.warningCount },
      })
    }
  }

  return warnings
}
