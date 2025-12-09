/**
 * Check if a date is a weekend
 */
exports.isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Check if a date is in the past
 */
exports.isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Check if a date is in the current month
 */
exports.isCurrentMonth = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a time slot is expired (past time)
 */
exports.isTimeSlotExpired = (date, timeSlot) => {
  const now = new Date();
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes || 0, 0, 0);
  
  // Add 2 hours (duration of a slot)
  slotDate.setHours(slotDate.getHours() + 2);
  
  return slotDate < now;
};

/**
 * Generate time slots (10:00 AM to 8:00 PM, 2 hours each)
 */
exports.generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour <= 20; hour += 2) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    slots.push(startTime);
  }
  return slots;
};

/**
 * Format date to YYYY-MM-DD
 */
exports.formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get all dates in current month
 */
exports.getCurrentMonthDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates = [];
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates;
};

