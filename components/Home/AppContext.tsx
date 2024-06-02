"use client"
import { Action,State, initialState, reducer } from "@/reducers/AppReducers";
import React from "react";


type AppContextProps={
    state:State,
    dispatch:React.Dispatch<Action>
}
const AppContext=React.createContext<AppContextProps>(null!)
export function useAppContext(){
    return React.useContext(AppContext)
}
export default function AppContextProvider({children}:{children:React.ReactNode}){
    const [state,dispatch]=React.useReducer(reducer,initialState)
    const contextValue=React.useMemo(()=>({state,dispatch}),[state,dispatch])
    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}