export interface Booking {
  id: string;
  fullName: string;
  phoneNumber: string;
  court: 1 | 2;
  startTime: string;
  endTime: string;
  reservationType: '1hour' | '2hours' | '3hours' | 'vip4hours';
  date: string;
  status: 'pending' | 'approved' | 'canceled';
  price: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface TeamPair {
  teamA: string;
  teamB: string;
}

export interface Championship {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  registrationEnabled: boolean;
  image?: string;
  teams?: TeamPair[];
}

export interface Advertisement {
  id: string;
  image: string;
  title?: string;
  description?: string;
  link?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  court: 1 | 2;
}

export interface RecurringBooking {
  id?: string;
  court: 1 | 2;
  dayOfWeek: string; // e.g., 'friday'
  startTime: string; // e.g., '1:00 PM'
  duration: number; // in hours
  fullName: string;
  phoneNumber: string;
  status?: 'active' | 'held';
}

export interface TrainingCard {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  link?: string;
}

export const RESERVATION_TYPES = {
  '1hour': { label: '1 Hour', price: 250, duration: 1 },
  '2hours': { label: '2 Hours', price: 450, duration: 2 },
  '3hours': { label: '3 Hours', price: 650, duration: 3 },
  'vip4hours': { label: 'VIP 4 Hours', price: 800, duration: 4 }
} as const;

export const TIME_SLOTS = [
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
  '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM',
  '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM'
];
