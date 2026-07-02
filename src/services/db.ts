import type { Event, Guest, RSVPResponse } from '../types';

// Helper key names for localStorage
const STORAGE_KEYS = {
  EVENTS: 'rsvp_app_events',
  GUESTS: 'rsvp_app_guests',
};

// Initial Seed Data for testing
const SEED_EVENTS: Event[] = [
  {
    id: 'evt-dana-desa-2026',
    namaKegiatan: 'Sosialisasi Program Kerja Dana Desa Tahun Anggaran 2026',
    waktuMulai: '2026-07-15T09:00:00.000Z',
    waktuSelesai: '2026-07-15T12:00:00.000Z',
    jenisRapat: 'hybrid',
    lokasi: {
      tempat: 'Aula Oetojo Oesman, Lt. 2 Kementerian Desa PDTT, Jakarta Selatan',
      urlOnline: 'https://zoom.us/j/9876543210?pwd=DanaDesa2026',
    },
    createdAt: '2026-07-01T08:00:00.000Z',
  },
  {
    id: 'evt-rakor-pembangunan',
    namaKegiatan: 'Rapat Koordinasi Evaluasi Pembangunan Daerah Tertinggal',
    waktuMulai: '2026-07-20T13:00:00.000Z',
    waktuSelesai: '2026-07-20T16:00:00.000Z',
    jenisRapat: 'luring',
    lokasi: {
      tempat: 'Ruang Rapat Utama Biro Perencanaan, Gedung A Lantai 4 Kemendesa PDTT',
    },
    createdAt: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 'evt-webinar-bumdes',
    namaKegiatan: 'Webinar Optimalisasi Peran BUMDes dalam Pemulihan Ekonomi Desa',
    waktuMulai: '2026-07-25T10:00:00.000Z',
    waktuSelesai: '2026-07-25T12:30:00.000Z',
    jenisRapat: 'daring',
    lokasi: {
      tempat: 'Pusdatin Kemendesa PDTT (Studio Utama)',
      urlOnline: 'https://youtube.com/live/BUMDesKemendesa2026',
    },
    createdAt: '2026-07-02T11:00:00.000Z',
  }
];

