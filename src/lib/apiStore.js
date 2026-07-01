let _getToken = null;

export function setTokenGetter(fn) {
  _getToken = fn;
}

async function getToken() {
  if (_getToken) {
    return _getToken();
  }
  return null;
}

async function authHeaders() {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(resource, method, body, id, retry = true) {
  let url = `/api/${resource}`;
  if (method === "DELETE" && id != null) url += `?id=${id}`;
  if (method === "GET" && id != null) url += `?id=${id}`;

  try {
    const res = await fetch(url, {
      method,
      headers: await authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      if (res.status === 401 && retry) {
        const token = await getToken();
        if (token) {
          const retryRes = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: body ? JSON.stringify(body) : undefined,
          });
          if (retryRes.ok) return retryRes.json();
        }
      }
      let errorBody = "";
      try { errorBody = await res.text(); } catch {}
      throw new Error(`Eroare ${res.status}: ${errorBody}`);
    }
    return res.json();
  } catch (e) {
    console.warn(`[apiStore] ${method} /${resource} a eșuat:`, e.message);
    return null;
  }
}

export function createSyncedStore(key, initial = []) {
  const lsKey = `imob-${key}-v2`;

  function readLocal() {
    try {
      const raw = localStorage.getItem(lsKey);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  }

  function writeLocal(data) {
    localStorage.setItem(lsKey, JSON.stringify(data));
  }

  async function syncFromApi() {
    const data = await apiFetch(key, "GET");
    if (data && Array.isArray(data)) {
      writeLocal(data);
      window.dispatchEvent(new CustomEvent(`store:${key}`));
    }
  }

  async function pushToApi(method, id, data) {
    if (method === "POST") return apiFetch(key, "POST", data);
    else if (method === "PUT") return apiFetch(key, "PUT", { id, ...data });
    else if (method === "DELETE") return apiFetch(key, "DELETE", { id });
  }

  const store = {
    getAll() {
      return readLocal();
    },

    getById(id) {
      return readLocal().find((item) => item.id === id || String(item.id) === String(id)) || null;
    },

    add(item) {
      const all = readLocal();
      const tempId = Date.now();
      const newItem = { ...item, id: tempId };
      all.push(newItem);
      writeLocal(all);
      pushToApi("POST", null, newItem).then((saved) => {
        if (saved) {
          const fresh = readLocal();
          const idx = fresh.findIndex((x) => String(x.id) === String(tempId));
          if (idx > -1) {
            fresh[idx] = { ...saved };
            writeLocal(fresh);
            window.dispatchEvent(new CustomEvent(`store:${key}`));
          }
        }
      }).catch(() => {});
      return newItem;
    },

    update(id, data) {
      const all = readLocal();
      const idx = all.findIndex((item) => item.id === id || String(item.id) === String(id));
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...data, id: all[idx].id };
      writeLocal(all);
      pushToApi("PUT", all[idx].id, data).then(() => syncFromApi());
      return all[idx];
    },

    delete(id) {
      const all = readLocal().filter((item) => item.id !== id && String(item.id) !== String(id));
      writeLocal(all);
      if (id != null) {
        pushToApi("DELETE", id).then(() => syncFromApi());
      }
    },

    replaceAll(items) {
      writeLocal(items);
    },

    async sync() {
      return syncFromApi();
    },
  };

  return store;
}
