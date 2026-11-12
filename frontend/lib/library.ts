
export type GeneratedResourceType =
    | "AI Summary"
    | "Flashcards"
    | "Quiz"
    | "Tutor Conversation";

export type LibraryMaterial = {
    id: string;
    name: string;
    type: string;
    mimeType: string;
    size: number;
    createdAt: string;
    file?: Blob;
    textContent?: string;

    // Additional fields for generated learning resources.
    category?: "source" | "generated";
    resourceType?: GeneratedResourceType;
    sourceMaterialId?: string;
};

export type GeneratedResourceInput = {
    title: string;
    resourceType: GeneratedResourceType;
    content: string;
    sourceMaterialId?: string;
};

const DB_NAME = "learnlite-library";
const STORE_NAME = "materials";
const DB_VERSION = 1;

function openLibraryDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
            reject(new Error("Local storage is not available in this browser."));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
            reject(request.error ?? new Error("Could not open your library."));
    });
}

function getMaterialType(name: string, mimeType: string): string {
    const extension = name.split(".").pop()?.toLowerCase();

    if (mimeType.startsWith("image/")) return "Image";
    if (extension === "pdf") return "PDF";
    if (["doc", "docx"].includes(extension ?? "")) return "Word";
    if (["ppt", "pptx"].includes(extension ?? "")) return "PowerPoint";
    if (extension === "txt" || mimeType === "text/plain") return "Text";

    return "Document";
}

function addMaterial(material: LibraryMaterial): Promise<LibraryMaterial> {
    return openLibraryDB().then(
        (db) =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readwrite");

                transaction.objectStore(STORE_NAME).add(material);

                transaction.oncomplete = () => {
                    db.close();
                    resolve(material);
                };

                transaction.onerror = () => {
                    db.close();
                    reject(
                        transaction.error ?? new Error("Could not save this material.")
                    );
                };

                transaction.onabort = () => {
                    db.close();
                    reject(
                        transaction.error ?? new Error("Saving was cancelled.")
                    );
                };
            })
    );
}

// Save an uploaded file, captured image, or pasted lecture notes.
export async function saveLibraryMaterial(
    payload: File | string,
    extractedText?: string
): Promise<LibraryMaterial> {
    const isText = typeof payload === "string";

    const name = isText ? "Pasted lecture notes" : payload.name;
    const mimeType = isText ? "text/plain" : payload.type;
    const size = isText ? new Blob([payload]).size : payload.size;

    const material: LibraryMaterial = {
        id: crypto.randomUUID(),
        name,
        type: getMaterialType(name, mimeType),
        mimeType,
        size,
        createdAt: new Date().toISOString(),
        category: "source",
        textContent: isText ? payload : (extractedText || undefined),
        ...(!isText ? { file: payload } : {}),
    };

    return addMaterial(material);
}

// Save an AI-generated summary, flashcards, quiz, or tutor conversation.
export async function saveGeneratedResource(
    input: GeneratedResourceInput
): Promise<LibraryMaterial> {
    const material: LibraryMaterial = {
        id: crypto.randomUUID(),
        name: input.title,
        type: input.resourceType,
        mimeType: "text/plain",
        size: new Blob([input.content]).size,
        createdAt: new Date().toISOString(),
        category: "generated",
        resourceType: input.resourceType,
        sourceMaterialId: input.sourceMaterialId,
        textContent: input.content,
    };

    return addMaterial(material);
}

// Get all saved original and generated materials.
export async function getLibraryMaterials(): Promise<LibraryMaterial[]> {
    const db = await openLibraryDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).getAll();

        request.onsuccess = () => {
            const materials = request.result as LibraryMaterial[];

            materials.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );

            resolve(materials);
        };

        request.onerror = () => {
            reject(request.error ?? new Error("Could not load your library."));
        };

        transaction.oncomplete = () => db.close();
        transaction.onerror = () => db.close();
    });
}

// Get one saved material by its ID.
export async function getLibraryMaterial(
    id: string
): Promise<LibraryMaterial | null> {
    const db = await openLibraryDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).get(id);

        request.onsuccess = () => {
            resolve((request.result as LibraryMaterial | undefined) ?? null);
        };

        request.onerror = () => {
            reject(request.error ?? new Error("Could not find this material."));
        };

        transaction.oncomplete = () => db.close();
        transaction.onerror = () => db.close();
    });
}

// Delete an original or generated material.
export async function deleteLibraryMaterial(id: string): Promise<void> {
    const db = await openLibraryDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");

        transaction.objectStore(STORE_NAME).delete(id);

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(
                transaction.error ?? new Error("Could not delete this material.")
            );
        };
    });
}