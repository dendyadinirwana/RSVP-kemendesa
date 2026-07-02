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
  PlusSquare
} from 'lucide-react';

export const DashboardDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentEvent, guests, fetchEventById, fetchGuests } = useRSVPStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [metodeFilter, setMetodeFilter] = useState<string>('semua');

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
    const rsvpUrl = `${window.location.origin}/rsvp/${currentEvent.id}`;
    
    const text = `Yth. Bapak/Ibu Tamu Undangan,

Berikut kami sampaikan undangan resmi untuk menghadiri kegiatan internal Kementerian Desa PDTT:

Kegiatan: ${currentEvent.namaKegiatan}
Waktu: ${formatDateString(currentEvent.waktuMulai)} s/d Selesai
Lokasi: ${currentEvent.lokasi.tempat}
${currentEvent.lokasi.urlOnline ? `Link Online: ${currentEvent.lokasi.urlOnline}\n` : ''}
Mohon kesediaan Bapak/Ibu untuk melakukan konfirmasi kehadiran melalui tautan resmi RSVP berikut:
${rsvpUrl}

Terima kasih atas perhatian dan kehadirannya.`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handlePrint = () => {
    window.print();
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
        <div className="mb-4 no-print flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Daftar Kegiatan
          </Link>
          <div className="flex gap-2">
            <Link to={`/dashboard/${eventId}/guests`}>
              <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1">
                <PlusSquare className="h-3.5 w-3.5" />
                Kelola Tamu
              </Button>
            </Link>
            <Link to={`/checkin/${eventId}`}>
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1 border-slate-300">
                <UserCheck className="h-3.5 w-3.5" />
                Check-In Tamu
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
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 print:hidden">
          {/* Card 1 */}
          <Card className="flex items-center gap-4 bg-white">
            <div className="p-3 bg-slate-100 rounded text-slate-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Diundang
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {totalInvited}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">Daftar tamu awal</span>
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="flex items-center gap-4 bg-white">
            <div className="p-3 bg-blue-50 text-blue-700 rounded border border-blue-100">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Konfirmasi
              </span>
              <span className="text-2xl font-bold text-blue-600 font-mono">
                {totalConfirmed}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {totalInvited > 0 ? Math.round((totalConfirmed / totalInvited) * 100) : 0}% Tingkat RSVP
              </span>
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="flex items-center gap-4 bg-white">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Telah Check-In (Hadir)
              </span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">
                {totalAttended}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {totalConfirmed > 0 ? Math.round((totalAttended / totalConfirmed) * 100) : 0}% Dari konfirmasi
              </span>
            </div>
          </Card>
        </section>

        {/* Breakdown & Graph Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Method Attendance Breakdown */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded p-6 flex flex-col justify-between print:hidden">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
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
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${totalConfirmed > 0 ? (totalLuring / totalConfirmed) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Daring Stat */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                    <span className="text-slate-600">Tamu Daring (Online)</span>
                    <span className="font-mono text-slate-900">{totalDaring} Tamu</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{
                        width: `${totalConfirmed > 0 ? (totalDaring / totalConfirmed) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              * Hanya menghitung peserta yang telah memberikan konfirmasi RSVP dengan metode Kehadiran Daring atau Luring.
            </div>
          </div>

          {/* Guest Lists & Tables */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded p-6 print:border-none print:p-0">
            {/* Search and Filters (no-print) */}
            <div className="no-print space-y-4 mb-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter & Pencarian Tamu
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  Ditemukan {filteredGuests.length} dari {totalInvited}
                </span>
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
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  >
                    <option value="semua">Semua Metode Kehadiran</option>
                    <option value="luring">Luring (Fisik)</option>
                    <option value="daring">Daring (Online)</option>
                    <option value="belum_konfirmasi">Belum Konfirmasi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guest Table */}
            {filteredGuests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                Tidak ada data tamu undangan yang cocok dengan filter pencarian.
              </div>
            ) : (
              <div>
                <Table
                  headers={
                    // Print layout needs a Signature / Tanda Tangan column
                    window.location.search.includes('print') || true
                      ? ['Nama / Jabatan / Instansi', 'Status', 'Metode', 'Tanda Tangan']
                      : ['Nama', 'Jabatan / Instansi', 'Status', 'Metode', 'Konfirmasi']
                  }
                >
                  {filteredGuests.map((guest, index) => {
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
                        <td className="px-6 py-3.5 print:py-2">
                          <div className="font-semibold text-slate-900">{guest.nama}</div>
                          <div className="text-xs text-slate-500">
                            {guest.jabatan} — {guest.instansi}
                          </div>
                          {/* Print details */}
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

                        {/* Column 4: Signature (Print Layout) or Waktu (Screen Layout) */}
                        <td className="px-6 py-3.5 print:py-2 font-mono text-xs w-40">
                          {/* Screen view: shows confirmation time */}
                          <span className="print:hidden text-slate-500">{formattedTime}</span>

                          {/* Print view: Empty box/line for signature sheet */}
                          <div className="hidden print:block text-slate-800 text-[11px] font-sans">
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
            )}
          </div>
        </section>

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
