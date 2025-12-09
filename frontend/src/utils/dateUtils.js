/**
 * Check if a date is a weekend
 */
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Check if a date is in the current month
 */
export const isCurrentMonth = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a time slot is expired
 */
export const isTimeSlotExpired = (date, timeSlot) => {
  const now = new Date();
  const [hours] = timeSlot.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, 0, 0, 0);
  
  // Add 2 hours (duration of a slot)
  slotDate.setHours(slotDate.getHours() + 2);
  
  return slotDate < now;
};

/**
 * Generate time slots (10:00 AM to 8:00 PM, 2 hours each)
 */
export const generateTimeSlots = () => {
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
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get all dates in current month
 */
export const getCurrentMonthDates = () => {
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

/**
 * Format time slot for display (e.g., "10:00" -> "10:00 AM - 12:00 PM")
 */
export const formatTimeSlot = (timeSlot) => {
  const [hours] = timeSlot.split(':').map(Number);
  const startHour = hours % 12 || 12;
  const startAmPm = hours < 12 ? 'AM' : 'PM';
  const endHour = (hours + 2) % 12 || 12;
  const endAmPm = hours + 2 < 12 ? 'AM' : 'PM';
  return `${startHour}:00 ${startAmPm} - ${endHour}:00 ${endAmPm}`;
};

/**
 * Format date for display
 */
export const formatDateDisplay = (date) => {
  const d = new Date(date);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

