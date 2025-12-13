import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      discord?: unknown;
    } & DefaultSession["user"];
  }
}
