import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useRSVPStore } from '../store/rsvpStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { downloadEventICS } from '../utils/ics';
import {
  CheckCircle,
  Calendar,
  Share2,
  Video,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  AlertTriangle
} from 'lucide-react';

export const RSVPSuccess: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const { currentEvent, fetchEventById, autoCheckInDaring } = useRSVPStore();
  const [guest, setGuest] = useState<any>(null);
  
  const [autoCheckedIn, setAutoCheckedIn] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
    }

    // Attempt to read guest from router state
    if (location.state && location.state.guest) {
      setGuest(location.state.guest);
      if (location.state.guest.statusUndangan === 'hadir') {
        setAutoCheckedIn(true);
      }
    }
  }, [eventId, fetchEventById, location.state]);

  const handleDownloadCalendar = () => {
    if (currentEvent) {
      downloadEventICS(currentEvent);
    }
  };

  const getWhatsAppShareUrl = () => {
    if (!currentEvent || !guest) return '#';
    const text = `Halo, saya *${guest.nama}* (${guest.jabatan} - ${guest.instansi}) telah mengonfirmasi kehadiran secara *${guest.metodeKehadiran.toUpperCase()}* untuk kegiatan:

*"${currentEvent.namaKegiatan}"*

Waktu: ${new Date(currentEvent.waktuMulai).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}
Lokasi: ${currentEvent.lokasi.tempat}

Terima kasih.`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleJoinOnlineMeeting = async () => {
    if (!guest || !currentEvent || !currentEvent.lokasi.urlOnline) return;

    try {
      // Auto check-in the guest in Zustand/localstorage
      await autoCheckInDaring(currentEvent.id, guest.id);
      setAutoCheckedIn(true);
      
      // Update local guest object status
      setGuest((prev: any) => prev ? { ...prev, statusUndangan: 'hadir' } : null);
      
      // Open online meeting link in a new window
      window.open(currentEvent.lokasi.urlOnline, '_blank', 'noopener,noreferrer');
    } catch (e) {
      // Fallback: just open the link if anything goes wrong
      window.open(currentEvent.lokasi.urlOnline, '_blank', 'noopener,noreferrer');
    }
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-sm text-slate-500 font-sans">Memuat halaman konfirmasi...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <h2 className="text-lg font-bold text-slate-900">Akses Tidak Valid</h2>
          <p className="text-sm text-slate-500">
            Halaman ini hanya dapat diakses sesaat setelah Anda berhasil mengisi form RSVP kegiatan.
          </p>
          <Link to={`/rsvp/${eventId}`} className="inline-block mt-4">
            <Button variant="primary">Kembali ke Form RSVP</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">RSVP Berhasil Dikirim</h2>
          <p className="text-xs text-slate-500">
            Terima kasih atas konfirmasi kehadiran Anda.
          </p>
        </div>

        {/* Confirmation Summary Card */}
        <Card className="bg-white">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <span className="text-xs font-semibold text-slate-500 block mb-1 font-sans">
              Ringkasan Konfirmasi
            </span>
            <h3 className="text-sm font-bold text-slate-900">Detail Tamu</h3>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-medium">Nama</span>
              <span className="col-span-2 font-semibold text-slate-900">{guest.nama}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-medium">Jabatan</span>
              <span className="col-span-2 text-slate-600">{guest.jabatan}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-medium">Instansi</span>
              <span className="col-span-2 text-slate-600">{guest.instansi}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-medium">Metode Kehadiran</span>
              <span className="col-span-2 font-sans">
                <Badge variant={guest.metodeKehadiran === 'luring' ? 'purple' : 'cyan'}>
                  {guest.metodeKehadiran}
                </Badge>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pb-1">
              <span className="text-slate-400 font-medium">Waktu Konfirmasi</span>
              <span className="col-span-2 text-slate-500 font-sans">
                {new Date(guest.waktuKonfirmasi).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })} WIB
              </span>
            </div>
          </div>
        </Card>

        {/* Meeting Joiner (Auto Checkin Trigger for Online Guests) */}
        {guest.metodeKehadiran === 'daring' && currentEvent.lokasi.urlOnline && (
          <Card className="bg-blue-50/50 border border-blue-200">
            <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1 font-sans">
              <Video className="h-4 w-4" />
              Gabung Rapat Online
            </h3>
            
            <p className="text-xs text-blue-700 leading-relaxed mb-4 font-sans">
              Silakan klik tombol di bawah untuk bergabung ke video meeting. Sistem akan menandai kehadiran Anda secara otomatis saat tautan diklik.
            </p>

            {autoCheckedIn ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2.5 rounded mb-3 flex items-center gap-1.5 font-semibold font-sans">
                <ClipboardCheck className="h-4 w-4" />
                Presensi terverifikasi otomatis (Hadir)
              </div>
            ) : null}

            <Button
              onClick={handleJoinOnlineMeeting}
              variant="primary"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white border-blue-700 font-sans"
            >
              Gabung Rapat Sekarang
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleDownloadCalendar}
            variant="outline"
            className="w-full inline-flex items-center justify-center gap-1.5 border-slate-350 font-sans"
          >
            <Calendar className="h-4 w-4" />
            Tambah ke Kalender (.ics)
          </Button>

          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="secondary"
              className="w-full inline-flex items-center justify-center gap-1.5 border border-slate-200 font-sans"
            >
              <Share2 className="h-4 w-4" />
              Bagikan Konfirmasi ke WA
            </Button>
          </a>
        </div>

        {/* Link back to RSVP form */}
        <div className="text-center">
          <Link
            to={`/rsvp/${eventId}`}
            className="text-xs font-semibold text-slate-550 hover:text-slate-800 transition-colors inline-flex items-center gap-0.5 font-sans"
          >
            Kembali ke Form
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </div>
  );
};
