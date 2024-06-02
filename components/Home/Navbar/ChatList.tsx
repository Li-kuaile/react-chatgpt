
import React from "react"
import { Chat } from "../../../types/chat"
import ChatItem from "./ChatItem"
import { useEventContext } from "../EventContext"
import { useAppContext } from "../AppContext"
import { ActionTypes } from "@/reducers/AppReducers"
const time = ['今天', '昨天', '更早']

export default function ChatList() {
  // const [selected, setSelected] = React.useState<Chat>()
  const {state:{selectChat},dispatch}=useAppContext()
  const [chatList, setChatList] = React.useState<Chat[]>([])
  const {subscribe,unsubscribe} = useEventContext()
  const pageRef=React.useRef(1)
 
  async function fetchChatList(){
    const res = await fetch(`/api/chat/list?page=${pageRef.current}`,{method:'GET'})
    if(!res.ok){
      console.log('fetchChatList error')
      return
    }
    const {data} = await res.json()
    if(pageRef.current === 1){
      setChatList(data.list)
    }else{
      setChatList(chatList.concat(data.list))
    } 
  }
  React.useEffect(() => {
    fetchChatList()
  }, [])
  React.useEffect(() => {
      const callback:EventListener=()=>{
        pageRef.current=1
        fetchChatList()
        // console.log('fetchChatList')
      }
      subscribe('fetchChatList',callback)
      return () => {
        unsubscribe('fetchChatList',callback)
    }
  }
  , [])
  return (
    <div className='flex-1 mb-[58px] mt-2 flex flex-col overflow-y-auto'>
      {
        time.map((item, index) => {
          return (
            <div key={index} >
              <div className='sticky top-0 z-10 p-3 text-sm bg-gray-900 text-gray-500'>{item}
              </div>
              <ul>
                {
                  chatList.map((it) => {
                    const date = new Date(it.updateTime)
                    const day = date.getDate()
                    const today = new Date().getDate()
                    const yesterday = today - 1
                    // const last7days = today - 6
                    if(index===0){
                      return day === today && <ChatItem key={it.id} item={it} select={selectChat?.id === it.id} onSelected={(chat) => {dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:it})}} />
                    }
                    if(index===1){
                      return day === yesterday && <ChatItem key={it.id} item={it} select={selectChat?.id === it.id} onSelected={(chat) => dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:it})} />
                    }
                    if(index===2){
                      return day < yesterday && <ChatItem key={it.id} item={it} select={selectChat?.id === it.id} onSelected={(chat) => dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:it})} />
                    }
                  })
                }
              </ul>
            </div>
          )
        })
      }

    </div>
  )
}
