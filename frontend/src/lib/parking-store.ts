import { useSyncExternalStore } from "react";

export type VehicleType = "2-wheeler" | "4-wheeler" | "disabled";
export type SlotStatus = "available" | "occupied" | "booked";
export type PaymentStatus = "done" | "failed" | "waiting";

export interface Owner {
  owner_id: string;
  owner_name: string;
  special_category: string | null;
}
export interface Vehicle {
  vehicle_id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  owner_id: string;
}
export interface Zone {
  zone_id: string;
  zone_name: string;
  vehicle_type: VehicleType;
}
export interface Slot {
  slot_id: string;
  zone_id: string;
  slot_number: number;
  slot_category: VehicleType;
  status: SlotStatus;
}
export interface Session {
  session_id: string;
  vehicle_id: string;
  slot_id: string;
  entry_time: string;
  leaving_time: string | null;
  status: "active" | "completed";
}
export interface Payment {
  payment_id: string;
  session_id: string;
  amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
}
export interface Rate {
  rate_id: string;
  vehicle_type: VehicleType;
  hourly_rate: number;
  label: string;
}
export interface Notification {
  notification_id: string;
  vehicle_id: string;
  message: string;
  sent_time: string;
  read: boolean;
}
export interface HistoryRow {
  history_id: string;
  vehicle_id: string;
  slot_id: string;
  entry_time: string;
  exit_time: string;
  total_cost: number;
}

interface State {
  owners: Owner[];
  vehicles: Vehicle[];
  zones: Zone[];
  slots: Slot[];
  sessions: Session[];
  payments: Payment[];
  rates: Rate[];
  notifications: Notification[];
  history: HistoryRow[];
  adminLoggedIn: boolean;
  currentVehicleId: string | null;
}

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const initial: State = {
  owners: [],
  vehicles: [],
  zones: [],
  slots: [],
  sessions: [],
  payments: [],
  rates: [],
  notifications: [],
  history: [],
  adminLoggedIn: false,
  currentVehicleId: null,
};

let state: State = initial;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State> | ((s: State) => Partial<State>)) => {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
};

export const useStore = <T,>(sel: (s: State) => T): T =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sel(state),
    () => sel(state),
  );

export const getState = () => state;

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const BASE_URL = "http://localhost:5000";

export const actions = {
  async init() {
    try {
      const res = await fetch(`${BASE_URL}/api/state`);
      if (res.ok) {
        const data = await res.json();
        set(data);
      }
    } catch (e) {
      console.error(e);
    }
  },

  async registerAndAllot(input: { owner_name: string; plate_number: string; vehicle_type: VehicleType; special_category?: string }) {
    try {
      const res = await fetch(`${BASE_URL}/api/register_and_allot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await res.json();
      if (data.error) return { error: data.error };
      await this.init();
      return data;
    } catch (e) {
      return { error: 'Failed to connect to backend.' };
    }
  },

  async payNow(payment_id: string, method: string) {
    try {
      await fetch(`${BASE_URL}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id, method })
      });
      await this.init();
    } catch (e) {
      console.error(e);
    }
  },

  async endSession(session_id: string) {
    try {
      await fetch(`${BASE_URL}/api/end_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id })
      });
      await this.init();
    } catch (e) {
      console.error(e);
    }
  },

  async scanAndRegister(input: { owner_name: string; plate_number: string; vehicle_type: string; special_category?: string }) {
    try {
      const res = await fetch(`${BASE_URL}/api/scan_register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await res.json();
      if (data.error) return { error: data.error };
      await this.init();
      return data;
    } catch (e) {
      return { error: 'Failed to connect to backend.' };
    }
  },

  adminLogin(username: string, password: string) {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      set({ adminLoggedIn: true });
      return true;
    }
    return false;
  },
  adminLogout() {
    set({ adminLoggedIn: false });
  },
  markRead(id: string) {
    set((s) => ({ notifications: s.notifications.map((n) => (n.notification_id === id ? { ...n, read: true } : n)) }));
  },
};


export const ADMIN_HINT = `Use ${ADMIN_USER} / ${ADMIN_PASS}`;
