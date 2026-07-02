import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRSVPStore } from '../store/rsvpStore';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  UserCheck,
  Search,
  CheckCircle,
  Clock
} from 'lucide-react';

export const CheckIn: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    currentEvent,
    guests,
    fetchEventById,
    fetchGuests,
    checkInGuest
  } = useRSVPStore();

  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchGuests(eventId);
    }
  }, [eventId, fetchEventById, fetchGuests]);

  const eventGuests = eventId ? guests[eventId] || [] : [];

  // Filter only guests by search input (Name/Instansi/Jabatan)
  const filteredGuests = eventGuests.filter((g) => {
    return (
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.instansi.toLowerCase().includes(search.toLowerCase()) ||
      g.jabatan.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCheckIn = async (guestId: string, name: string, metodeOverride?: 'daring' | 'luring') => {
    if (!eventId) return;
    try {
      await checkInGuest(eventId, guestId, metodeOverride);
      setSuccessMsg(`Berhasil check-in: ${name}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchGuests(eventId);
    } catch (err: any) {
      alert(err.message || 'Gagal menandai kehadiran.');
    }
  };

  const formatTime = (isoStr?: string) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-xs text-slate-450 font-mono">MEMUAT HALAMAN CHECK-IN...</p>
      </div>
    );
  }

  // Calculate check-in summary
  const totalGuests = eventGuests.length;
  const totalCheckedIn = eventGuests.filter((g) => g.statusUndangan === 'hadir').length;
  const pendingCheckIn = totalGuests - totalCheckedIn;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            to={`/dashboard/${eventId}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest font-mono"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Dashboard Kegiatan
          </Link>
        </div>

        {/* Header Event Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
              <UserCheck className="h-4 w-4" />
              <span className="text-[9px] font-semibold uppercase tracking-widest font-mono">
                Registrasi & Presensi Hari-H
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{currentEvent.namaKegiatan}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Tempat: {currentEvent.lokasi.tempat} | Rapat: <span className="capitalize">{currentEvent.jenisRapat}</span>
            </p>
          </div>

          {/* Mini Dashboard Tracker */}
          <div className="flex gap-4 bg-slate-50/40 border border-slate-200/60 p-3 rounded-lg text-center">
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Diundang</span>
              <span className="text-base font-bold text-slate-700 font-mono">{totalGuests}</span>
            </div>
            <div className="border-r border-slate-200 h-8 self-center"></div>
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Hadir</span>
              <span className="text-base font-bold text-emerald-600 font-mono">{totalCheckedIn}</span>
            </div>
            <div className="border-r border-slate-200 h-8 self-center"></div>
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Sisa</span>
              <span className="text-base font-bold text-amber-600 font-mono">{pendingCheckIn}</span>
            </div>
          </div>
        </div>

        {/* Central UI */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Pencarian & Registrasi Cepat
            </h2>
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded flex items-center gap-1 font-semibold animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" />
                {successMsg}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Ketik Nama Tamu, Instansi, atau Jabatan untuk mencari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
            />
          </div>

          {/* Guest Checklist */}
          {filteredGuests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              {search ? 'Tamu tidak ditemukan. Cek kembali ejaan nama atau instansinya.' : 'Belum ada tamu terdaftar. Silakan upload terlebih dahulu di panel kelola tamu.'}
            </div>
          ) : (
            <>
              {/* Desktop: Table View */}
              <div className="hidden md:block">
                <Table headers={['Nama Tamu & Detail', 'Metode RSVP', 'Status Presensi', 'Aksi Registrasi']}>
                  {filteredGuests.map((guest) => {
                    const isHadir = guest.statusUndangan === 'hadir';

                    return (
                      <tr key={guest.id} className={`hover:bg-slate-50/20 ${isHadir ? 'bg-emerald-50/10' : ''}`}>
                        {/* Name and title */}
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-950">{guest.nama}</div>
                          <div className="text-xs text-slate-500">
                            {guest.jabatan} — {guest.instansi}
                          </div>
                        </td>

                        {/* RSVP details */}
                        <td className="px-6 py-3.5">
                          {guest.metodeKehadiran ? (
                            <Badge variant={guest.metodeKehadiran === 'luring' ? 'purple' : 'cyan'}>
                              {guest.metodeKehadiran}
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum Konfirmasi</span>
                          )}
                        </td>

                        {/* Presensi / CheckIn Status */}
                        <td className="px-6 py-3.5">
                          {isHadir ? (
                            <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                              <CheckCircle className="h-4 w-4" />
                              <span>Hadir</span>
                              <span className="text-[10px] font-mono text-slate-400 font-normal">
                                ({formatTime(guest.waktuCheckIn)})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock className="h-4 w-4" />
                              <span>Belum Hadir</span>
                            </div>
                          )}
                        </td>

                        {/* Action button */}
                        <td className="px-6 py-3.5">
                          {isHadir ? (
                            <Button variant="secondary" size="sm" disabled className="text-xs">
                              Sudah Registrasi
                            </Button>
                          ) : currentEvent.jenisRapat === 'hybrid' ? (
                            <div className="flex gap-1.5">
                              <Button
                                onClick={() => handleCheckIn(guest.id, guest.nama, 'luring')}
                                variant="primary"
                                size="sm"
                                className="text-xs bg-purple-600 hover:bg-purple-700 text-white border-purple-600 focus-visible:outline-purple-600"
                              >
                                Hadir Luring
                              </Button>
                              <Button
                                onClick={() => handleCheckIn(guest.id, guest.nama, 'daring')}
                                variant="primary"
                                size="sm"
                                className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600 focus-visible:outline-cyan-600"
                              >
                                Hadir Daring
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleCheckIn(guest.id, guest.nama)}
                              variant="primary"
                              size="sm"
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-emerald-600"
                            >
                              Tandai Hadir
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Table>
              </div>

              {/* Mobile: Card View */}
              <div className="md:hidden space-y-3">
                {filteredGuests.map((guest) => {
                  const isHadir = guest.statusUndangan === 'hadir';

                  return (
                    <div
                      key={guest.id}
                      className={`border rounded p-4 transition-colors ${
                        isHadir
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Guest Info */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-slate-900 leading-tight">
                            {guest.nama}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {guest.jabatan}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {guest.instansi}
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {guest.metodeKehadiran && (
                            <Badge
                              variant={guest.metodeKehadiran === 'luring' ? 'purple' : 'cyan'}
                              className="text-[9px]"
                            >
                              {guest.metodeKehadiran}
                            </Badge>
                          )}
                          {isHadir ? (
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
                              <CheckCircle className="h-3 w-3" />
                              Hadir {formatTime(guest.waktuCheckIn)}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                              <Clock className="h-3 w-3" />
                              Belum Hadir
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!isHadir && (
                        <div className="border-t border-slate-100 pt-3">
                          {currentEvent.jenisRapat === 'hybrid' ? (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleCheckIn(guest.id, guest.nama, 'luring')}
                                variant="primary"
                                size="sm"
                                className="w-full text-xs py-2.5 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                              >
                                Hadir Luring
                              </Button>
                              <Button
                                onClick={() => handleCheckIn(guest.id, guest.nama, 'daring')}
                                variant="primary"
                                size="sm"
                                className="w-full text-xs py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600"
                              >
                                Hadir Daring
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleCheckIn(guest.id, guest.nama)}
                              variant="primary"
                              size="sm"
                              className="w-full text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Tandai Hadir
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
