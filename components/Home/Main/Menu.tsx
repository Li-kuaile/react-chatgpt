"use client"
import Button from "../common/Button"
import { LuPanelLeft } from 'react-icons/lu'
import { useAppContext } from '../AppContext'
import { ActionTypes } from '@/reducers/AppReducers'
export default function Menu() {
    const {state:{displayNav},dispatch}=useAppContext()
  return (
    <Button icon={LuPanelLeft} variant='outline' className={`fixed top-2 left-2 ${displayNav?'hidden':''}`}
    onClick={()=>{dispatch({type:ActionTypes.UPDATE,field:'displayNav',value:true})}}></Button>
)
}
