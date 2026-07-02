import React, { useEffect, useState } from 'react';
import { useRSVPStore } from '../store/rsvpStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  MapPin,
  Video,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Copy,
  Check,
  Globe
} from 'lucide-react';

export const DashboardList: React.FC = () => {
  const { events, guests, isLoading, fetchEvents, fetchGuests, createEvent } = useRSVPStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [jenisRapat, setJenisRapat] = useState<'daring' | 'luring' | 'hybrid'>('luring');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [tempat, setTempat] = useState('');
  const [urlOnline, setUrlOnline] = useState('');
  const [formError, setFormError] = useState('');

  // Generated info after creating
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch guests for each event to calculate status counts
  useEffect(() => {
    if (events.length > 0) {
      events.forEach((evt) => {
        if (!guests[evt.id]) {
          fetchGuests(evt.id);
        }
      });
    }
  }, [events, fetchGuests, guests]);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/rsvp/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaKegiatan || !waktuMulai || !waktuSelesai || !tempat) {
      setFormError('Semua field wajib diisi (kecuali URL online untuk rapat luring).');
      return;
    }

    if (new Date(waktuMulai) >= new Date(waktuSelesai)) {
      setFormError('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    if ((jenisRapat === 'daring' || jenisRapat === 'hybrid') && !urlOnline) {
      setFormError('URL meeting online wajib diisi untuk jenis rapat daring/hybrid.');
      return;
    }

    try {
      const result = await createEvent({
        namaKegiatan,
        waktuMulai: new Date(waktuMulai).toISOString(),
        waktuSelesai: new Date(waktuSelesai).toISOString(),
        jenisRapat,
        lokasi: {
          tempat,
          urlOnline: (jenisRapat === 'daring' || jenisRapat === 'hybrid') ? urlOnline : undefined,
        },
      });

      setCreatedEvent(result);
      // Reset form
      setNamaKegiatan('');
      setJenisRapat('luring');
      setWaktuMulai('');
      setWaktuSelesai('');
      setTempat('');
      setUrlOnline('');
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat kegiatan.');
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-6 w-6 text-slate-800" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans uppercase">
                RSVP & Presensi
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Sistem RSVP dan presensi kegiatan internal Kementerian Desa PDTT.
            </p>
          </div>
          <Button
            onClick={() => {
              setCreatedEvent(null);
              setIsModalOpen(true);
            }}
            className="sm:w-auto w-full inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Kegiatan Baru
          </Button>
        </header>

        {/* Loading State */}
        {isLoading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-sm text-slate-500 font-mono">MEMUAT DAFTAR KEGIATAN...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && events.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded p-6">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Belum Ada Kegiatan</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Mulai dengan membuat kegiatan baru untuk mengelola RSVP tamu undangan Anda.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              Buat Kegiatan Pertama
            </Button>
          </div>
        )}

        {/* Event List */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => {
              const eventGuests = guests[evt.id] || [];
              const totalInvited = eventGuests.length;
              const totalConfirmed = eventGuests.filter((g) => g.statusUndangan !== 'diundang').length;
              const totalAttended = eventGuests.filter((g) => g.statusUndangan === 'hadir').length;

              return (
                <Card key={evt.id} className="flex flex-col justify-between hover:border-slate-300">
                  <div>
                    {/* Header Event Card */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {evt.namaKegiatan}
                      </h2>
                      <Badge
                        variant={
                          evt.jenisRapat === 'hybrid'
                            ? 'purple'
                            : evt.jenisRapat === 'daring'
                            ? 'cyan'
                            : 'warning'
                        }
                      >
                        {evt.jenisRapat}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-slate-500 mb-6 font-sans">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span>{formatDateString(evt.waktuMulai)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{evt.lokasi.tempat}</span>
                      </div>
                      {evt.lokasi.urlOnline && (
                        <div className="flex items-center gap-2">
                          <Video className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          <span className="truncate text-blue-600 font-mono text-[11px] underline">
                            {evt.lokasi.urlOnline}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded mb-6 border border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono">Diundang</div>
                        <div className="text-lg font-bold text-slate-700 font-mono mt-0.5">{totalInvited}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono">Konfirmasi</div>
                        <div className="text-lg font-bold text-blue-600 font-mono mt-0.5">{totalConfirmed}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400 font-mono">Hadir</div>
                        <div className="text-lg font-bold text-emerald-600 font-mono mt-0.5">{totalAttended}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link to={`/dashboard/${evt.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs py-2">
                          Dashboard
                        </Button>
                      </Link>
                      <Link to={`/checkin/${evt.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs py-2">
                          Check-In Hari-H
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Link to={`/rsvp/${evt.id}`} target="_blank" className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full text-xs py-2 inline-flex items-center gap-1">
                          Form RSVP Tamu
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleCopyLink(evt.id)}
                        className="p-2 border border-slate-200 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="Salin Link RSVP"
                      >
                        {copiedId === evt.id ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal Form Buat Event Baru */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white border border-slate-200 rounded max-w-lg w-full p-6 shadow-xs relative max-h-[90vh] overflow-y-auto">
              {!createdEvent ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                    Buat Kegiatan Baru
                  </h2>

                  {formError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-100 mb-4 font-medium">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <Input
                      label="Nama Kegiatan"
                      placeholder="Contoh: Rapat Koordinasi Wilayah perbatasan..."
                      value={namaKegiatan}
                      onChange={(e) => setNamaKegiatan(e.target.value)}
                      required
                    />

                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Jenis Rapat
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['luring', 'daring', 'hybrid'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setJenisRapat(type);
                              setFormError('');
                            }}
                            className={`py-2 px-3 text-xs font-semibold rounded border transition-colors capitalize ${
                              jenisRapat === type
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Waktu Mulai"
                        type="datetime-local"
                        value={waktuMulai}
                        onChange={(e) => setWaktuMulai(e.target.value)}
                        required
                      />
                      <Input
                        label="Waktu Selesai"
                        type="datetime-local"
                        value={waktuSelesai}
                        onChange={(e) => setWaktuSelesai(e.target.value)}
                        required
                      />
                    </div>

                    <Input
                      label={jenisRapat === 'daring' ? 'Platform Utama (Tempat)' : 'Lokasi Fisik / Tempat'}
                      placeholder={jenisRapat === 'daring' ? 'Contoh: Aplikasi Zoom Meeting' : 'Contoh: Aula Serbaguna Lantai 1'}
                      value={tempat}
                      onChange={(e) => setTempat(e.target.value)}
                      required
                    />

                    {(jenisRapat === 'daring' || jenisRapat === 'hybrid') && (
                      <Input
                        label="URL Online Meeting"
                        placeholder="Contoh: https://zoom.us/j/1234567890..."
                        value={urlOnline}
                        onChange={(e) => setUrlOnline(e.target.value)}
                        required
                      />
                    )}

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit" isLoading={isLoading}>
                        Simpan Kegiatan
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Kegiatan Berhasil Dibuat</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Kegiatan "{createdEvent.namaKegiatan}" telah terdaftar. Silakan bagikan link RSVP di bawah ini kepada calon tamu undangan.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6 text-left">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Link Form RSVP Publik
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/rsvp/${createdEvent.id}`}
                        className="bg-white border border-slate-200 text-xs font-mono px-3 py-2 rounded flex-1 focus:outline-none"
                      />
                      <Button
                        onClick={() => handleCopyLink(createdEvent.id)}
                        variant="primary"
                        size="sm"
                      >
                        {copiedId === createdEvent.id ? 'Tersalin' : 'Salin'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to={`/dashboard/${createdEvent.id}/guests`} className="flex-1">
                      <Button variant="outline" className="w-full text-xs">
                        Kelola/Upload Tamu
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 text-xs"
                    >
                      Selesai
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
