import React from "react";
export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
