const DATABASE_NAME = 'inisio-document-storage';
const STORE_NAME = 'files';
const DATABASE_VERSION = 1;

interface StoredDocument {
  key: string;
  dataUrl: string;
}

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'key' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function storeDocumentData(dataUrl: string, key: string): Promise<string> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ key, dataUrl } satisfies StoredDocument);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return key;
}

export async function loadDocumentData(key?: string): Promise<string | undefined> {
  if (!key) return undefined;
  const database = await openDatabase();
  const document = await new Promise<StoredDocument | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as StoredDocument | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return document?.dataUrl;
}
