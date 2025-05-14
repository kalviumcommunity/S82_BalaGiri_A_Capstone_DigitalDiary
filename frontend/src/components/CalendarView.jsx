import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function CalendarView({ onSelectDate, currentTheme }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isDark = currentTheme.text.includes('E1E7FF');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const bgHover = isDark ? 'hover:bg-white/20' : 'hover:bg-gray-100';
  const selectedBg = isDark ? 'bg-white/30' : 'bg-blue-500';

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className={`${textColor} p-4 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'} shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={previousMonth} className={`p-2 rounded-full ${bgHover}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className={`p-2 rounded-full ${bgHover}`}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}

        {days.map((day) => (
          <button
            key={day.toString()}
            onClick={() => onSelectDate(day)}
            className={`
              p-2 rounded-full text-center
              ${isSameMonth(day, currentDate) ? '' : 'opacity-50'}
              ${isSameDay(day, new Date()) ? selectedBg : ''}
              ${bgHover}
            `}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
