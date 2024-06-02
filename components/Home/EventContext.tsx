"use client"
import React from "react";

export type EventContextType=(data:any) => void

type EventContextProps={
    subscribe:(event:string,callback:EventContextType)=>void,//没有返回值（返回类型为 void）
    unsubscribe:(event:string,callback:EventContextType)=>void,
    publish:(event:string,data?:any)=>void
}
const EventContext=React.createContext<EventContextProps>(null!)
export function useEventContext(){
    return React.useContext(EventContext)
}
export default function EventContextProvider({children}:{children:React.ReactNode}){
    const [listeners,setListeners]=React.useState<Record<string,EventContextType[]>>({})
    const subscribe=React.useCallback((event:string,callback:EventContextType)=>{
        if(!listeners[event]){
            listeners[event]=[]
        }
        listeners[event].push(callback)
        setListeners(listeners)
    },[listeners])
    const unsubscribe=React.useCallback((event:string,callback:EventContextType)=>{
        const index=listeners[event].indexOf(callback)
        if(index>=0){
            listeners[event].splice(index,1)
            setListeners(listeners)
        }
    },[listeners])
    const publish=React.useCallback((event:string,data?:any)=>{
        if(listeners[event]){
            listeners[event].forEach(callback=>callback(data))
        }
    },[listeners])
    const contextValue=React.useMemo(()=>{return {subscribe,unsubscribe,publish}},[subscribe,unsubscribe,publish])
    return <EventContext.Provider value={contextValue}>{children}</EventContext.Provider>
}