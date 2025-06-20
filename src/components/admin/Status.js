"use client";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  SignalWifiStatusbarNotConnectedTwoTone,
  CheckCircleOutline,
  Error,
} from "@mui/icons-material";

export default function Status({ sync, error, loading }) {
  const [currentIcon, setCurrentIcon] = useState("sync");
  const icons = {
    success: CheckCircleOutline,
    error: Error,
    offline: SignalWifiStatusbarNotConnectedTwoTone,
    sync: CircularProgress,
  };
  const Icon = icons[currentIcon];
  const [message, setMessage] = useState("");
  const [offline, setOffline] = useState(null);

  useEffect(() => {
    window.addEventListener("online", () => setOffline(false));
    window.addEventListener("offline", () => setOffline(true));

    return () => {
      window.removeEventListener("online", () => setOffline(false));
      window.removeEventListener("offline", () => setOffline(true));
    };
  }, []);
  useEffect(() => {
    if (offline) {
      setCurrentIcon("offline");
      setMessage("Sin conexión");
    } else if (error) {
      setCurrentIcon("error");
      setMessage(error);
    } else if (sync && !error) {
      setCurrentIcon("sync");
      setMessage(sync);
    } else if (!sync && !error && !loading) {
      setCurrentIcon("success");
      setMessage("");
    }
  }, [offline, sync, error, loading]);
  return (
    <span
      style={{
        display: "flex",
        gap: "0.6rem",
        alignItems: "center",
        fontSize: "medium",
      }}
    >
      <Icon fontSize="medium" size={20} sx={{ color: "var(--font)" }} />
      <span>{message}</span>
    </span>
  );
}
