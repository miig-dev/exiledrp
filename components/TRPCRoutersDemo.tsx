"use client";
import { trpc } from "../lib/trpcClient";

export default function TRPCRoutersDemo() {
  const { data: animations } = trpc.animation.list.useQuery();
  const { data: jobs } = trpc.job.list.useQuery();
  const { data: emergencies } = trpc.emergency.list.useQuery();
  const { data: staff } = trpc.staff.list.useQuery();
  const { data: messages } = trpc.message.list.useQuery();
  const { data: logs } = trpc.log.list.useQuery();

  return (
    <div className="space-y-2 p-4">
      <div>Animations: {JSON.stringify(animations)}</div>
      <div>Jobs: {JSON.stringify(jobs)}</div>
      <div>Emergencies: {JSON.stringify(emergencies)}</div>
      <div>Staff: {JSON.stringify(staff)}</div>
      <div>Messages: {JSON.stringify(messages)}</div>
      <div>Logs: {JSON.stringify(logs)}</div>
    </div>
  );
}
