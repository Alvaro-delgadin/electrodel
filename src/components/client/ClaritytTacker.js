"use client";
import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
const projectId = "s5pfmfgfod";
export default function ClarityTracker() {
  useEffect(() => {
    Clarity.init(projectId);
  }, []);

  return null;
}
