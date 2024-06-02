"use client"
import Button from '@/components/Home/common/Button'
import { HiPlus } from 'react-icons/hi'
import { LuPanelLeft } from 'react-icons/lu'
import { useAppContext } from '../AppContext'
import { MdLightMode, MdDarkMode,MdInfo } from 'react-icons/md'
import { type } from 'os'
import { ActionTypes } from '@/reducers/AppReducers'
import ChatList from './ChatList'
import { useEffect } from 'react'
import { useEventContext } from '../EventContext'
export default function Navbar() {
  const {state:{displayNav,theme},dispatch}=useAppContext()
  const {publish}=useEventContext()
  return (

    <nav className={`relative ${displayNav? '' : 'hidden'} dark flex flex-col h-full w-[260px] bg-gray-900 text-gray-300`}>
      <div className="flex space-x-4">
        <Button icon={HiPlus} variant='outline' className='flex-1'
        onClick={()=>{dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:null});
        // dispatch({type:ActionTypes.UPDATE,field:'messageList',value:[]})
        // publish('fetchChatList')
      }}
        >create</Button>
        <Button icon={LuPanelLeft} variant='outline' onClick={()=>{dispatch({type:ActionTypes.UPDATE,field:'displayNav',value:false})}}></Button>
      </div>
      <ChatList/>
      <div className='absolute bottom-0 left-0 right-0 bg-gray-800 flex p-2 justify-between'>
        <Button icon={theme==='dark'? MdDarkMode:MdLightMode} variant='text' onClick={()=>{dispatch({type:ActionTypes.UPDATE,field:'theme',value:theme==='light'?'dark':'light'})}}></Button>
        <Button icon={MdInfo} variant='text'></Button>
      </div>
    </nav >


  )
}
