type PendingHomeUpload = {
  file: File;
};

const pendingHomeUploads = new Map<string, PendingHomeUpload>();

function createUploadId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `home-upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createHomeUploadHandoff(file: File) {
  const id = createUploadId();

  pendingHomeUploads.set(id, { file });

  return id;
}

export function takeHomeUploadHandoff(id: string) {
  const upload = pendingHomeUploads.get(id) ?? null;

  if (upload) {
    pendingHomeUploads.delete(id);
  }

  return upload;
}
