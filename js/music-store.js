// Músicas escolhidas pelo usuário: guardadas só neste navegador (IndexedDB), nunca enviadas ao site.
import { trackName } from './music.js';

const DB_NAME = 'pomodoro';
const STORE = 'musicas';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'name' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, action) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const result = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(result?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  }));
}

// Guarda arquivos de áudio (File) escolhidos no seletor; um arquivo com o mesmo nome é substituído.
export async function storeMusicFiles(files) {
  const audio = files.filter((f) => f.type.startsWith('audio/') || /\.(mp3|ogg|oga|opus|m4a|aac|wav|flac|webm)$/i.test(f.name));
  await run('readwrite', (store) => audio.forEach((file) => store.put({ name: file.name, blob: file })));
  return audio.length;
}

// Faixas guardadas, prontas para o tocador ({ url, name }). Sem IndexedDB ou com erro: lista vazia.
export async function loadStoredTracks() {
  try {
    const items = await run('readonly', (store) => store.getAll());
    return (items ?? []).map((item) => ({ url: URL.createObjectURL(item.blob), name: trackName(item.name) }));
  } catch {
    return [];
  }
}

export async function clearStoredMusic() {
  try {
    await run('readwrite', (store) => store.clear());
  } catch {
    // nada a apagar
  }
}
