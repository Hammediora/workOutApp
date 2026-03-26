import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: process.env.DATABASE_URL?.includes("dummy") ? undefined : PrismaAdapter(db),
    providers: [Google],
    session: { strategy: "jwt" }
})