const SEED_GUESTS: Guest[] = [
  // Guests for Event 1 (Sosialisasi Dana Desa - HYBRID)
  {
    id: 'gst-1',
    eventId: 'evt-dana-desa-2026',
    nama: 'Dr. Ir. H. Heru Pramono, M.Si.',
    jabatan: 'Kepala Dinas PMD',
    instansi: 'Pemerintah Kabupaten Bogor',
    statusUndangan: 'diundang',
    metodeKehadiran: null,
  },
  {
    id: 'gst-2',
    eventId: 'evt-dana-desa-2026',
    nama: 'Rina Wijayanti, S.E.',
    jabatan: 'Kepala Bidang Pemberdayaan Desa',
    instansi: 'Dinas PMD Provinsi Jawa Barat',
    statusUndangan: 'dikonfirmasi',
    metodeKehadiran: 'luring',
    waktuKonfirmasi: '2026-07-02T08:30:00.000Z',
  },
  {
    id: 'gst-3',
    eventId: 'evt-dana-desa-2026',
    nama: 'Prof. Dr. Anwar Sanusi, M.A.',
    jabatan: 'Sekretaris Jenderal',
    instansi: 'Kementerian Desa PDTT',
    statusUndangan: 'hadir',
    metodeKehadiran: 'luring',
    waktuKonfirmasi: '2026-07-02T09:00:00.000Z',
    waktuCheckIn: '2026-07-15T08:45:00.000Z',
  },
  {
    id: 'gst-4',
    eventId: 'evt-dana-desa-2026',
    nama: 'Bambang Irawan, M.Acc.',
    jabatan: 'Direktur Fasilitasi Pemanfaatan Dana Desa',
    instansi: 'Ditjen PDP Kemendesa PDTT',
    statusUndangan: 'hadir',
    metodeKehadiran: 'daring',
    waktuKonfirmasi: '2026-07-02T09:15:00.000Z',
    waktuCheckIn: '2026-07-15T09:01:00.000Z',
  },
  {
    id: 'gst-5',
    eventId: 'evt-dana-desa-2026',
    nama: 'Sudirman, S.H.',
    jabatan: 'Tenaga Pendamping Profesional (TPP)',
    instansi: 'Kabupaten Sukabumi',
    statusUndangan: 'diundang',
    metodeKehadiran: null,
  },
  {
    id: 'gst-9',
    eventId: 'evt-dana-desa-2026',
    nama: 'Drs. Mulyadi, M.Si.',
    jabatan: 'Kepala Bagian Keuangan',
    instansi: 'Pemerintah Kabupaten Cianjur',
    statusUndangan: 'dikonfirmasi',
    metodeKehadiran: 'daring',
    waktuKonfirmasi: '2026-07-02T09:45:00.000Z',
  },
  {
    id: 'gst-10',
    eventId: 'evt-dana-desa-2026',
    nama: 'Dr. H. Adnan, M.Si.',
    jabatan: 'Camat Parung',
    instansi: 'Pemerintah Kabupaten Bogor',
    statusUndangan: 'hadir',
    metodeKehadiran: 'luring',
    waktuKonfirmasi: '2026-07-02T10:00:00.000Z',
    waktuCheckIn: '2026-07-15T08:50:00.000Z',
  },
  {
    id: 'gst-11',
    eventId: 'evt-dana-desa-2026',
    nama: 'Sri Wahyuni, S.Kom.',
    jabatan: 'Analis Sistem Informasi',
    instansi: 'Dinas PMD Provinsi Jawa Barat',
    statusUndangan: 'dikonfirmasi',
    metodeKehadiran: 'luring',
    waktuKonfirmasi: '2026-07-02T10:15:00.000Z',
  },
  {
    id: 'gst-12',
    eventId: 'evt-dana-desa-2026',
    nama: 'Agus Setiawan, S.E.',
    jabatan: 'Tenaga Ahli Madya P3MD',
    instansi: 'Provinsi Banten',
    statusUndangan: 'hadir',
    metodeKehadiran: 'daring',
    waktuKonfirmasi: '2026-07-02T10:30:00.000Z',
    waktuCheckIn: '2026-07-15T09:05:00.000Z',
  },
  {
    id: 'gst-13',
    eventId: 'evt-dana-desa-2026',
    nama: 'Mega Lestari, S.H.',
    jabatan: 'Analis Kebijakan Ahli Pertama',
    instansi: 'Kementerian Desa PDTT',
    statusUndangan: 'diundang',
    metodeKehadiran: null,
  },
  {
    id: 'gst-18',
    eventId: 'evt-dana-desa-2026',
    nama: 'Asep Saepudin',
    jabatan: 'Perencana Ahli Madya',
    instansi: 'Kementerian Perencanaan Pembangunan Nasional/BAPPENAS',
    statusUndangan: 'tidak_hadir',
    metodeKehadiran: null,
    waktuKonfirmasi: '2026-07-02T10:45:00.000Z',
  },
  {
    id: 'gst-19',
    eventId: 'evt-dana-desa-2026',
    nama: 'Alfia Oktivalerina, S.E., M.Sc.',
    jabatan: 'Perencana Ahli Madya',
    instansi: 'Kementerian Perencanaan Pembangunan Nasional/BAPPENAS',
    statusUndangan: 'tidak_hadir',
    metodeKehadiran: null,
    waktuKonfirmasi: '2026-07-02T10:50:00.000Z',
  },
  {
    id: 'gst-20',
    eventId: 'evt-dana-desa-2026',
    nama: 'Muhammad Khoirul Huda, M.Pd.',
    jabatan: 'Staf Khusus Menteri Bidang Komunikasi Publik dan Kemitraan Media',
    instansi: 'Kementerian Desa dan Pembangunan Daerah Tertinggal',
    statusUndangan: 'tidak_hadir',
    metodeKehadiran: null,
    waktuKonfirmasi: '2026-07-02T11:00:00.000Z',
  },

  // Guests for Event 2 (Rakor Pembangunan - LURING ONLY)
  {
    id: 'gst-6',
    eventId: 'evt-rakor-pembangunan',
    nama: 'H. Sutisna, S.Sos.',
    jabatan: 'Kepala Bappeda',
    instansi: 'Pemerintah Kabupaten Lebak',
    statusUndangan: 'diundang',
    metodeKehadiran: null,
  },
  {
    id: 'gst-7',
    eventId: 'evt-rakor-pembangunan',
    nama: 'Dian Safitri, M.P.A.',
    jabatan: 'Direktur Penyerasian Pembangunan Daerah',
    instansi: 'Ditjen PPDT Kemendesa PDTT',
    statusUndangan: 'dikonfirmasi',
    metodeKehadiran: 'luring',
    waktuKonfirmasi: '2026-07-02T11:20:00.000Z',
  },
  {
    id: 'gst-8',
    eventId: 'evt-rakor-pembangunan',
    nama: 'Hendra Setiawan, S.T.',
    jabatan: 'Camat Panggarangan',
    instansi: 'Kabupaten Lebak',
    statusUndangan: 'diundang',
    metodeKehadiran: null,
  },
  {
    id: 'gst-14',
    eventId: 'evt-rakor-pembangunan',
    nama: 'Yusuf Mansur, S.IP.',
    jabatan: 'Kepala Bidang Sarana Prasarana',
    instansi: 'Bappeda Kabupaten Pandeglang',
    statusUndangan: 'hadir',
    metodeKehadiran: 'luring',
    waktuKonfirmasi: '2026-07-02T11:45:00.000Z',
    waktuCheckIn: '2026-07-20T12:55:00.000Z',
  },

  // Guests for Event 3 (Webinar BUMDes - DARING ONLY)
  {
    id: 'gst-15',
    eventId: 'evt-webinar-bumdes',
    nama: 'Achmad Ridwan, M.M.',
    jabatan: 'Direktur BUMDes Bersama',
    instansi: 'Kecamatan Singaparna',
    statusUndangan: 'diundang',
    metodeKehadiran: null,
  },
  {
    id: 'gst-16',
    eventId: 'evt-webinar-bumdes',
    nama: 'Kartika Sari, S.Pd.',
    jabatan: 'Pendamping Desa',
    instansi: 'Kecamatan Ciawi',
    statusUndangan: 'dikonfirmasi',
    metodeKehadiran: 'daring',
    waktuKonfirmasi: '2026-07-02T12:00:00.000Z',
  },
  {
    id: 'gst-17',
    eventId: 'evt-webinar-bumdes',
    nama: 'Dr. H. Supriadi, M.Si.',
    jabatan: 'Kepala Pusat Pelatihan',
    instansi: 'BPSDM Kemendesa PDTT',
    statusUndangan: 'hadir',
    metodeKehadiran: 'daring',
    waktuKonfirmasi: '2026-07-02T12:15:00.000Z',
    waktuCheckIn: '2026-07-25T09:58:00.000Z',
  }
];

