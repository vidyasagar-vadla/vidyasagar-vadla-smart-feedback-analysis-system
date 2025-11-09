// src/components/Loader.jsx
import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}