import { Message,Chat } from "@/types/chat"
// import { Chat } from "@prisma/client"
export type State={
    displayNav:boolean
    theme:'light'|'dark'
    currentModel:string
    messageList:Message[]
    stream:string
    selectChat?:Chat
}
export enum ActionTypes{
    UPDATE='UPDATE',
    ADD_MESSAGE='ADD_MESSAGE',
    UPDATE_MESSAGE='UPDATE_MESSAGE',
    REMOVE_MESSAGE='REMOVE_MESSAGE'
}
type UpdateAction={
    type:ActionTypes.UPDATE
    field:string
    value:any
}
type MessageAction={
    type:ActionTypes.ADD_MESSAGE | ActionTypes.UPDATE_MESSAGE | ActionTypes.REMOVE_MESSAGE
    message:Message
}
export type Action=UpdateAction|MessageAction
export const initialState:State={
    displayNav:true,
    theme:'light',
    currentModel:'gpt-3.5-turbo',
    messageList:[],
    stream:""
}
export function reducer(state:State=initialState,action:Action):State{
    switch(action.type){
        case ActionTypes.UPDATE:
            return {...state,[action.field]:action.value}
            
        case ActionTypes.ADD_MESSAGE:
            return {...state,messageList:[...state.messageList,action.message]}
        case ActionTypes.UPDATE_MESSAGE:
            const messageList=state.messageList.map(message=>message.id===action.message.id?action.message:message)
            return {...state,messageList}
        case ActionTypes.REMOVE_MESSAGE:
            const messageListWithout=state.messageList.filter(message=>message.id!==action.message.id)
            return {...state,messageList:messageListWithout}
        default:
            throw new Error(`Unhandled action type`)
    }
}