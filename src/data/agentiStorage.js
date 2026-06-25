import { createSyncedStore } from "../lib/apiStore";

const agentiStore = createSyncedStore("agenti", []);

export async function getAgenti() {
  return agentiStore.getAll();
}

export async function addAgent(agent) {
  return agentiStore.add({
    nume: agent.nume,
    telefon: agent.telefon || "",
    email: agent.email || "",
    poza: agent.poza || "",
    zone: agent.zone || "",
  });
}

export async function updateAgent(id, values) {
  return agentiStore.update(id, values);
}

export async function deleteAgent(id) {
  return agentiStore.delete(id);
}

export async function syncAgenti() {
  return agentiStore.sync();
}
