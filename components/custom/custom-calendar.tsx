import { addMonths, format, getDay, isEqual, isSameMonth, isToday, startOfMonth, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CustomCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
}

export function CustomCalendar({ selectedDate, onDateSelect }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  
  const weekDays = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' }
  ];
  
  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const firstDayOffset = getDay(start);
    const days: (Date | null)[] = Array(firstDayOffset).fill(null);
    
    let currentDate = start;
    while (isSameMonth(currentDate, start)) {
      days.push(currentDate);
      currentDate = addMonths(currentDate, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate && isEqual(date, selectedDate)) {
      onDateSelect?.(undefined);
    } else {
      onDateSelect?.(date);
    }
  };

  return (
    <div className="p-1">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="text-foreground opacity-50 hover:opacity-100"
        >
          <ChevronLeft className="size-3" />
        </button>
        <span className="text-xs font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="text-foreground opacity-50 hover:opacity-100"
        >
          <ChevronRight className="size-3" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {weekDays.map(({ key, label }) => (
          <div key={key} className="text-center text-muted-foreground/50 text-[0.5rem] font-normal">
            {label}
          </div>
        ))}
        
        {getDaysInMonth(currentMonth).map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          
          const isSelected = selectedDate ? isEqual(date, selectedDate) : false;
          const isTodayDate = isToday(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`text-[0.65rem] size-6 flex items-center justify-center ${
                isSelected
                  ? 'text-foreground font-medium'
                  : isTodayDate
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
} 