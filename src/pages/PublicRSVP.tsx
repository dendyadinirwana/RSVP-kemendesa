import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRSVPStore } from '../store/rsvpStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Calendar,
  MapPin,
  Video,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

export const PublicRSVP: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentEvent, fetchEventById, submitRSVP, isLoading } = useRSVPStore();

  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [instansi, setInstansi] = useState('');
  const [metodeKehadiran, setMetodeKehadiran] = useState<'daring' | 'luring' | ''>('');
  const [apakahHadir, setApakahHadir] = useState<'ya' | 'tidak'>('ya');
  
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
    }
  }, [eventId, fetchEventById]);

  // Set default method of attendance based on event type
  useEffect(() => {
    if (currentEvent) {
      if (currentEvent.jenisRapat === 'luring') {
        setMetodeKehadiran('luring');
      } else if (currentEvent.jenisRapat === 'daring') {
        setMetodeKehadiran('daring');
      }
    }
  }, [currentEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!nama.trim()) {
      setValidationError('Nama lengkap wajib diisi.');
      return;
    }
    if (!jabatan.trim()) {
      setValidationError('Jabatan wajib diisi.');
      return;
    }
    if (!instansi.trim()) {
      setValidationError('Instansi wajib diisi.');
      return;
    }
    if (apakahHadir === 'ya' && !metodeKehadiran) {
      setValidationError('Silakan pilih metode kehadiran Anda.');
      return;
    }
    if (!eventId) return;

    try {
      const guest = await submitRSVP(eventId, {
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        instansi: instansi.trim(),
        metodeKehadiran: apakahHadir === 'ya' ? (metodeKehadiran as 'daring' | 'luring') : null,
        statusUndangan: apakahHadir === 'ya' ? 'dikonfirmasi' : 'tidak_hadir',
        submittedAt: new Date().toISOString(),
      });

      // Navigate to success page, passing the guest object
      navigate(`/rsvp/${eventId}/success`, { state: { guest } });
    } catch (err: any) {
      setValidationError(err.message || 'Gagal melakukan konfirmasi. Silakan coba kembali.');
    }
  };

  const formatDateString = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-sm text-slate-500 font-mono">MEMUAT FORM RSVP...</p>
      </div>
    );
  }

  const showDaringOption = currentEvent.jenisRapat === 'daring' || currentEvent.jenisRapat === 'hybrid';
  const showLuringOption = currentEvent.jenisRapat === 'luring' || currentEvent.jenisRapat === 'hybrid';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo / Header Instansi */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2.5 bg-slate-900 rounded text-white mb-3">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
            Kementerian Desa PDTT
          </h2>
        </div>

        {/* Info Box */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-xs">
          <div className="flex justify-between items-start gap-4 mb-3">
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {currentEvent.namaKegiatan}
            </h1>
            <Badge
              variant={
                currentEvent.jenisRapat === 'hybrid'
                  ? 'purple'
                  : currentEvent.jenisRapat === 'daring'
                  ? 'cyan'
                  : 'warning'
              }
            >
              {currentEvent.jenisRapat}
            </Badge>
          </div>

          <div className="space-y-2 text-xs text-slate-500 font-sans border-t border-slate-100 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>{formatDateString(currentEvent.waktuMulai)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>{currentEvent.lokasi.tempat}</span>
            </div>
            {currentEvent.lokasi.urlOnline && (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="truncate text-slate-500 font-mono text-[11px]">
                  Rapat daring tersedia
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RSVP Form */}
        <Card className="bg-white">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Form Konfirmasi Kehadiran
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mohon isi data diri Anda secara benar untuk pendataan kehadiran.
            </p>
          </div>

          {validationError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 mb-4 flex items-center gap-1.5 font-medium">
              <AlertCircle className="h-4 w-4" />
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Nama Lengkap"
                placeholder="Nama Lengkap & Gelar (jika ada)"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <Input
              label="Jabatan"
              placeholder="Contoh: Kepala Dinas / Staf Ahli"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              required
            />

            <Input
              label="Instansi / Organisasi"
              placeholder="Contoh: Dinas PMD Kabupaten Bogor"
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              required
            />

            {/* Kehadiran Switch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  key="hadir-ya"
                  type="button"
                  onClick={() => setApakahHadir('ya')}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-colors ${
                    apakahHadir === 'ya'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Ya, Saya Akan Hadir
                </button>
                <button
                  key="hadir-tidak"
                  type="button"
                  onClick={() => setApakahHadir('tidak')}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-colors ${
                    apakahHadir === 'tidak'
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tidak, Berhalangan
                </button>
              </div>
            </div>

            {/* Attendance Method Selection */}
            {apakahHadir === 'ya' && (
              currentEvent.jenisRapat === 'hybrid' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    Metode Kehadiran
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {showLuringOption && (
                      <button
                        key="method-luring"
                        type="button"
                        onClick={() => setMetodeKehadiran('luring')}
                        className={`py-3 px-4 text-xs font-semibold rounded border transition-colors flex flex-col items-center gap-1 ${
                          metodeKehadiran === 'luring'
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold">Luring (Fisik)</span>
                        <span className={`text-[9px] ${metodeKehadiran === 'luring' ? 'text-slate-300' : 'text-slate-400'}`}>
                          Hadir di lokasi acara
                        </span>
                      </button>
                    )}

                    {showDaringOption && (
                      <button
                        key="method-daring"
                        type="button"
                        onClick={() => setMetodeKehadiran('daring')}
                        className={`py-3 px-4 text-xs font-semibold rounded border transition-colors flex flex-col items-center gap-1 ${
                          metodeKehadiran === 'daring'
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold">Daring (Online)</span>
                        <span className={`text-[9px] ${metodeKehadiran === 'daring' ? 'text-slate-300' : 'text-slate-400'}`}>
                          Hadir via Video Meeting
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // If not hybrid, method is auto-selected, show it as read-only badge/label
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Metode Kehadiran (Otomatis)
                  </span>
                  <span className="text-xs font-bold text-slate-800 capitalize flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                    Kehadiran {currentEvent.jenisRapat}
                  </span>
                </div>
              )
            )}

            <Button type="submit" className="w-full py-2.5 font-bold uppercase tracking-wider" isLoading={isLoading}>
              Kirim Konfirmasi RSVP
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
