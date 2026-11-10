"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImageUp, TriangleAlert } from "lucide-react";

type Status = "idle" | "starting" | "live" | "denied" | "unavailable";

const MAX_WIDTH = 1280;

type Props = {
  onSubmit: (file: File) => void;
};

export default function CameraPanel({ onSubmit }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [photo, setPhoto] = useState<File | null>(null);

  const previewUrl = useMemo(
    () => (photo ? URL.createObjectURL(photo) : ""),
    [photo]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (status === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }

    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setStatus("live");
    } catch (err) {
      const name = (err as DOMException).name;
      setStatus(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : "unavailable"
      );
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPhoto(new File([blob], `note-${Date.now()}.jpg`, { type: "image/jpeg" }));
        stopCamera();
        setStatus("idle");
      },
      "image/jpeg",
      0.7
    );
  }

  function handlePicked(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (picked) {
      stopCamera();
      setStatus("idle");
      setPhoto(picked);
    }
    event.target.value = "";
  }

  function retake() {
    setPhoto(null);
    startCamera();
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <input
        ref={fallbackRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePicked}
        className="hidden"
      />

      {photo && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Your captured notes"
            className="w-full rounded-xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={retake}
              className="rounded-xl bg-gray-100 py-3 font-medium text-gray-900"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => onSubmit(photo)}
              className="rounded-xl bg-orange-600 py-3 font-medium text-white"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {!photo && status === "idle" && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Camera size={20} />
          </span>
          <p className="font-medium text-gray-900">Take a photo of your notes</p>
          <p className="text-sm text-gray-500">
            We will ask to use your camera.
          </p>
          <button
            type="button"
            onClick={startCamera}
            className="mt-2 w-full rounded-xl bg-orange-600 py-3 font-medium text-white"
          >
            Open camera
          </button>
          <button
            type="button"
            onClick={() => fallbackRef.current?.click()}
            className="text-sm text-gray-600 underline"
          >
            Or choose a photo
          </button>
        </div>
      )}

      {!photo && status === "starting" && (
        <p className="p-6 text-center text-sm text-gray-500">
          Starting camera...
        </p>
      )}

      {!photo && status === "live" && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl bg-black"
          />
          <button
            type="button"
            onClick={takePhoto}
            className="w-full rounded-xl bg-orange-600 py-3 font-medium text-white"
          >
            Take photo
          </button>
        </div>
      )}

      {!photo && (status === "denied" || status === "unavailable") && (
        <div className="space-y-3 rounded-xl bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <TriangleAlert size={20} />
            </span>
            <div>
              <p className="font-medium text-gray-900">
                {status === "denied"
                  ? "Camera access is blocked"
                  : "No camera found"}
              </p>
              <p className="text-sm text-gray-600">
                {status === "denied"
                  ? "To use the camera, tap the lock icon next to the web address, set Camera to Allow, then reload the page."
                  : "We could not open a camera on this device."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fallbackRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-gray-900"
          >
            <ImageUp size={18} />
            Choose a photo instead
          </button>
        </div>
      )}
    </div>
  );
}