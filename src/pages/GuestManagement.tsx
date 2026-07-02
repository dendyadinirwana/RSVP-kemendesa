import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRSVPStore } from '../store/rsvpStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { parseCSVText } from '../utils/csv';
import {
  ArrowLeft,
  Users,
  Upload,
  UserPlus,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const GuestManagement: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const {
    currentEvent,
    guests,
    isLoading,
    fetchEventById,
    fetchGuests,
    addGuest,
    addGuestsBatch
  } = useRSVPStore();

  // Manual input form states
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [instansi, setInstansi] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualSuccess, setManualSuccess] = useState(false);

  // CSV input state
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');

  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
      fetchGuests(eventId);
    }
  }, [eventId, fetchEventById, fetchGuests]);

  const eventGuests = eventId ? guests[eventId] || [] : [];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess(false);

    if (!nama.trim()) {
      setManualError('Nama tamu wajib diisi.');
      return;
    }

    if (!eventId) return;

    try {
      await addGuest(eventId, {
        nama: nama.trim(),
        jabatan: jabatan.trim() || 'Tamu Undangan',
        instansi: instansi.trim() || 'Instansi/Umum',
      });
      setNama('');
      setJabatan('');
      setInstansi('');
      setManualSuccess(true);
      setTimeout(() => setManualSuccess(false), 3000);
      fetchGuests(eventId);
    } catch (err: any) {
      setManualError(err.message || 'Gagal menambahkan tamu.');
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    setCsvError('');

    if (!text.trim()) {
      setCsvPreview([]);
      return;
    }

    const parsed = parseCSVText(text);
    setCsvPreview(parsed);
  };

  const handleCsvImport = async () => {
    setCsvError('');
    setCsvSuccess(false);

    if (csvPreview.length === 0) {
      setCsvError('Tidak ada data tamu valid yang dideteksi.');
      return;
    }

    if (!eventId) return;

    try {
      await addGuestsBatch(eventId, csvPreview);
      setCsvText('');
      setCsvPreview([]);
      setCsvSuccess(true);
      setTimeout(() => setCsvSuccess(false), 3000);
      fetchGuests(eventId);
    } catch (err: any) {
      setCsvError(err.message || 'Gagal mengimpor tamu.');
    }
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-xs text-slate-450 font-mono">MEMUAT HALAMAN KELOLA TAMU...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
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

        {/* Event Header Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 mb-8">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5 font-mono">
            Kegiatan Terpilih
          </span>
          <h1 className="text-lg font-bold text-slate-900 mb-1">{currentEvent.namaKegiatan}</h1>
          <p className="text-xs text-slate-500 font-mono capitalize">
            Jenis Rapat: {currentEvent.jenisRapat} | Lokasi: {currentEvent.lokasi.tempat}
          </p>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Form Side */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-r border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-mono ${
                    activeTab === 'manual'
                      ? 'bg-white text-slate-900 border-b-2 border-b-slate-950'
                      : 'text-slate-550 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Manual
                </button>
                <button
                  onClick={() => setActiveTab('csv')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors font-mono ${
                    activeTab === 'csv'
                      ? 'bg-white text-slate-900 border-b-2 border-b-slate-955'
                      : 'text-slate-550 hover:text-slate-800'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  CSV / Paste
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5">
                {activeTab === 'manual' ? (
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                      Input Tamu Manual
                    </h3>

                    {manualError && (
                      <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded border border-red-100 mb-2">
                        {manualError}
                      </div>
                    )}

                    {manualSuccess && (
                      <div className="bg-emerald-50 text-emerald-700 text-xs p-2.5 rounded border border-emerald-100 mb-2 flex items-center gap-1.5 font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Tamu berhasil didaftarkan!
                      </div>
                    )}

                    <Input
                      label="Nama Tamu"
                      placeholder="Nama Lengkap & Gelar"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />

                    <Input
                      label="Jabatan"
                      placeholder="Contoh: Kepala Dinas PMD"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                    />

                    <Input
                      label="Instansi"
                      placeholder="Contoh: Pemkab Bogor"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                    />

                    <Button type="submit" className="w-full text-xs" isLoading={isLoading}>
                      Tambah Tamu
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Impor Tamu Massal
                    </h3>

                    {csvError && (
                      <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded border border-red-100">
                        {csvError}
                      </div>
                    )}

                    {csvSuccess && (
                      <div className="bg-emerald-50 text-emerald-700 text-xs p-2.5 rounded border border-emerald-100 flex items-center gap-1.5 font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Impor massal berhasil!
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 border border-slate-200 rounded space-y-1">
                      <p className="font-semibold text-slate-600 flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" /> Format Paste (Excel/CSV):
                      </p>
                      <code className="block bg-slate-100 p-1 rounded font-mono text-[9px] text-slate-700 select-all">
                        Nama, Jabatan, Instansi
                      </code>
                      <p>Atau copy langsung kolom tabel dari Ms. Excel / Google Sheets.</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Data CSV / Tabel Excel
                      </label>
                      <textarea
                        value={csvText}
                        onChange={handleCsvChange}
                        placeholder="Contoh:&#10;Budi Santoso, Kepala Dinas, Pemkab Bogor&#10;Siti Aminah, Sekretaris, Pemprov DKI"
                        className="w-full h-40 px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>

                    {csvPreview.length > 0 && (
                      <div className="text-xs">
                        <div className="font-semibold text-slate-600 mb-1">
                          Pratinjau Impor ({csvPreview.length} Tamu)
                        </div>
                        <div className="max-h-24 overflow-y-auto border border-slate-100 rounded text-[10px] divide-y bg-slate-50">
                          {csvPreview.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="p-1 px-2 truncate">
                              <strong>{item.nama}</strong> - {item.jabatan} ({item.instansi})
                            </div>
                          ))}
                          {csvPreview.length > 5 && (
                            <div className="p-1 px-2 text-[9px] text-slate-400 text-center">
                              + {csvPreview.length - 5} tamu lainnya...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleCsvImport}
                      className="w-full text-xs inline-flex items-center gap-1"
                      disabled={csvPreview.length === 0}
                      isLoading={isLoading}
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Impor {csvPreview.length > 0 ? `${csvPreview.length} Tamu` : 'Daftar Tamu'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List/Preview Side */}
          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Users className="h-4 w-4 text-slate-400" />
                  Daftar Tamu Terdaftar ({eventGuests.length})
                </h2>
                <Badge variant="primary">Total Diundang</Badge>
              </div>

              {eventGuests.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  Belum ada tamu yang diundang untuk kegiatan ini.<br />
                  Gunakan form input manual atau impor CSV di sebelah kiri.
                </div>
              ) : (
                <Table headers={['Nama', 'Jabatan', 'Instansi', 'Status']}>
                  {eventGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-semibold text-slate-900">{guest.nama}</td>
                      <td className="px-6 py-3 text-slate-500">{guest.jabatan}</td>
                      <td className="px-6 py-3 text-slate-500">{guest.instansi}</td>
                      <td className="px-6 py-3">
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
                    </tr>
                  ))}
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
