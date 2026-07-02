export interface Event {
  id: string;
  namaKegiatan: string;
  waktuMulai: string; // ISO string
  waktuSelesai: string; // ISO string
  jenisRapat: 'daring' | 'luring' | 'hybrid';
  lokasi: {
    tempat: string;
    urlOnline?: string;
  };
  createdAt: string; // ISO string
}

export interface Guest {
  id: string;
  eventId: string;
  nama: string;
  jabatan: string;
  instansi: string;
  statusUndangan: 'diundang' | 'dikonfirmasi' | 'hadir';
  metodeKehadiran: 'daring' | 'luring' | null;
  waktuKonfirmasi?: string; // ISO string
  waktuCheckIn?: string; // ISO string
}

export interface RSVPResponse {
  guestId?: string; // Optional, present if they were pre-invited
  nama: string;
  jabatan: string;
  instansi: string;
  metodeKehadiran: 'daring' | 'luring';
  submittedAt: string; // ISO string
}
