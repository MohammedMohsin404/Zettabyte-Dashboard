// components/Card.tsx
import React from "react";

type CardProps = {
  title?: string;
  className?: string;
  children?: React.ReactNode;
};

export function Card({ title, className = "", children }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {children}
    </section>
  );
}
