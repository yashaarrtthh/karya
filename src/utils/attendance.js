export function calculateShiftDuration(start, end) {
  if (!start || !end) return 0;

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime <= startTime) {
    return 0;
  }

  return Number(((endTime - startTime) / (1000 * 60 * 60)).toFixed(2));
}

export function getOvertimeHours(hoursWorked, threshold = 8) {
  const totalHours = Number(hoursWorked) || 0;
  return Math.max(0, Number((totalHours - threshold).toFixed(2)));
}

export function detectFatigueWarnings({
  currentHours = 0,
  recentHours = 0,
  hoursSinceLastShift = Number.POSITIVE_INFINITY,
  thresholdHours = 8,
  cumulativeThreshold = 44,
  restThreshold = 8,
}) {
  const warnings = [];

  if (currentHours > thresholdHours) {
    warnings.push({
      code: 'long-shift',
      title: 'Extended shift',
      detail: `Shift length reached ${currentHours.toFixed(1)} hours, above the ${thresholdHours}-hour demo threshold.`,
      value: currentHours,
      threshold: thresholdHours,
    });
  }

  if (recentHours > cumulativeThreshold) {
    warnings.push({
      code: 'cumulative-hours',
      title: 'High weekly hours',
      detail: `Recorded hours total ${recentHours.toFixed(1)} in the last 7-day period, above the ${cumulativeThreshold}-hour demo limit.`,
      value: recentHours,
      threshold: cumulativeThreshold,
    });
  }

  if (Number.isFinite(hoursSinceLastShift) && hoursSinceLastShift < restThreshold) {
    warnings.push({
      code: 'insufficient-rest',
      title: 'Insufficient rest',
      detail: `Only ${hoursSinceLastShift.toFixed(1)} hours passed since the previous shift, below the ${restThreshold}-hour demo rest threshold.`,
      value: hoursSinceLastShift,
      threshold: restThreshold,
    });
  }

  return warnings;
}
