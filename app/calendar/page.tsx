'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '../components/Layout';

const locales = {
  'ko-KR': require('date-fns/locale/ko'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  createdAt: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/calendar');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '일정을 불러오는데 실패했습니다.');
      }
      
      // 날짜 문자열을 Date 객체로 변환
      const formattedEvents = result.data.map((event: Event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('일정 데이터 조회 오류:', error);
      setError('일정을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('일정 제목을 입력하세요');
    if (title) {
      try {
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            start,
            end,
          }),
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        
        fetchEvents();
      } catch (error) {
        console.error('일정 추가 오류:', error);
        alert('일정 추가에 실패했습니다.');
      }
    }
  };

  const handleEventClick = async (event: Event) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/calendar?id=${event._id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        
        fetchEvents();
      } catch (error) {
        console.error('일정 삭제 오류:', error);
        alert('일정 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">일정표</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 text-black">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={handleSelect}
          onSelectEvent={handleEventClick}
          messages={{
            next: '다음',
            previous: '이전',
            today: '오늘',
            month: '월',
            week: '주',
            day: '일',
            agenda: '일정',
            date: '날짜',
            time: '시간',
            event: '일정',
            noEventsInRange: '해당 기간에 일정이 없습니다.',
            allDay: '종일'
          }}
        />
      </div>
    </Layout>
  );
} 