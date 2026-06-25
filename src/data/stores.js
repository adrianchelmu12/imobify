import { createSyncedStore } from "../lib/apiStore";

export const proprietatiStore = createSyncedStore("proprietati", []);
export const clientiStore = createSyncedStore("clienti", []);
export const programariStore = createSyncedStore("programari", []);
export const taskuriStore = createSyncedStore("taskuri", []);
export const proiecteStore = createSyncedStore("proiecte", []);
export const documenteStore = createSyncedStore("documente", []);
export const comisioaneStore = createSyncedStore("comisioane", []);
export const campaniiStore = createSyncedStore("campanii", []);

const allStores = [
  proprietatiStore,
  clientiStore,
  programariStore,
  taskuriStore,
  proiecteStore,
  documenteStore,
  comisioaneStore,
  campaniiStore,
];

export async function syncAllStores() {
  await Promise.all(allStores.map((s) => s.sync()));
}
