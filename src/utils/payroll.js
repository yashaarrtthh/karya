export function calculateSalaryBreakdown({
  hoursWorked = 0,
  hourlyRate = 0,
  overtimeMultiplier = 1.5,
  overtimeThreshold = 8,
  additionalEarnings = 0,
  deductions = 0,
}) {
  const safeHours = Number(hoursWorked) || 0;
  const safeRate = Number(hourlyRate) || 0;
  const regularHours = Math.min(safeHours, overtimeThreshold);
  const overtimeHours = Math.max(0, safeHours - overtimeThreshold);

  const regularEarnings = Number((regularHours * safeRate).toFixed(2));
  const overtimeEarnings = Number((overtimeHours * safeRate * overtimeMultiplier).toFixed(2));
  const additional = Number(additionalEarnings) || 0;
  const deduction = Number(deductions) || 0;
  const total = Number((regularEarnings + overtimeEarnings + additional - deduction).toFixed(2));

  return {
    regularHours,
    overtimeHours,
    regularHourlyRate: safeRate,
    overtimeMultiplier,
    regularEarnings,
    overtimeEarnings,
    additionalEarnings: additional,
    deductions: deduction,
    totalEstimatedPay: total,
  };
}
