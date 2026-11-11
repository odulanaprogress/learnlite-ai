
const MAX_WIDTH = 1280;
const QUALITY = 0.7;

export async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image.");
    }

    let bitmap: ImageBitmap | null = null;

    try {
        bitmap = await createImageBitmap(file);

        const scale = Math.min(1, MAX_WIDTH / bitmap.width);

        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Unable to process this image.");
        }

        context.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error("Image compression failed."));
                    }
                },
                "image/jpeg",
                QUALITY
            );
        });

        if (blob.size >= file.size) {
            return file;
        }

        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";

        return new File([blob], name, {
            type: "image/jpeg",
            lastModified: Date.now(),
        });
    } finally {
        bitmap?.close();
    }
}