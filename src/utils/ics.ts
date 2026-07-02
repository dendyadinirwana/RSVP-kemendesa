import type { Event } from '../types';

export const generateICS = (event: Event): string => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    } catch (e) {
      return '';
    }
  };

  const dtStamp = formatDate(new Date().toISOString());
  const dtStart = formatDate(event.waktuMulai);
  const dtEnd = formatDate(event.waktuSelesai);
  
  const description = `Terima kasih telah melakukan konfirmasi kehadiran.\\n\\n` +
    `Kegiatan: ${event.namaKegiatan}\\n` +
    `Jenis Rapat: ${event.jenisRapat.toUpperCase()}\\n` +
    `Lokasi: ${event.lokasi.tempat}` +
    `${event.lokasi.urlOnline ? `\\nLink Daring: ${event.lokasi.urlOnline}` : ''}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kemendesa//RSVP Application//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}-rsvp@kemendesa.go.id`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.namaKegiatan}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${event.lokasi.tempat}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

export const downloadEventICS = (event: Event) => {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Format filename cleanly
  const cleanName = event.namaKegiatan
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30);
  
  link.href = url;
  link.setAttribute('download', `jadwal-kegiatan-${cleanName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
