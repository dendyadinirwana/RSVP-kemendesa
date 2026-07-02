import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRSVPStore } from '../store/rsvpStore';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Video,
  Printer,
  Share2,
  Users,
  CheckSquare,
  UserCheck,
  Search,
  SlidersHorizontal,
  PlusSquare,
  GripVertical
} from 'lucide-react';

export const DashboardDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    currentEvent,
    guests,
    fetchEventById,
    fetchGuests,
    updateGuestMethod,
    updateGuestStatusAndMethod
  } = useRSVPStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [metodeFilter, setMetodeFilter] = useState<string>('semua');
  
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);
  const [promptGuest, setPromptGuest] = useState<any>(null);
  const [targetDropStatus, setTargetDropStatus] = useState<any>(null);

  const handleDrop = async (guestId: string, status: 'diundang' | 'dikonfirmasi' | 'hadir' | 'tidak_hadir') => {
    if (!currentEvent) return;
    const guest = eventGuests.find((g) => g.id === guestId);
    if (!guest) return;

    if (status === 'diundang') {
      await updateGuestStatusAndMethod(currentEvent.id, guestId, 'diundang', null);
    } else if (status === 'tidak_hadir') {
      await updateGuestStatusAndMethod(currentEvent.id, guestId, 'tidak_hadir', null);
    } else if (status === 'dikonfirmasi' || status === 'hadir') {
      if (currentEvent.jenisRapat === 'hybrid' && !guest.metodeKehadiran) {
        setPromptGuest(guest);
        setTargetDropStatus(status);
      } else {
        const defaultMethod = guest.metodeKehadiran || (currentEvent.jenisRapat === 'daring' ? 'daring' : 'luring');
        await updateGuestStatusAndMethod(currentEvent.id, guestId, status, defaultMethod);
      }
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchGuests(eventId);
    }
  }, [eventId, fetchEventById, fetchGuests]);

  const eventGuests = eventId ? guests[eventId] || [] : [];

  // Filtered and Searched guests
  const filteredGuests = eventGuests.filter((g) => {
    const matchesSearch =
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.instansi.toLowerCase().includes(search.toLowerCase()) ||
      g.jabatan.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'semua' || g.statusUndangan === statusFilter;

    const matchesMetode =
      metodeFilter === 'semua' ||
      (metodeFilter === 'belum_konfirmasi' && g.metodeKehadiran === null) ||
      g.metodeKehadiran === metodeFilter;

    return matchesSearch && matchesStatus && matchesMetode;
  });

  // Calculate metrics
  const totalInvited = eventGuests.length;
  const totalConfirmed = eventGuests.filter((g) => g.statusUndangan !== 'diundang').length;
  const totalAttended = eventGuests.filter((g) => g.statusUndangan === 'hadir').length;
  
  const totalLuring = eventGuests.filter((g) => g.metodeKehadiran === 'luring').length;
  const totalDaring = eventGuests.filter((g) => g.metodeKehadiran === 'daring').length;

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

  const getWhatsAppShareLink = () => {
    if (!currentEvent) return '#';

    // Grouping helper
    interface GroupedInstansi {
      instansi: string;
      guests: { nama: string; jabatan: string }[];
    }

    const groupGuestsByInstansi = (list: typeof eventGuests): GroupedInstansi[] => {
      const groups: Record<string, typeof eventGuests> = {};
      list.forEach((g) => {
        const key = g.instansi.trim();
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(g);
      });

      return Object.keys(groups)
        .sort()
        .map((instansi) => ({
          instansi,
          guests: groups[instansi].map((g) => ({
            nama: g.nama,
            jabatan: g.jabatan,
          })),
        }));
    };

    const total = eventGuests.length;
    const luringList = eventGuests.filter(
      (g) =>
        g.metodeKehadiran === 'luring' &&
        (g.statusUndangan === 'dikonfirmasi' || g.statusUndangan === 'hadir')
    );
    const daringList = eventGuests.filter(
      (g) =>
        g.metodeKehadiran === 'daring' &&
        (g.statusUndangan === 'dikonfirmasi' || g.statusUndangan === 'hadir')
    );
    const tidakHadirList = eventGuests.filter((g) => g.statusUndangan === 'tidak_hadir');
    const waitingList = eventGuests.filter((g) => g.statusUndangan === 'diundang');

    const confirmedCount = luringList.length + daringList.length;
    const waitingCount = waitingList.length;
    const tidakHadirCount = tidakHadirList.length;

    const confirmedPercent = total > 0 ? ((confirmedCount / total) * 100).toFixed(1) : '0.0';
    const luringPercent = total > 0 ? ((luringList.length / total) * 100).toFixed(1) : '0.0';
    const daringPercent = total > 0 ? ((daringList.length / total) * 100).toFixed(1) : '0.0';
    const tidakHadirPercent = total > 0 ? ((tidakHadirCount / total) * 100).toFixed(1) : '0.0';
    const waitingPercent = total > 0 ? ((waitingCount / total) * 100).toFixed(1) : '0.0';

    // Format current date and time
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const yearNum = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const updateTimeStr = `${dayName}, ${dateNum} ${monthName} ${yearNum} | Jam ${hours}.${minutes} WIB`;

    let text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*✅ Konfirmasi Kehadiran*
*${currentEvent.namaKegiatan}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Update: ${updateTimeStr}

Total Anggota PAK: ${total} Orang
Konfirmasi Hadir: ${confirmedCount} Orang (${confirmedPercent}%)
  • Hadir Luring: ${luringList.length} Orang (${luringPercent}%)
  • Hadir Daring: ${daringList.length} Orang (${daringPercent}%)
Tidak Hadir: ${tidakHadirCount} Orang (${tidakHadirPercent}%)
Menunggu Konfirmasi: ${waitingCount} Orang (${waitingPercent}%)\n\n`;

    // A. HADIR LURING
    text += `━━━ A. HADIR LURING (${luringList.length} Orang) ━━━\n\n`;
    if (luringList.length === 0) {
      text += `(Belum ada data)\n\n`;
    } else {
      const groupedLuring = groupGuestsByInstansi(luringList);
      groupedLuring.forEach((group, idx) => {
        text += `${idx + 1}. ${group.instansi}\n`;
        group.guests.forEach((g) => {
          text += `   • ${g.nama}\n     _${g.jabatan}_\n`;
        });
        text += '\n';
      });
    }

    // B. HADIR DARING
    text += `━━━ B. HADIR DARING (${daringList.length} Orang) ━━━\n\n`;
    if (daringList.length === 0) {
      text += `(Belum ada data)\n\n`;
    } else {
      const groupedDaring = groupGuestsByInstansi(daringList);
      groupedDaring.forEach((group, idx) => {
        text += `${idx + 1}. ${group.instansi}\n`;
        group.guests.forEach((g) => {
          text += `   • ${g.nama}\n     _${g.jabatan}_\n`;
        });
        text += '\n';
      });
    }

    // C. TIDAK HADIR
    text += `━━━ C. TIDAK HADIR (${tidakHadirList.length} Orang) ━━━\n\n`;
    if (tidakHadirList.length === 0) {
      text += `(Belum ada data)\n\n`;
    } else {
      const groupedTidakHadir = groupGuestsByInstansi(tidakHadirList);
      groupedTidakHadir.forEach((group, idx) => {
        text += `${idx + 1}. ${group.instansi}\n`;
        group.guests.forEach((g) => {
          text += `   • ${g.nama}\n     _${g.jabatan}_\n`;
        });
        text += '\n';
      });
    }

    // Remove trailing newlines
    text = text.trim();

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const renderKanbanColumn = (
    colStatus: 'diundang' | 'dikonfirmasi' | 'hadir' | 'tidak_hadir',
    colTitle: string
  ) => {
    const colGuests = filteredGuests.filter((g) => g.statusUndangan === colStatus);
    const isOver = draggedOverCol === colStatus;

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDraggedOverCol(colStatus)}
        onDragLeave={() => setDraggedOverCol(null)}
        onDrop={(e) => {
          const id = e.dataTransfer.getData('guestId');
          handleDrop(id, colStatus);
          setDraggedOverCol(null);
        }}
        className={`flex flex-col rounded-lg border p-3 min-h-[450px] transition-all duration-200 ${
          isOver
            ? 'bg-slate-100/70 border-slate-400 border-dashed scale-[1.01] shadow-xs'
            : 'bg-slate-50/40 border-slate-200/80'
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            {colTitle}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white border border-slate-200/80 text-slate-500">
            {colGuests.length}
          </span>
        </div>

        {/* Column Body Cards */}
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[500px] flex-1">
          {colGuests.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[9px] text-slate-450 font-mono py-10 border border-dashed border-slate-200 rounded-lg">
              DRAG TAMU KE SINI
            </div>
          ) : (
            colGuests.map((g) => (
              <div
                key={g.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('guestId', g.id)}
                className="bg-white border border-slate-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-slate-350 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="font-semibold text-xs text-slate-900 leading-tight">
                      {g.nama}
                    </div>
                    <GripVertical className="h-3.5 w-3.5 text-slate-300 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-1">
                    {g.jabatan} — {g.instansi}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px]">
                  <span className="font-mono text-slate-400 uppercase">
                    {g.metodeKehadiran ? (
                      <Badge
                        variant={g.metodeKehadiran === 'luring' ? 'purple' : 'cyan'}
                        className="text-[9px] px-1 py-0 scale-90 origin-left"
                      >
                        {g.metodeKehadiran}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </span>
                  {g.waktuCheckIn && (
                    <span className="text-slate-400 font-mono">
                      {new Date(g.waktuCheckIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-sm text-slate-500 font-mono">MEMUAT DATA DASHBOARD...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Printable Area Wrapper */}
      <div className="max-w-6xl mx-auto print-container">
        
        {/* Navigation Breadcrumb (no-print) */}
        <div className="mb-4 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali
          </Link>
          <div className="flex gap-2">
            <Link to={`/dashboard/${eventId}/guests`} className="flex-1 sm:flex-initial">
              <Button variant="secondary" size="sm" className="w-full text-xs flex items-center justify-center gap-1">
                <PlusSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kelola</span> Tamu
              </Button>
            </Link>
            <Link to={`/checkin/${eventId}`} className="flex-1 sm:flex-initial">
              <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center gap-1 border-slate-300">
                <UserCheck className="h-3.5 w-3.5" />
                Check-In
              </Button>
            </Link>
          </div>
        </div>

        {/* Event Header Detail */}
        <header className="bg-white border border-slate-200 rounded p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:border-none print:p-0 print:mb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 print:hidden">
              <Badge
                variant={
                  currentEvent.jenisRapat === 'hybrid'
                    ? 'purple'
                    : currentEvent.jenisRapat === 'daring'
                    ? 'cyan'
                    : 'warning'
                }
              >
                Rapat {currentEvent.jenisRapat}
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              {currentEvent.namaKegiatan}
            </h1>
            <div className="space-y-1 text-xs text-slate-500 font-sans">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                <span>{formatDateString(currentEvent.waktuMulai)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                <span>{currentEvent.lokasi.tempat}</span>
              </div>
              {currentEvent.lokasi.urlOnline && (
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span className="text-blue-600 font-mono text-[11px] select-all truncate">
                    {currentEvent.lokasi.urlOnline}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (no-print) */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto no-print">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 border-slate-300"
            >
              <Printer className="h-4 w-4" />
              Cetak Hadir
            </Button>
            <a
              href={getWhatsAppShareLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full inline-flex items-center justify-center gap-1.5"
              >
                <Share2 className="h-4 w-4" />
                Share WA
              </Button>
            </a>
          </div>
        </header>

        {/* Print Only Header (Header formal kop surat) */}
        <div className="hidden print:block mb-8 text-center border-b-2 border-slate-900 pb-4">
          <div className="text-sm font-bold uppercase tracking-wider mb-1">
            KEMENTERIAN DESA, PEMBANGUNAN DAERAH TERTINGGAL, DAN TRANSMIGRASI
          </div>
          <div className="text-xs uppercase tracking-wide mb-3 text-slate-700">
            DAFTAR HADIR PESERTA KEGIATAN
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-tight mb-2">
            {currentEvent.namaKegiatan}
          </h2>
          <div className="text-xs space-y-1 text-slate-600">
            <p>Hari/Tanggal: {formatDateString(currentEvent.waktuMulai)}</p>
            <p>Tempat: {currentEvent.lokasi.tempat}</p>
            <p>Metode Rapat: {currentEvent.jenisRapat.toUpperCase()}</p>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <section className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 print:hidden">
          {/* Card 1 */}
          <Card className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-slate-100 rounded text-slate-700">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Diundang
              </span>
              <span className="text-lg sm:text-2xl font-bold text-slate-900 font-mono">
                {totalInvited}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:block mt-0.5">Daftar tamu awal</span>
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-50 text-blue-700 rounded border border-blue-100">
              <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Konfirmasi
              </span>
              <span className="text-lg sm:text-2xl font-bold text-blue-600 font-mono">
                {totalConfirmed}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:block mt-0.5">
                {totalInvited > 0 ? Math.round((totalConfirmed / totalInvited) * 100) : 0}% Tingkat RSVP
              </span>
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Check-In
              </span>
              <span className="text-lg sm:text-2xl font-bold text-emerald-600 font-mono">
                {totalAttended}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:block mt-0.5">
                {totalConfirmed > 0 ? Math.round((totalAttended / totalConfirmed) * 100) : 0}% Dari konfirmasi
              </span>
            </div>
          </Card>
        </section>

        {/* Breakdown & Graph Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Method Attendance Breakdown */}
          {/* Method Attendance Breakdown */}
          <Card className="lg:col-span-1 flex flex-col justify-between print:hidden">
            <div>
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 font-mono">
                Metode Kehadiran (RSVP)
              </h2>
              
              <div className="space-y-4">
                {/* Luring Stat */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                    <span className="text-slate-600">Tamu Luring (Fisik)</span>
                    <span className="font-mono text-slate-900">{totalLuring} Tamu</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-650 h-2 rounded-full"
                      style={{
                        width: `${totalConfirmed > 0 ? (totalLuring / totalConfirmed) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Daring Stat */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                    <span className="text-slate-650">Tamu Daring (Online)</span>
                    <span className="font-mono text-slate-900">{totalDaring} Tamu</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-550 h-2 rounded-full"
                      style={{
                        width: `${totalConfirmed > 0 ? (totalDaring / totalConfirmed) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-sans">
              * Hanya menghitung peserta yang telah memberikan konfirmasi RSVP dengan metode Kehadiran Daring atau Luring.
            </div>
          </Card>

          {/* Guest Lists & Tables */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-xs p-4 sm:p-6 print:border-none print:p-0">
            {/* Search and Filters (no-print) */}
            <div className="no-print space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Daftar Tamu Undangan
                </h2>
                
                <div className="flex items-center gap-3">
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[10px] uppercase font-mono">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 font-bold rounded-[6px] transition-colors ${
                        viewMode === 'table'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Tabel
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('kanban')}
                      className={`px-3 py-1 font-bold rounded-[6px] transition-colors ${
                        viewMode === 'kanban'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Kanban
                    </button>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Ditemukan {filteredGuests.length} dari {totalInvited}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari Nama / Instansi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                  >
                    <option value="semua">Semua Status Undangan</option>
                    <option value="diundang">Diundang (Belum Konfirmasi)</option>
                    <option value="dikonfirmasi">Dikonfirmasi</option>
                    <option value="hadir">Hadir (Checked-In)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <select
                    value={metodeFilter}
                    onChange={(e) => setMetodeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                  >
                    <option value="semua">Semua Metode Kehadiran</option>
                    <option value="luring">Luring (Fisik)</option>
                    <option value="daring">Daring (Online)</option>
                    <option value="belum_konfirmasi">Belum Konfirmasi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guest Table/Kanban Container */}
            {filteredGuests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                Tidak ada data tamu undangan yang cocok dengan filter pencarian.
              </div>
            ) : (
              <div>
                {/* Screen View: Table or Kanban */}
                <div className="print:hidden">
                  {viewMode === 'table' ? (
                    <Table
                      headers={
                        ['Nama', 'Jabatan / Instansi', 'Status', 'Metode', 'Konfirmasi']
                      }
                    >
                      {filteredGuests.map((guest) => {
                        const formattedTime = guest.waktuKonfirmasi
                          ? new Date(guest.waktuKonfirmasi).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-';

                        return (
                          <tr key={guest.id} className="hover:bg-slate-50/30">
                            {/* Column 1: Details */}
                            <td className="px-6 py-3.5">
                              <div className="font-semibold text-slate-900">{guest.nama}</div>
                              <div className="text-xs text-slate-500">
                                {guest.jabatan} — {guest.instansi}
                              </div>
                            </td>

                            {/* Column 2: Status */}
                            <td className="px-6 py-3.5 capitalize font-mono text-xs">
                              <Badge
                                variant={
                                  guest.statusUndangan === 'hadir'
                                    ? 'success'
                                    : guest.statusUndangan === 'dikonfirmasi'
                                    ? 'info'
                                    : 'neutral'
                                }
                              >
                                {guest.statusUndangan}
                              </Badge>
                            </td>

                            {/* Column 3: Metode */}
                            <td className="px-6 py-3.5 capitalize font-mono text-xs">
                              {currentEvent.jenisRapat === 'hybrid' ? (
                                <select
                                  value={guest.metodeKehadiran || ''}
                                  onChange={(e) => {
                                    const val = e.target.value ? (e.target.value as 'daring' | 'luring') : null;
                                    updateGuestMethod(currentEvent.id, guest.id, val);
                                  }}
                                  className={`bg-slate-50 border border-slate-200 text-[11px] font-mono font-semibold rounded px-2 py-0.5 uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer ${
                                    guest.metodeKehadiran === 'luring'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : guest.metodeKehadiran === 'daring'
                                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                      : 'bg-slate-50 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <option value="">-</option>
                                  <option value="luring">Luring</option>
                                  <option value="daring">Daring</option>
                                </select>
                              ) : (
                                <>
                                  {guest.metodeKehadiran ? (
                                    <Badge variant={guest.metodeKehadiran === 'luring' ? 'purple' : 'cyan'}>
                                      {guest.metodeKehadiran}
                                    </Badge>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </>
                              )}
                            </td>

                            {/* Column 4: Konfirmasi */}
                            <td className="px-6 py-3.5 font-mono text-xs w-40 text-slate-500">
                              {formattedTime}
                            </td>
                          </tr>
                        );
                      })}
                    </Table>
                  ) : (
                    /* Kanban Columns — horizontally scrollable on mobile */
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
                      <div className="grid grid-cols-4 gap-4 mt-2 min-w-[800px] md:min-w-0">
                        {renderKanbanColumn('diundang', 'Menunggu')}
                        {renderKanbanColumn('dikonfirmasi', 'Dikonfirmasi')}
                        {renderKanbanColumn('hadir', 'Hadir')}
                        {renderKanbanColumn('tidak_hadir', 'Tidak Hadir')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Print View: Always Table with Tanda Tangan */}
                <div className="hidden print:block">
                  <Table
                    headers={
                      ['Nama / Jabatan / Instansi', 'Status', 'Metode', 'Tanda Tangan']
                    }
                  >
                    {filteredGuests.map((guest, index) => {
                      return (
                        <tr key={guest.id} className="hover:bg-slate-50/30">
                          {/* Column 1: Details */}
                          <td className="px-6 py-3.5 print:py-2">
                            <div className="font-semibold text-slate-900">{guest.nama}</div>
                            <div className="text-xs text-slate-500">
                              {guest.jabatan} — {guest.instansi}
                            </div>
                            <div className="hidden print:block text-[10px] text-slate-400 font-mono mt-0.5">
                              {guest.waktuCheckIn
                                ? `Check-in: ${new Date(guest.waktuCheckIn).toLocaleTimeString('id-ID')}`
                                : ''}
                            </div>
                          </td>

                          {/* Column 2: Status */}
                          <td className="px-6 py-3.5 print:py-2 capitalize font-mono text-xs">
                            <Badge
                              variant={
                                guest.statusUndangan === 'hadir'
                                  ? 'success'
                                  : guest.statusUndangan === 'dikonfirmasi'
                                  ? 'info'
                                  : 'neutral'
                              }
                            >
                              {guest.statusUndangan}
                            </Badge>
                          </td>

                          {/* Column 3: Metode */}
                          <td className="px-6 py-3.5 print:py-2 capitalize font-mono text-xs">
                            {guest.metodeKehadiran ? (
                              <Badge variant={guest.metodeKehadiran === 'luring' ? 'purple' : 'cyan'}>
                                {guest.metodeKehadiran}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Column 4: Signature */}
                          <td className="px-6 py-3.5 print:py-2 font-mono text-xs w-40">
                            <div className="text-slate-800 text-[11px] font-sans">
                              {guest.metodeKehadiran === 'daring' ? (
                                <span className="text-[10px] uppercase font-semibold text-slate-400 font-mono">
                                  [DARING ONLINE]
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-300 font-mono mr-2">{index + 1}.</span>
                                  <div className="border-b border-slate-300 w-24 h-5"></div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </Table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Method Selector Modal when Dragging to Confirmed/Attended on Hybrid Event */}
        {promptGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs no-print">
            <div className="bg-white border border-slate-200 rounded max-w-sm w-full p-6 shadow-xs relative">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
                PILIH METODE KEHADIRAN
              </h2>
              <h3 className="text-sm font-bold text-slate-900 mb-2 leading-tight">
                {promptGuest.nama}
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Silakan pilih metode kehadiran untuk tamu ini karena rapat bersifat hybrid.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  onClick={async () => {
                    await updateGuestStatusAndMethod(currentEvent.id, promptGuest.id, targetDropStatus, 'luring');
                    setPromptGuest(null);
                    setTargetDropStatus(null);
                  }}
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-xs py-2.5 font-bold uppercase tracking-wider"
                >
                  Luring (Fisik)
                </Button>
                <Button
                  onClick={async () => {
                    await updateGuestStatusAndMethod(currentEvent.id, promptGuest.id, targetDropStatus, 'daring');
                    setPromptGuest(null);
                    setTargetDropStatus(null);
                  }}
                  variant="primary"
                  className="bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-xs py-2.5 font-bold uppercase tracking-wider"
                >
                  Daring (Online)
                </Button>
              </div>

              <Button
                onClick={() => {
                  setPromptGuest(null);
                  setTargetDropStatus(null);
                }}
                variant="secondary"
                className="w-full text-xs py-2"
              >
                Batal
              </Button>
            </div>
          </div>
        )}

        {/* Print Signature Block (Dua Kolom Mengetahui) */}
        <div className="hidden print:grid grid-cols-2 gap-20 mt-12 text-center text-xs">
          <div>
            <p className="mb-16">Mengetahui,<br />Ketua Panitia Pelaksana</p>
            <p className="font-bold underline">___________________________</p>
            <p className="text-slate-500 mt-1">NIP. ........................................</p>
          </div>
          <div>
            <p className="mb-16">Petugas Registrasi / Check-In</p>
            <p className="font-bold underline">___________________________</p>
            <p className="text-slate-500 mt-1">NIP. ........................................</p>
          </div>
        </div>

      </div>
    </div>
  );
};
