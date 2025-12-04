"use client";
import { TRPCProvider } from "../components/TRPCProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
