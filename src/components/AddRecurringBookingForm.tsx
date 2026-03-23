import React, { useState } from 'react';
import { Button } from './ui/button';
import { TIME_SLOTS } from '../types';
import { RecurringBooking } from '../types';

interface AddRecurringBookingFormProps {
  onSubmit: (data: Omit<RecurringBooking, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

const AddRecurringBookingForm: React.FC<AddRecurringBookingFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<Omit<RecurringBooking, 'id'>>({
    court: 1,
    dayOfWeek: 'friday',
    startTime: TIME_SLOTS[0],
    duration: 1,
    fullName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'court' || name === 'duration' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dayOfWeek || !form.startTime || !form.duration || !form.court || !form.fullName || !form.phoneNumber) {
      setError('All fields are required.');
      return;
    }
    setError(null);
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Full Name</label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="form-control"
          required
          placeholder="Full Name"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Phone Number</label>
        <input
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          className="form-control"
          required
          placeholder="Phone Number"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Court</label>
        <select name="court" value={form.court} onChange={handleChange} className="form-control">
          <option value={1}>Court 1</option>
          <option value={2}>Court 2</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Day of Week</label>
        <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className="form-control">
          {DAYS_OF_WEEK.map(day => (
            <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Start Time</label>
        <select name="startTime" value={form.startTime} onChange={handleChange} className="form-control">
          {TIME_SLOTS.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Duration (hours)</label>
        <select name="duration" value={form.duration} onChange={handleChange} className="form-control">
          {[1,2,3,4].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" className="bg-[#13005A] text-white" disabled={loading}>Add Booking</Button>
      </div>
    </form>
  );
};

export default AddRecurringBookingForm; 