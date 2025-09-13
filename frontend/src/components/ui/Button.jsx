import React from "react";
export default function Button({ children, className, ...props }) {
  // pass-through: look/spacing come ONLY from the className passed by the page
  return <button className={className} {...props}>{children}</button>;
}
