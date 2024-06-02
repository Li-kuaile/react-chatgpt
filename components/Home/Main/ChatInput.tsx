import React from 'react'
import {MdRefresh} from'react-icons/md'
import Button from '../common/Button'
import {PiLightningFill,PiStopBold} from 'react-icons/pi'
import {FiSend} from 'react-icons/fi'
import TextareaAutoSize from 'react-textarea-autosize'
import { v4 as uuidv4 } from 'uuid'
import { Message } from "@/types/chat"
import {useAppContext} from '@/components/Home/AppContext'
import { ActionTypes } from '@/reducers/AppReducers'
import { useEventContext } from '../EventContext'
import { Chat } from '@prisma/client'
export default function ChatInput() {
  const [message, setMessage] = React.useState("");
  const {state:{messageList,currentModel,stream,selectChat},dispatch}=useAppContext()
  const stopRef =React.useRef(false)
  const chatIdRef = React.useRef<string>('')
  const {publish}=useEventContext()

  React.useEffect(() => {
    if(chatIdRef.current===selectChat?.id){
      return
    }
    chatIdRef.current=selectChat?.id ?? ''
    stopRef.current=true //切换对话时，停止上一个对话的推送
  }, [selectChat])

  async function createOrUpdateMessage(message: Message) {
    const response = await fetch("/api/message/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    })
    if (!response.ok) {
        console.log('error',response.statusText)
        return
    }
    const { data } = await response.json()
    if (!chatIdRef.current) {
        chatIdRef.current = data.message.chatId
        publish("fetchChatList")
        dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:{id:chatIdRef.current}})
    }
    return data.message
  }
  async function deleteMessage(id: string) {
    const response = await fetch(`/api/message/delete?id=${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) {
        console.log(response.statusText)
        return
    }
    const { code } = await response.json()
    return code === 0
  }

  async function resend(){
    // console.log(messageList)
    if(messageList.length && messageList[messageList.length-1].role==='assistant'){
      const resendData = await deleteMessage(messageList[messageList.length-1].id)
      if(!resendData){
        console.log('no resend data')
        return
      }
      dispatch({type:ActionTypes.REMOVE_MESSAGE,message:messageList[messageList.length-1]})
      
      messageList.splice(messageList.length-1,1)      
    }
      // 作用：将上一条消息删除，并将上一条消息的content作为当前消息的content，重新发送
      stopRef.current=false
      const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body : JSON.stringify({ message:messageList, model: currentModel })
    } )
      if(!response.ok){
        console.log('no response')
        return
      }
      if(!response.body){
        console.log('no body')
        return
      }
      const responseData :Message =await createOrUpdateMessage({
        id:'',
        role: 'assistant',
        content: '',
        chatId:chatIdRef.current,
        model:currentModel
      })
      dispatch({type:ActionTypes.ADD_MESSAGE,message:responseData})
      dispatch({type:ActionTypes.UPDATE,field:'stream',value:responseData.id} )
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let content=""
      while(!done){
        if(stopRef.current){
          stopRef.current=false
          break
        }
        const result = await reader.read()
        done = result.done
        const chunk = decoder.decode(result.value)
        content+=chunk
        dispatch({type:ActionTypes.UPDATE_MESSAGE,message:{...responseData,content}})
      }
      createOrUpdateMessage({ ...responseData, content })
      dispatch({type:ActionTypes.UPDATE,field:'stream',value:''} )
  }
  async function updateTitle(messageuser: Message) {
    const body: Chat={id:messageuser.chatId,title:messageuser.content,updateTime:new Date()}
    // console.log(body)
    const response = await fetch('/api/chat/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body :  JSON.stringify(body)
    } )
      if(!response.ok){
        console.log('no response')
        return
      }
      if(!response.body){
        console.log('no body')
        return
      }
      const {data} = await response.json()
      if(!data){
         dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:body})
          publish('fetchChatList')
      }
  }

  async function handleSubmit(){
    stopRef.current=false//切换对话时，如果没有停止上一个对话的推送的过程，要将之前置为true的重新置为false。保证每次切换对话时，都能正常停止上一个对话的推送
    const messageuser=await createOrUpdateMessage({
      id: '',
      role: 'user',
      content: message,
      chatId:chatIdRef.current,
      model:currentModel
    })
    
    const allmessages=messageList.concat([messageuser])
    dispatch({type:ActionTypes.ADD_MESSAGE,message:messageuser})
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body :  JSON.stringify({ message:allmessages, model: currentModel })
    } )
      if(!response.ok){
        console.log('no response')
        return
      }
      if(!response.body){
        console.log('no body')
        return
      }
      const responseData :Message =await createOrUpdateMessage({
        id: '',
        role: 'assistant',
        content: "",
        chatId:chatIdRef.current,
        model:currentModel
      })
      dispatch({type:ActionTypes.ADD_MESSAGE,message:responseData})
      dispatch({type:ActionTypes.UPDATE,field:'stream',value:responseData.id} )
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let content=""
      while(!done){
        if(stopRef.current){
          break
        }
        const result = await reader.read()
        done = result.done
        const chunk = decoder.decode(result.value)
        content+=chunk
        dispatch({type:ActionTypes.UPDATE_MESSAGE,message:{...responseData,content}})
      }
      createOrUpdateMessage({ ...responseData, content })
      dispatch({type:ActionTypes.UPDATE,field:'stream',value:''} )
      publish('fetchChatList')
      if(!selectChat?.title||selectChat?.title==='新对话'){
        // dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:{title:message}})
        updateTitle(messageuser)
      }
      setMessage('')
  }
  return (
    <div className='absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]'>
      <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4'>
        {
          stream!=='' &&
          <Button variant='primary' icon={PiStopBold} className='font-medium'
          onClick={()=>{stopRef.current=true;dispatch({type:ActionTypes.UPDATE,field:'stream',value:''} )}}>
          stop generate
        </Button>
        }
        {
          selectChat &&stream==='' && messageList.length>0 && <Button variant='primary' icon={MdRefresh} className='font-medium'
          onClick={()=>{resend()}}>
          regenerate
        </Button>
        }
        
        <div className='flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4'>
                    <div className='mx-3 mb-2.5'>
                        <PiLightningFill />
                    </div>
                    <TextareaAutoSize
                        className='outline-none flex-1 max-h-64 h-auto mb-1.5 bg-transparent text-black dark:text-white resize-none border-0'
                        placeholder='输入一条消息...'
                        rows={1}
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        
                    />
                    <Button
                        className='mx-3 !rounded-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed'
                        icon={FiSend}
                        variant='primary'
                        onClick={()=>handleSubmit()}
                        disabled={message.trim()===''||stream!==''}
                    />
        </div>
        <footer className='text-center text-sm text-gray-700 dark:text-gray-300 px-4 pb-6'>
          ©️{new Date().getFullYear()}&nbsp;{" "}
          <a
            className='font-medium py-[1px] border-b border-dotted border-black/60 hover:border-black/0 dark:border-gray-200 dark:hover:border-gray-200/0 animated-underline'
            href='https://li-kuaile.github.io/'
            target='_blank'
          >
            likuaile
          </a>
        </footer>
      </div>
    </div>
  )
}
