import { Chat } from '@/types/chat'
import { PiChatBold, PiTrashBold } from "react-icons/pi"
import { AiOutlineEdit } from "react-icons/ai"
import { MdDeleteOutline, MdCheck, MdClose } from "react-icons/md"
import React from "react"
import { useAppContext } from '../AppContext'
import { useEventContext } from '../EventContext'
import { ActionTypes } from '@/reducers/AppReducers'

type Props = {
    item: Chat
    select: boolean
    onSelected: (chat: Chat) => void
}

export default function ChatItem({ item, select, onSelected }: Props) {
    const [editing, setEditing] = React.useState(false)
    const [deleteItem, setDeleteItem] = React.useState(false)
    const [ishover, setHover] = React.useState(false)
    const [title, setTitle] = React.useState('')

    const { publish } = useEventContext()
    const { dispatch } = useAppContext()

    React.useEffect(() => {
        if (!ishover) {
            setEditing(false)
            setDeleteItem(false)
        }
    }, [select])
    // React.useEffect(() => {
    //     console.log('isHover:', ishover);
    //   }, [ishover]);

    async function update() {
        const response = await fetch('/api/chat/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: item.id, title: title })
        })
        if (!response.ok) {
            console.log('no response')
            return
        }
        if (!response.body) {
            console.log('no body')
            return
        }
        const { data } = await response.json()
        if (!data) {
            publish('fetchChatList', data)
        }
    }

    async function deleteChat() {
        const response = await fetch(`/api/chat/delete?id=${item.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (!response.ok) {
            console.log('no response')
            return
        }
        if (!response.body) {
            console.log('no body')
            return
        }
        const { data } = await response.json()
        if (!data) {
            publish('fetchChatList', data)
            dispatch({ type: ActionTypes.UPDATE, field: 'selectChat', value: null })
        }
    }

    return (
        <li key={item.id}
            className={`relative group flex p-3  items-center space-x-3  rounded-md cursor-pointer hover:bg-gray-700 ${select ? 'bg-gray-700 pr-[3.5em]' : ''}`}
            onClick={() => { onSelected(item) }}
            onMouseEnter={() => { setHover(true) }}
            onMouseLeave={() => { setHover(false) }}
        >
            <div>
                {
                    deleteItem ? <PiTrashBold /> : <PiChatBold />
                }
            </div>
            {
                editing ?
                    (<input
                        autoFocus={true}
                        className='flex-1 min-w-0 bg-transparent outline-none'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />)
                    :
                    (<div className=' relative flex-1 whitespace-nowrap overflow-hidden ml-2'>
                        {item.title}
                        <span className={`group-hover:from-gray-700 absolute right-0 inset-y-0 w-8  bg-gradient-to-l ${(select || ishover) ? 'from-gray-700' : 'from-gray-900'}`}></span>
                    </div>)
            }

            {(select || ishover) &&
                <div className='absolute right-1 flex'>
                    {
                        editing || deleteItem ? <>
                            <button className='p-1 hover:text-white'
                                onClick={(e) => {
                                    e.stopPropagation(); setEditing(false);
                                    // console.log(title)
                                    // dispatch({type:ActionTypes.UPDATE,field:'selectChat',value:{...item,title}})
                                    if (deleteItem) {
                                        setDeleteItem(false);
                                        // setDisplayItem(false);
                                        deleteChat();
                                    }
                                    if (title === '') {
                                        setTitle(item.title)
                                    }
                                    else
                                        update();
                                }}>
                                <MdCheck />
                            </button>
                            <button className='p-1 hover:text-white'
                                onClick={(e) => { e.stopPropagation(); setEditing(false); setDeleteItem(false) }}>
                                <MdClose />
                            </button>
                        </>
                            :
                            <>
                                <button className='p-1 hover:text-white'
                                    onClick={(e) => { e.stopPropagation(); onSelected(item); setEditing(true); }}>
                                    <AiOutlineEdit />
                                </button>
                                <button className='p-1 hover:text-white'
                                    onClick={(e) => { e.stopPropagation(); setDeleteItem(true) }}>
                                    <MdDeleteOutline />
                                </button>
                            </>
                    }

                </div>
            }
        </li>
    )
}