// Initialize database in localStorage if not exists
const initDb = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GUESTS)) {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(SEED_GUESTS));
  }
};

// Auto-init on file load
initDb();

// Load data helpers
const getEventsFromStore = (): Event[] => {
  initDb();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
};

const saveEventsToStore = (events: Event[]) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

const getGuestsFromStore = (): Guest[] => {
  initDb();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.GUESTS) || '[]');
};

const saveGuestsToStore = (guests: Guest[]) => {
  localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
};

// Delay simulator to mimic real API network latency (e.g. 150ms)
const delay = <T>(value: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), 150));
};

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const events = getEventsFromStore();
    // Sort events by waktuMulai descending
    return delay(events.sort((a, b) => new Date(b.waktuMulai).getTime() - new Date(a.waktuMulai).getTime()));
  },

  async getEventById(id: string): Promise<Event | null> {
    const events = getEventsFromStore();
    const event = events.find((e) => e.id === id) || null;
    return delay(event);
  },

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const events = getEventsFromStore();
    const newEvent: Event = {
      ...eventData,
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    saveEventsToStore(events);
    return delay(newEvent);
  },

  async resetDatabase(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.GUESTS);
    initDb();
    return delay(undefined);
  },
};

export const guestService = {
  async getGuests(eventId: string): Promise<Guest[]> {
    const guests = getGuestsFromStore();
    const filtered = guests.filter((g) => g.eventId === eventId);
    return delay(filtered);
  },

  async addGuest(
    eventId: string,
    guestData: Omit<Guest, 'id' | 'eventId' | 'statusUndangan' | 'metodeKehadiran' | 'waktuKonfirmasi' | 'waktuCheckIn'>
  ): Promise<Guest> {
    const guests = getGuestsFromStore();
    
    // Check if guest with same name and eventId already exists to avoid duplicates
    const existing = guests.find(
      (g) => g.eventId === eventId && g.nama.toLowerCase().trim() === guestData.nama.toLowerCase().trim()
    );
    if (existing) {
      return delay(existing);
    }

    const newGuest: Guest = {
      ...guestData,
      id: `gst-${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      statusUndangan: 'diundang',
      metodeKehadiran: null,
    };
    guests.push(newGuest);
    saveGuestsToStore(guests);
    return delay(newGuest);
  },

  async addGuestsBatch(
    eventId: string,
    guestsData: Omit<Guest, 'id' | 'eventId' | 'statusUndangan' | 'metodeKehadiran' | 'waktuKonfirmasi' | 'waktuCheckIn'>[]
  ): Promise<Guest[]> {
    const guests = getGuestsFromStore();
    const addedGuests: Guest[] = [];

    guestsData.forEach((data) => {
      // Avoid duplication
      const existing = guests.find(
        (g) => g.eventId === eventId && g.nama.toLowerCase().trim() === data.nama.toLowerCase().trim()
      );
      if (existing) {
        addedGuests.push(existing);
      } else {
        const newGuest: Guest = {
          ...data,
          id: `gst-${Math.random().toString(36).substr(2, 9)}`,
          eventId,
          statusUndangan: 'diundang',
          metodeKehadiran: null,
        };
        guests.push(newGuest);
        addedGuests.push(newGuest);
      }
    });

    saveGuestsToStore(guests);
    return delay(addedGuests);
  },

  async submitRSVP(eventId: string, response: RSVPResponse): Promise<Guest> {
    const guests = getGuestsFromStore();
    const targetStatus = response.statusUndangan || 'dikonfirmasi';

    // 1. Try to find if they are pre-invited by matching name & eventId
    // Case insensitive search
    let guest = guests.find(
      (g) => g.eventId === eventId && g.nama.toLowerCase().trim() === response.nama.toLowerCase().trim()
    );

    if (guest) {
      // Update existing pre-invited guest
      guest.statusUndangan = targetStatus;
      guest.metodeKehadiran = response.metodeKehadiran;
      guest.waktuKonfirmasi = response.submittedAt;
      // update details if provided
      if (response.jabatan) guest.jabatan = response.jabatan;
      if (response.instansi) guest.instansi = response.instansi;
    } else {
      // 2. Self-registration if they are not in the database
      guest = {
        id: response.guestId || `gst-${Math.random().toString(36).substr(2, 9)}`,
        eventId,
        nama: response.nama,
        jabatan: response.jabatan,
        instansi: response.instansi,
        statusUndangan: targetStatus,
        metodeKehadiran: response.metodeKehadiran,
        waktuKonfirmasi: response.submittedAt,
      };
      guests.push(guest);
    }

    saveGuestsToStore(guests);
    return delay(guest);
  },

  async checkInGuest(guestId: string, metodeOverride?: 'daring' | 'luring'): Promise<Guest> {
    const guests = getGuestsFromStore();
    const guest = guests.find((g) => g.id === guestId);

    if (!guest) {
      throw new Error('Tamu tidak ditemukan.');
    }

    guest.statusUndangan = 'hadir';
    guest.waktuCheckIn = new Date().toISOString();
    
    // Set method of attendance. Override if explicit parameter passed,
    // otherwise default to existing, or if none, 'luring'
    if (metodeOverride) {
      guest.metodeKehadiran = metodeOverride;
    } else if (!guest.metodeKehadiran) {
      guest.metodeKehadiran = 'luring';
    }

    // If they hadn't confirmed RSVP status, auto confirm too
    if (!guest.waktuKonfirmasi) {
      guest.waktuKonfirmasi = guest.waktuCheckIn;
    }

    saveGuestsToStore(guests);
    return delay(guest);
  },

  async autoCheckInDaring(guestId: string): Promise<Guest> {
    const guests = getGuestsFromStore();
    const guest = guests.find((g) => g.id === guestId);

    if (!guest) {
      throw new Error('Tamu tidak ditemukan.');
    }

    guest.statusUndangan = 'hadir';
    guest.metodeKehadiran = 'daring';
    guest.waktuCheckIn = new Date().toISOString();
    
    if (!guest.waktuKonfirmasi) {
      guest.waktuKonfirmasi = guest.waktuCheckIn;
    }

    saveGuestsToStore(guests);
    return delay(guest);
  },

  async updateGuestMethod(guestId: string, metode: 'daring' | 'luring' | null): Promise<Guest> {
    const guests = getGuestsFromStore();
    const guest = guests.find((g) => g.id === guestId);

    if (!guest) {
      throw new Error('Tamu tidak ditemukan.');
    }

    guest.metodeKehadiran = metode;
    
    // Auto-update status if they were 'diundang' (not confirmed) to 'dikonfirmasi'
    if (metode && guest.statusUndangan === 'diundang') {
      guest.statusUndangan = 'dikonfirmasi';
      guest.waktuKonfirmasi = new Date().toISOString();
    } else if (!metode && guest.statusUndangan === 'dikonfirmasi') {
      // If cleared, switch back to diundang
      guest.statusUndangan = 'diundang';
      guest.waktuKonfirmasi = undefined;
    }

    saveGuestsToStore(guests);
    return delay(guest);
  },

  async updateGuestStatusAndMethod(
    guestId: string,
    status: Guest['statusUndangan'],
    metode: Guest['metodeKehadiran']
  ): Promise<Guest> {
    const guests = getGuestsFromStore();
    const guest = guests.find((g) => g.id === guestId);

    if (!guest) {
      throw new Error('Tamu tidak ditemukan.');
    }

    guest.statusUndangan = status;
    guest.metodeKehadiran = metode;

    if (status === 'hadir') {
      if (!guest.waktuCheckIn) {
        guest.waktuCheckIn = new Date().toISOString();
      }
      if (!guest.waktuKonfirmasi) {
        guest.waktuKonfirmasi = guest.waktuCheckIn;
      }
    } else if (status === 'dikonfirmasi') {
      guest.waktuCheckIn = undefined;
      if (!guest.waktuKonfirmasi) {
        guest.waktuKonfirmasi = new Date().toISOString();
      }
    } else if (status === 'diundang') {
      guest.waktuCheckIn = undefined;
      guest.waktuKonfirmasi = undefined;
      guest.metodeKehadiran = null;
    } else if (status === 'tidak_hadir') {
      guest.waktuCheckIn = undefined;
      guest.metodeKehadiran = null;
      if (!guest.waktuKonfirmasi) {
        guest.waktuKonfirmasi = new Date().toISOString();
      }
    }

    saveGuestsToStore(guests);
    return delay(guest);
  }
};
