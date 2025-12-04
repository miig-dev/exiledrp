"use client";
import { trpc } from "../lib/trpcClient";

export default function TRPCDemo() {
  const { data, isLoading, error } = trpc.hello.useQuery({ name: "ExiledRP" });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return <div>{data?.greeting}</div>;
}
