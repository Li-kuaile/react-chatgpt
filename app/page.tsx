"use client"
import Navbar from "@/components/Home/Navbar";
import Main from "@/components/Home/Main"
import { useAppContext } from "@/components/Home/AppContext";
export default function Home() {
  const {state:{theme}}=useAppContext()
  return (
    <main className={`${theme} h-full flex`}>
      <Navbar />
      <Main />
    </main>
  );
}
