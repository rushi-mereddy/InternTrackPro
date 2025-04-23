import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isAfter, isBefore, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatter
export function formatDate(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd MMM yyyy');
}

// Distance to now formatter
export function formatDateToNow(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

// Format price 
export function formatPrice(price: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    // Format as ₹X,XXX
    return `₹${price.toLocaleString('en-IN')}`;
  }
  return `${currency} ${price.toLocaleString()}`;
}

// Format salary with LPA
export function formatSalary(min?: number, max?: number, currency: string = 'INR'): string {
  if (!min && !max) return 'Not disclosed';
  
  if (currency === 'INR') {
    if (min && max) {
      // Convert to lakhs and format
      const minLPA = (min / 100000).toFixed(1);
      const maxLPA = (max / 100000).toFixed(1);
      return `${minLPA}-${maxLPA} LPA`;
    } else if (min) {
      const minLPA = (min / 100000).toFixed(1);
      return `${minLPA} LPA`;
    } else if (max) {
      const maxLPA = (max / 100000).toFixed(1);
      return `Up to ${maxLPA} LPA`;
    }
  }
  
  return 'Not disclosed';
}

// Format stipend
export function formatStipend(amount?: number, currency: string = 'INR'): string {
  if (!amount) return 'Unpaid';
  
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}/month`;
  }
  return `${currency} ${amount.toLocaleString()}/month`;
}

// Check if deadline is approaching (within 3 days)
export function isDeadlineApproaching(deadline?: Date | string): boolean {
  if (!deadline) return false;
  
  const parsedDeadline = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);
  
  return isAfter(parsedDeadline, now) && isBefore(parsedDeadline, threeDaysFromNow);
}

// Extract initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Format rating to X.Y/5
export function formatRating(rating: number): string {
  // Convert from 0-50 scale to 0-5 scale with one decimal
  return (rating / 10).toFixed(1) + '/5';
}

// Format learner count (e.g. 12,345 to 12.3K)
export function formatLearnerCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M+ learners';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K+ learners';
  }
  return count + '+ learners';
}

// Shorten text with ellipsis
export function shortenText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Calculate discount price
export function calculateDiscountPrice(originalPrice: number, discountPercentage: number): number {
  return originalPrice - (originalPrice * discountPercentage / 100);
}

// Calculate profile completion percentage
export function calculateProfileCompletion(
  user?: any,
  profile?: any,
  education?: any[],
  experience?: any[],
  skills?: any[]
): number {
  let total = 0;
  let completed = 0;
  
  // Basic info
  if (user) {
    total += 4;
    completed += user.firstName ? 1 : 0;
    completed += user.lastName ? 1 : 0;
    completed += user.email ? 1 : 0;
    completed += user.contactNumber ? 1 : 0;
  }
  
  // Profile info
  if (profile) {
    total += 3;
    completed += profile.educationLevel ? 1 : 0;
    completed += profile.institution ? 1 : 0;
    completed += profile.careerObjective ? 1 : 0;
  }
  
  // Education
  total += 1;
  completed += education && education.length > 0 ? 1 : 0;
  
  // Experience
  total += 1;
  completed += experience && experience.length > 0 ? 1 : 0;
  
  // Skills
  total += 1;
  completed += skills && skills.length > 0 ? 1 : 0;
  
  return Math.round((completed / total) * 100);
}

// Function to get status badge color
export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'applied':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'shortlisted':
      return { bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'interview':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'selected':
      return { bg: 'bg-secondary-500/10', text: 'text-secondary-600' };
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

// Function to format course duration
export function formatCourseDuration(weeks: number): string {
  if (weeks >= 4) {
    const months = Math.floor(weeks / 4);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  return `${weeks} week${weeks > 1 ? 's' : ''}`;
}
