import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/hu';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('hu');
const localizer = momentLocalizer(moment);

const customCalendarStyles = `
  .rbc-calendar {
    font-family: system-ui, -apple-system, sans-serif;
    color: #cbd5e1;
  }
  .rbc-header {
    padding: 12px 4px;
    font-weight: 700;
    color: #34d399;
    border-bottom: 2px solid rgba(52, 211, 153, 0.3) !important;
    text-transform: capitalize;
  }
  .rbc-month-view, .rbc-time-view {
    background: rgba(15, 30, 22, 0.4);
    border: 1px solid rgba(52, 211, 153, 0.2) !important;
    border-radius: 12px;
    overflow: hidden;
  }
  .rbc-day-bg + .rbc-day-bg, .rbc-month-row, .rbc-time-header-content, .rbc-time-content {
    border-color: rgba(52, 211, 153, 0.1) !important;
  }
  .rbc-off-range-bg {
    background: rgba(0, 0, 0, 0.3);
  }
  .rbc-today {
    background: rgba(52, 211, 153, 0.08) !important;
  }
  .rbc-event {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    border: none !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    padding: 4px 8px !important;
    font-size: 0.85rem;
  }
  .rbc-toolbar button {
    color: #cbd5e1 !important;
    border: 1px solid rgba(52, 211, 153, 0.3) !important;
    background: rgba(15, 30, 22, 0.6) !important;
    border-radius: 8px !important;
    margin: 2px;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .rbc-toolbar button:hover {
    background: rgba(52, 211, 153, 0.2) !important;
    color: #34d399 !important;
  }
  .rbc-toolbar button.rbc-active {
    background: rgba(52, 211, 153, 0.25) !important;
    color: #34d399 !important;
    border-color: #34d399 !important;
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  }
  .rbc-toolbar-label {
    font-weight: 800;
    font-size: 1.1rem;
    color: #fff;
    text-transform: capitalize;
  }
  .rbc-time-slot {
    border-color: rgba(255, 255, 255, 0.03) !important;
  }
  .rbc-current-time-indicator {
    background-color: #ef4444 !important;
  }
`;

export default function ScheduleView({ lessons: propsLessons = [], user, token, selectedTeacherId, onDeleteLesson }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      let lessonsToProcess = propsLessons;

      if (token) {
        try {
          let url = 'http://localhost:5000/api/schedule';
          if ((user?.is_admin || user?.id === 1) && selectedTeacherId) {
            url += `?teacher_id=${selectedTeacherId}`;
          }

          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            lessonsToProcess = data;
          }
        } catch (err) {
          console.error('Hiba az órarend adatok lekérésekor:', err);
        }
      }

      const formattedEvents = (Array.isArray(lessonsToProcess) ? lessonsToProcess : []).map(lesson => {
        const start = new Date(lesson.start_time);
        const end = new Date(lesson.end_time);
        
        const titleText = user?.role === 'teacher'
          ? `${lesson.subject} - ${lesson.student_name || 'Diák'}`
          : `${lesson.subject} (${lesson.teacher_name || 'Tanár'})`;

        return {
          id: lesson.id,
          title: titleText,
          start: isNaN(start.getTime()) ? new Date() : start,
          end: isNaN(end.getTime()) ? new Date() : end,
          resource: lesson
        };
      });

      setEvents(formattedEvents);
    };

    fetchScheduleData();
  }, [propsLessons, user, token, selectedTeacherId]);

  const handleSelectEvent = (event) => {
    const lesson = event.resource;
    const details = `Óra: ${lesson.subject}\nTanár: ${lesson.teacher_name || 'N/A'}\nDiák: ${lesson.student_name || 'N/A'}\nIdőpont: ${moment(lesson.start_time).format('YYYY-MM-DD HH:mm')} - ${moment(lesson.end_time).format('HH:mm')}\nTémakör: ${lesson.topic || 'Nincs megadva'}`;
    
    if (user?.role === 'teacher' && onDeleteLesson) {
      if (window.confirm(`${details}\n\nSzeretnéd törölni/lemondani ezt az órát?`)) {
        onDeleteLesson(lesson.id);
      }
    } else {
      alert(details);
    }
  };

  return (
    <div style={{ height: '650px', width: '100%', padding: '10px' }}>
      <style>{customCalendarStyles}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        messages={{
          next: "Következő",
          previous: "Előző",
          today: "Ma",
          month: "Hónap",
          week: "Hét",
          day: "Nap",
          agenda: "Agenda",
          date: "Dátum",
          time: "Idő",
          event: "Óra",
          noEventsInRange: "Nincsenek órák ebben az időszakban."
        }}
        defaultView="week"
        views={['month', 'week', 'day']}
        step={30}
        timeslots={2}
      />
    </div>
  );
}