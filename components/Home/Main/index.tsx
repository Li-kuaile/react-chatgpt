"use client"
import ChatInput from "./ChatInput"
import Menu from "./Menu"
import Welcome from "./Welcome"
import Messages from "./Messages"
import { useAppContext } from "../AppContext"
export default function Main() {
    const {state:{selectChat}}=useAppContext()
    return (
        <div className="flex-1 relative">
            <main className=" overflow-y-auto w-full h-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                <Menu />
                {
                    selectChat? <Messages /> : <Welcome/>
                }
                <ChatInput />
            </main>
        </div>
    )
}

