
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
    Camera,
    ImageUp,
    TriangleAlert,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "../../lib/compressImage";

type Status =
    | "idle"
    | "starting"
    | "live"
    | "denied"
    | "unavailable";

type Props = {
    onSubmit: (file: File) => void;
};

const MAX_WIDTH = 1280;

export default function CameraPanel({ onSubmit }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fallbackRef = useRef<HTMLInputElement>(null);
    const previewUrlRef = useRef<string | null>(null);

    const [status, setStatus] = useState<Status>("idle");
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");

    function stopCamera() {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }

    function clearPhoto() {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }

        setPhoto(null);
        setPreviewUrl("");
        setError("");

        if (fallbackRef.current) {
            fallbackRef.current.value = "";
        }
    }

    function savePhoto(file: File) {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const url = URL.createObjectURL(file);

        previewUrlRef.current = url;
        setPreviewUrl(url);
        setPhoto(file);
        setError("");
    }

    // Clean up camera and preview resources on unmount.
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());

            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    // Attach the active camera stream to the video element.
    useEffect(() => {
        if (status === "live" && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [status]);

    async function startCamera() {
        setError("");

        if (!navigator.mediaDevices?.getUserMedia) {
            setStatus("unavailable");
            toast.error("Camera is not supported on this device.");
            return;
        }

        stopCamera();
        setStatus("starting");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } },
                audio: false,
            });

            streamRef.current = stream;
            setStatus("live");
            toast.success("Camera started successfully.");
        } catch (err) {
            const name = (err as DOMException).name;

            const denied =
                name === "NotAllowedError" ||
                name === "SecurityError";

            setStatus(denied ? "denied" : "unavailable");

            const message = denied
                ? "Camera permission denied. Please allow camera access."
                : "Unable to open your camera. Please try another option.";

            setError(message);
            toast.error(message);
        }
    }

    function takePhoto() {
        const video = videoRef.current;

        if (!video || !video.videoWidth || !video.videoHeight) {
            const message = "Camera is not ready yet. Please try again.";
            setError(message);
            toast.error(message);
            return;
        }

        const scale = Math.min(1, MAX_WIDTH / video.videoWidth);

        const canvas = document.createElement("canvas");

        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const context = canvas.getContext("2d");

        if (!context) {
            const message = "Unable to capture this image. Please try again.";
            setError(message);
            toast.error(message);
            return;
        }

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    const message = "Unable to create your photo. Please try again.";
                    setError(message);
                    toast.error(message);
                    return;
                }

                const capturedFile = new File(
                    [blob],
                    `note-${Date.now()}.jpg`,
                    { type: "image/jpeg" }
                );

                savePhoto(capturedFile);
                stopCamera();
                setStatus("idle");

                toast.success("Photo captured successfully!");
            },
            "image/jpeg",
            0.7
        );
    }

    async function handlePicked(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const input = event.target;
        const picked = input.files?.[0];

        input.value = "";

        if (!picked) return;

        if (!picked.type.startsWith("image/")) {
            const message = "Please select a valid image file.";
            setError(message);
            toast.error(message);
            return;
        }

        stopCamera();
        setStatus("idle");
        setError("");

        try {
            const compressed = await compressImage(picked);

            if (!compressed.type.startsWith("image/")) {
                throw new Error("Invalid image format.");
            }

            savePhoto(compressed);
            toast.success("Image uploaded and prepared successfully.");
        } catch {
            const message =
                "We couldn't process this image. Please try another photo.";

            setError(message);
            toast.error(message);
        }
    }

    function retake() {
        clearPhoto();
        startCamera();
    }

    function chooseAnotherPhoto() {
        clearPhoto();
        setStatus("idle");
        fallbackRef.current?.click();
    }

    function handleContinue() {
        if (!photo) {
            toast.error("Please capture or select a photo first.");
            return;
        }

        toast.info("Preparing your photo...");
        onSubmit(photo);
    }

    return (
        <div className="rounded-2xl bg-white p-4 sm:p-5">
            <input
                ref={fallbackRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePicked}
                className="hidden"
            />

            {/* Photo preview */}
            {photo && previewUrl && (
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Preview of your captured notes"
                            className="max-h-96 w-full rounded-xl object-contain"
                        />

                        <button
                            type="button"
                            onClick={clearPhoto}
                            aria-label="Remove selected photo"
                            className="absolute right-3 top-3 rounded-full bg-white p-2 text-gray-600 shadow-sm hover:text-red-600"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <p className="text-xs text-gray-500">
                        {(photo.size / (1024 * 1024)).toFixed(2)} MB · Ready to continue
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={retake}
                            className="rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-900 hover:bg-gray-200"
                        >
                            Retake
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            className="rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                        >
                            Continue
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={chooseAnotherPhoto}
                        className="w-full text-center text-sm font-medium text-gray-500 hover:text-teal-700"
                    >
                        Choose a different photo
                    </button>
                </div>
            )}

            {/* Initial camera selection */}
            {!photo && status === "idle" && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Camera size={22} />
                    </span>

                    <p className="font-semibold text-gray-900">
                        Take a photo of your notes
                    </p>

                    <p className="text-sm text-gray-500">
                        Capture handwritten or printed lecture materials.
                    </p>

                    <button
                        type="button"
                        onClick={startCamera}
                        className="mt-3 w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                        Open camera
                    </button>

                    <button
                        type="button"
                        onClick={() => fallbackRef.current?.click()}
                        className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-teal-700"
                    >
                        <ImageUp size={17} />
                        Choose a photo instead
                    </button>
                </div>
            )}

            {/* Camera loading */}
            {!photo && status === "starting" && (
                <div className="rounded-xl bg-gray-50 p-8 text-center">
                    <Camera
                        size={25}
                        className="mx-auto animate-pulse text-teal-600"
                    />
                    <p className="mt-3 text-sm text-gray-600">
                        Starting camera...
                    </p>
                </div>
            )}

            {/* Live camera */}
            {!photo && status === "live" && (
                <div className="space-y-3">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="max-h-96 w-full rounded-xl bg-black"
                    />

                    <button
                        type="button"
                        onClick={takePhoto}
                        className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                        <Camera size={17} className="mr-2 inline" />
                        Take photo
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            stopCamera();
                            setStatus("idle");
                        }}
                        className="w-full text-sm text-gray-500 hover:text-gray-800"
                    >
                        Cancel camera
                    </button>
                </div>
            )}

            {/* Camera permission or availability error */}
            {!photo &&
                (status === "denied" || status === "unavailable") && (
                    <div className="space-y-3 rounded-xl bg-orange-50 p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                <TriangleAlert size={20} />
                            </span>

                            <div>
                                <p className="font-semibold text-gray-900">
                                    {status === "denied"
                                        ? "Camera access is blocked"
                                        : "Camera is unavailable"}
                                </p>

                                <p className="mt-1 text-sm leading-5 text-gray-600">
                                    {status === "denied"
                                        ? "Allow camera access in your browser settings, or choose a photo from your device."
                                        : "We couldn't open a camera on this device. You can still choose an existing photo."}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => fallbackRef.current?.click()}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                        >
                            <ImageUp size={18} />
                            Choose a photo instead
                        </button>

                        <button
                            type="button"
                            onClick={startCamera}
                            className="w-full text-sm font-medium text-teal-700 hover:text-teal-800"
                        >
                            Try camera again
                        </button>
                    </div>
                )}

            {/* Image processing error */}
            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}