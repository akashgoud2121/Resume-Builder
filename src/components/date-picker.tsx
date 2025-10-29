"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear + 5; i >= 1980; i--) {
    years.push(i.toString());
  }
  return years;
};

const YEARS = generateYears();

interface MonthYearPickerProps {
  value: string; // e.g., "May 2024"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, onChange, placeholder = "Select date", disabled, hasError }) => {
  const [month, year] = value ? value.split(' ') : ['', ''];

  const handleMonthChange = (newMonth: string) => {
    onChange(year ? `${newMonth} ${year}` : newMonth);
  };

  const handleYearChange = (newYear: string) => {
    onChange(month ? `${month} ${newYear}` : newYear);
  };

  return (
    <div className="flex gap-2">
      <Select value={month} onValueChange={handleMonthChange} disabled={disabled}>
        <SelectTrigger className={cn(hasError && "border-destructive")}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={handleYearChange} disabled={disabled}>
        <SelectTrigger className={cn(hasError && "border-destructive")}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};

interface YearPickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const YearPicker: React.FC<YearPickerProps> = ({ value, onChange, placeholder = "Select year", disabled }) => {
    const year = value && YEARS.includes(value) ? value : '';

    return (
        <Select value={year} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
        </Select>
    );
};