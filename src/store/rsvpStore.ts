import { create } from 'zustand';
import type { Event, Guest, RSVPResponse } from '../types';
import { eventService, guestService } from '../services/db';

interface RSVPState {
  events: Event[];
  guests: Record<string, Guest[]>; // eventId -> Guest[]
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  createEvent: (eventData: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  fetchGuests: (eventId: string) => Promise<void>;
  addGuest: (
    eventId: string,
    guestData: Omit<Guest, 'id' | 'eventId' | 'statusUndangan' | 'metodeKehadiran' | 'waktuKonfirmasi' | 'waktuCheckIn'>
  ) => Promise<void>;
  addGuestsBatch: (
    eventId: string,
    guestsData: Omit<Guest, 'id' | 'eventId' | 'statusUndangan' | 'metodeKehadiran' | 'waktuKonfirmasi' | 'waktuCheckIn'>[]
  ) => Promise<void>;
  submitRSVP: (eventId: string, response: RSVPResponse) => Promise<Guest>;
  checkInGuest: (eventId: string, guestId: string) => Promise<void>;
  autoCheckInDaring: (eventId: string, guestId: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

export const useRSVPStore = create<RSVPState>((set, get) => ({
  events: [],
  guests: {},
  currentEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventService.getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat daftar kegiatan', isLoading: false });
    }
  },

  fetchEventById: async (id) => {
    // If we already have the event, return it but still fetch in background or resolve
    const existing = get().events.find((e) => e.id === id);
    set({ isLoading: true, error: null });
    try {
      const event = await eventService.getEventById(id);
      if (event) {
        set((state) => ({
          currentEvent: event,
          // update in list as well
          events: state.events.map((e) => (e.id === id ? event : e)),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return event;
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat data kegiatan', isLoading: false });
      return existing || null;
    }
  },

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const newEvent = await eventService.createEvent(eventData);
      set((state) => ({
        events: [newEvent, ...state.events],
        isLoading: false,
      }));
      return newEvent;
    } catch (err: any) {
      set({ error: err.message || 'Gagal membuat kegiatan baru', isLoading: false });
      throw err;
    }
  },

  fetchGuests: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const guestsList = await guestService.getGuests(eventId);
      set((state) => ({
        guests: {
          ...state.guests,
          [eventId]: guestsList,
        },
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Gagal memuat daftar tamu', isLoading: false });
    }
  },

  addGuest: async (eventId, guestData) => {
    set({ isLoading: true, error: null });
    try {
      const newGuest = await guestService.addGuest(eventId, guestData);
      set((state) => {
        const currentList = state.guests[eventId] || [];
        // Only append if it's not already in list
        const exists = currentList.some((g) => g.id === newGuest.id);
        const updatedList = exists ? currentList : [...currentList, newGuest];
        return {
          guests: {
            ...state.guests,
            [eventId]: updatedList,
          },
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal menambah tamu', isLoading: false });
    }
  },

  addGuestsBatch: async (eventId, guestsData) => {
    set({ isLoading: true, error: null });
    try {
      const addedGuests = await guestService.addGuestsBatch(eventId, guestsData);
      set((state) => {
        const currentList = state.guests[eventId] || [];
        // Merge without duplicates based on id
        const mergedList = [...currentList];
        addedGuests.forEach((g) => {
          if (!mergedList.some((mg) => mg.id === g.id)) {
            mergedList.push(g);
          }
        });
        return {
          guests: {
            ...state.guests,
            [eventId]: mergedList,
          },
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal mengimpor daftar tamu', isLoading: false });
    }
  },

  submitRSVP: async (eventId, response) => {
    set({ isLoading: true, error: null });
    try {
      const guest = await guestService.submitRSVP(eventId, response);
      set((state) => {
        const currentList = state.guests[eventId] || [];
        const index = currentList.findIndex((g) => g.id === guest.id);
        let updatedList = [...currentList];
        if (index > -1) {
          updatedList[index] = guest;
        } else {
          updatedList.push(guest);
        }
        return {
          guests: {
            ...state.guests,
            [eventId]: updatedList,
          },
          isLoading: false,
        };
      });
      return guest;
    } catch (err: any) {
      set({ error: err.message || 'Gagal mengirim konfirmasi RSVP', isLoading: false });
      throw err;
    }
  },

  checkInGuest: async (eventId: string, guestId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGuest = await guestService.checkInGuest(guestId);
      set((state) => {
        const currentList = state.guests[eventId] || [];
        const updatedList = currentList.map((g) => (g.id === guestId ? updatedGuest : g));
        return {
          guests: {
            ...state.guests,
            [eventId]: updatedList,
          },
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal check-in tamu', isLoading: false });
      throw err;
    }
  },

  autoCheckInDaring: async (eventId, guestId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGuest = await guestService.autoCheckInDaring(guestId);
      set((state) => {
        const currentList = state.guests[eventId] || [];
        const updatedList = currentList.map((g) => (g.id === guestId ? updatedGuest : g));
        return {
          guests: {
            ...state.guests,
            [eventId]: updatedList,
          },
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Gagal check-in tamu daring', isLoading: false });
    }
  },

  resetDatabase: async () => {
    set({ isLoading: true, error: null });
    try {
      await eventService.resetDatabase();
      set({
        events: [],
        guests: {},
        currentEvent: null,
        isLoading: false,
      });
      // Immediately fetch new seed events
      const events = await eventService.getEvents();
      set({ events });
    } catch (err: any) {
      set({ error: err.message || 'Gagal mereset database', isLoading: false });
    }
  }
}));
