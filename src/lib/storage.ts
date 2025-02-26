import { Parcelle, HistoryRecord } from "@/shared/schema";

const STORAGE_KEYS = {
  PARCELLES: "parcelles",
  SELECTED_PARCELLE: "selectedParcelle",
  HISTORY: "history"
};

export const storage = {
  async getParcelles(): Promise<Parcelle[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.PARCELLES);
    if (!stored) return [];
    return JSON.parse(stored);
  },

  async getSelectedParcelle(): Promise<Parcelle | null> {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_PARCELLE);
    if (!stored) return null;
    return JSON.parse(stored);
  },

  async setSelectedParcelle(parcelle: Parcelle | null): Promise<void> {
    if (parcelle === null) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PARCELLE);
    } else {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PARCELLE, JSON.stringify(parcelle));
    }
  },

  async saveParcelle(parcelle: Parcelle): Promise<void> {
    const parcelles = await this.getParcelles();
    parcelles.push(parcelle);
    localStorage.setItem(STORAGE_KEYS.PARCELLES, JSON.stringify(parcelles));
  },

  async deleteParcelle(id: number): Promise<void> {
    const parcelles = await this.getParcelles();
    const filteredParcelles = parcelles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PARCELLES, JSON.stringify(filteredParcelles));
  },

  async saveHistory(record: HistoryRecord): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const history = stored ? JSON.parse(stored) : [];
    history.push(record);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  async getHistory(): Promise<HistoryRecord[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!stored) return [];
    return JSON.parse(stored);
  },

  async deleteHistory(id: number): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!stored) return;
    const history = JSON.parse(stored);
    const filteredHistory = history.filter((h: HistoryRecord) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filteredHistory));
  }
};
