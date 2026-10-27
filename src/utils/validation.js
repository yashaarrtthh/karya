export function validateSafetyReport({ category, severity, description, title }) {
  const errors = [];

  if (!category || !String(category).trim()) {
    errors.push('Select a safety category.');
  }

  if (!severity || !String(severity).trim()) {
    errors.push('Select a severity level.');
  }

  if (!title || !String(title).trim()) {
    errors.push('Add a brief report title.');
  }

  if (!description || !String(description).trim()) {
    errors.push('Provide a clear description of the issue.');
  }

  if (String(description || '').trim().length < 12) {
    errors.push('Description should be at least 12 characters long.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateFeedback({ category, message, name }) {
  const errors = [];

  if (!category || !String(category).trim()) {
    errors.push('Select a feedback category.');
  }

  if (!message || !String(message).trim()) {
    errors.push('Share your feedback comment.');
  }

  if (String(message || '').trim().length < 10) {
    errors.push('Please provide a longer note so we can respond usefully.');
  }

  if (name !== undefined && name !== null && String(name).trim().length > 0 && String(name).trim().length < 2) {
    errors.push('Name should be at least two characters if provided.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function updateReportStatus(report, status, note) {
  if (!report) {
    return { valid: false, errors: ['Report not found.'] };
  }

  const cleanStatus = String(status || '').trim();
  const cleanNote = String(note || '').trim();

  if (!cleanStatus) {
    return { valid: false, errors: ['Choose a status.'] };
  }

  return {
    valid: true,
    updated: {
      ...report,
      status: cleanStatus,
      resolutionNote: cleanNote || 'No note added.',
      updatedAt: new Date().toISOString(),
    },
  };
}
