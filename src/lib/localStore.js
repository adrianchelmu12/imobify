function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function createStore(key, initial = []) {
  let data = read(key, initial);

  return {
    getAll() {
      return [...data];
    },
    getById(id) {
      return data.find((item) => String(item.id) === String(id)) || null;
    },
    add(item) {
      const nou = { id: Date.now(), created_at: new Date().toISOString(), ...item };
      data.push(nou);
      write(key, data);
      return nou;
    },
    update(id, values) {
      const idx = data.findIndex((item) => String(item.id) === String(id));
      if (idx === -1) return null;
      data[idx] = { ...data[idx], ...values };
      write(key, data);
      return data[idx];
    },
    delete(id) {
      const before = data.length;
      data = data.filter((item) => String(item.id) !== String(id));
      write(key, data);
      return data.length !== before;
    },
    replaceAll(items) {
      data = items;
      write(key, data);
    },
  };
}
