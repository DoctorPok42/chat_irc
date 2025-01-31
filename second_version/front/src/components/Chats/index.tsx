import { useEffect, useState } from 'react';
import { Contact } from '..';
import HeaderChats from './header';
import InputBar from './inputBar';
import emitEvent from '../../tools/webSocketHandler';
import formatDate from '../../tools/formatDate';
import ChatsMessage from '../ChatsMessage';
import { socket } from '../../index';

import styles from './style.module.scss';

interface ChatsProps {
  token: string
  isConversation: boolean
  id?: any
  userId: string
  isInfoOpen?: boolean
  setIsInfoOpen?: (e: boolean) => void
  conversations: any[]
  setConversation: (e: any[]) => void
  getConversations?: () => void
  isSearchOpen?: boolean
  setIsSearchOpen?: (e: boolean) => void
  isLoading: boolean
  phone: string
  messages: any[]
  setMessages: (convId: string, messages: any[]) => void
  files: File[]
  setFiles: (e: File[]) => void
}

const initialContextMenu = {
  isOpen: false,
  x: 0,
  y: 0,
  e: null,
}

const Chats = ({
  token,
  isConversation,
  id,
  userId,
  isInfoOpen,
  setIsInfoOpen,
  conversations,
  setConversation,
  getConversations,
  isSearchOpen = false,
  setIsSearchOpen,
  isLoading,
  phone,
  messages,
  setMessages,
  files,
  setFiles,
}: ChatsProps) => {
  const [allMessages, setAllMessages] = useState<any[]>(messages)

  const [messageLoaded, setMessageLoaded] = useState<number>(0)
  const [userTyping, setUserTyping] = useState<string>("")
  const [contextMenu, setContextMenu] = useState(initialContextMenu)
  const [showContact, setShowContact] = useState<boolean>(true)

  const [messageIdHover, setMessageIdHover] = useState<string | null>(null)
  const [messageIdHoverContextMenu, setMessageIdHoverContextMenu] = useState<string | null>(null)
  const [inputBarMode, setInputBarMode] = useState<"chat" | "edit">("chat")
  const [inputBarValue] = useState<string>("")
  const [canHaveNewMessages, setCanHaveNewMessages] = useState<boolean>(true)
  const [isForceUnread] = useState<boolean>(false)
  const [lastReaction, setLastReaction] = useState<{ value: string, authorId: string[] }[] | null>(null)

  const updateMessage = (changedMessages?: any) => setMessages(id, changedMessages || allMessages)

  // catch ctrl + f, ctrl + k, ctrl + b
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            setIsInfoOpen && setIsInfoOpen(!isInfoOpen);
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (!(conversations[conversations.findIndex((e: any) => e._id === id) - 1])) return
            window.location.href = `/chats/${conversations[conversations.findIndex((e: any) => e._id === id) - 1]._id}`
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (!(conversations[conversations.findIndex((e: any) => e._id === id) + 1])) return
            window.location.href = `/chats/${conversations[conversations.findIndex((e: any) => e._id === id) + 1]._id}`
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen, isInfoOpen, id, conversations])

  const getMessages = async (nbMessages?: boolean) => {
    if (!id) return
    emitEvent("getMessages", { token, conversationId: id, messageLoaded: nbMessages ? 0 : messageLoaded }, (data: any) => {
      setAllMessages(data.data)
      updateMessage()
      setMessageLoaded(
        nbMessages ? 10 : messageLoaded + 10
      )
      setConversation(conversations.map(e => {
        if (e._id === id) {
          e.unreadMessages = 0
        }
        return e
      }))
    })
  }

  socket.on("message", (data: any) => {
    if (data.conversationsId === id) {
      setAllMessages([...allMessages, data])
      updateMessage([...allMessages, data])
    } else {
      const conversationIndex = conversations.findIndex(e => e._id === data.conversationsId)
      const newConversations = [...conversations]
      // newConversations[conversationIndex].unreadMessages++
      setConversation(newConversations)
    }
  })

  socket.on("isTypingUser", (data: any) => {
    setTimeout(() => {
      setUserTyping("")
    }, 3000)

    setUserTyping(data)
  })

  socket.on("reaction", (data: any) => {
    if (lastReaction && lastReaction === data.reaction) return
    if (data.conversationId !== id) return
    const messageIndex = allMessages.findIndex(e => e._id === data.messageId)

    const newAllMessages = [...allMessages]
    if (messageIndex === -1) return
    if (!newAllMessages[messageIndex]?.reactions)
      newAllMessages[messageIndex].reactions = []
    newAllMessages[messageIndex].reactions = data.reaction

    setLastReaction(data.reaction)
    setAllMessages(newAllMessages)
    updateMessage()
  })

  const conversationName = conversations?.find(e => e._id === id)?.name

  const sendFile = (file: File) => {
    let fileBuffer;
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)

    reader.onload = () => {
      fileBuffer = Buffer.from(reader.result as ArrayBuffer)
      const fileToSend = { name: file.name, type: file.type, size: file.size, buffer: fileBuffer }

      emitEvent("sendMessage", { token, conversationId: id, content: "", files: fileToSend }, (data: any) => {
        setAllMessages([...allMessages, data.data])
        updateMessage()
      })
    }
  }

  const onSend = (message: string) => {
    message = message.trim()
    if (!message && !files.length) return
    const tempId = Math.random().toString(36).substring(7)
    setAllMessages([...allMessages, { content: message, authorId: userId, img: phone, date: new Date().toISOString(), _id: `temp-${tempId}`, files, isTemp: true }])

    // Send files if there are some
    if (files.length > 0) {
      files.forEach(e => sendFile(e))
    } else {
      const isLink = message.match(/(https?:\/\/[^\s]+)/g);
      emitEvent("sendMessage", { token, conversationId: id, content: message, files: null, isLink }, (data: any) => {
        setAllMessages([...allMessages, {
          ...data.data,
          content: message,
        }])
        updateMessage([...allMessages, {
          ...data.data,
          content: message,
        }])
      })
    }
  }

  const onEdit = (message: string) => {
    message = message.trim()
    if (!message) return
    emitEvent("editMessage", { token, conversationId: id, messageId: messageIdHoverContextMenu, content: message }, () => {
        const messageIndex = allMessages.findIndex(e => e._id === messageIdHoverContextMenu)

        const newAllMessages = [...allMessages]
        newAllMessages[messageIndex].content = message
        setAllMessages([...allMessages])
        setInputBarMode("chat")
    })
  }

  const onAttach = (e: File[]) => {
    setFiles([...files, ...e]);
  }

  const onTyping = () => {
    emitEvent("isTyping", { token, conversationId: id })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  }

  const handleScroll = (e: any) => {
    const element = e.target
    if (element.scrollTop === 0) {
      getMessages()
    }
  }

  const conversationType = conversations?.find(e => e._id === id)?.conversationType === "group"

  const handleContextMenu = (e: any) => {
    e.preventDefault()

    setMessageIdHoverContextMenu(messageIdHover)
    const { pageX, pageY } = e

    let x = pageX
    let y = pageY

    if (window.innerWidth - pageX < 200) x = pageX - 200
    if (window.innerHeight - pageY < 270) y = pageY - 220

    setContextMenu({
      isOpen: true,
      x,
      y,
      e,
    })
  }

  const handleAddReaction = (reaction: string) => {
    emitEvent("addReaction", { token, conversationId: id, messageId: messageIdHover, reaction }, (data: any) => {
      const messageIndex = allMessages.findIndex(e => e._id === data.data.messageId)

      const newAllMessages = [...allMessages]
      if (!newAllMessages[messageIndex].reactions)
        newAllMessages[messageIndex].reactions = []
      newAllMessages[messageIndex].reactions = data.data.messageToUpdate.reactions

      setAllMessages(newAllMessages)
      updateMessage()
    })
  }

  const onChangeName = (newName: string) => {
    emitEvent("rename", { token, conversationId: id, newName }, (data: any) => {
      setConversation(conversations.map(e => {
        if (e._id === id) {
          e.name = newName
        }
        return e
      }))
    })
  }

  useEffect(() => {
    setAllMessages(messages)

    if (isForceUnread) return

    setTimeout(() => {
      emitEvent("viewMessage", { token, conversationId: id }, () => {
        setCanHaveNewMessages(false)
      })
    }, 5000)
  }, [messages])

  return (
    <div className={styles.Chats_container}>
      <div className={styles.contact_containerr}>
        <Contact
          token={token}
          id={id}
          conversations={conversations}
          setConversation={setConversation}
          userId={userId}
          isLoading={isLoading}
          showContact={showContact}
          setShowContact={setShowContact}
        />
      </div>

      {(isConversation && isInfoOpen !== undefined && setIsInfoOpen !== undefined) &&
        <div
          className={styles.Chats_content}
        >
          <HeaderChats
            isInfoOpen={isInfoOpen}
            setIsInfoOpen={setIsInfoOpen}
            conversationName={conversationName}
            setIsSearchOpen={setIsSearchOpen}
            setEdit={onChangeName}
          />

          <div className={styles.Chats_messages} onScroll={handleScroll} onLoad={() => {
              const element = document.querySelector(`.${styles.Chats_messages}`)
              if (element && allMessages.length === 20) {
                element.scrollTop = element.scrollHeight
              }
            }}
            onContextMenu={(e) => {e.preventDefault()}}
          >
            {(id && allMessages.length > 0) && allMessages.map((e: any, index: number) => {
              if (e === null) return
              if (allMessages[index - 1] && !isSameDay(new Date(e.date), new Date(allMessages[index - 1].date))) {
                return (
                  <div key={index + "date"} className={styles.Chats_date}>
                    <p>{formatDate(new Date(e.date), true)}</p>
                    <ChatsMessage
                      key={index + e._id}
                      message={e}
                      isGroup={conversationType}
                      userId={userId}
                      allMessages={allMessages}
                      index={index}
                      handleContextMenu={handleContextMenu}
                      setMessageIdHover={setMessageIdHover}
                      handleAddReaction={handleAddReaction}
                      canHaveNewMessages={canHaveNewMessages}
                    />
                  </div>
                )
              } else {
                return <ChatsMessage
                  key={index + e._id}
                  message={e}
                  isGroup={false}
                  userId={userId}
                  allMessages={allMessages}
                  index={index}
                  handleContextMenu={handleContextMenu}
                  setMessageIdHover={setMessageIdHover}
                  handleAddReaction={handleAddReaction}
                  canHaveNewMessages={canHaveNewMessages}
                />
              }
            })}
          </div>

          {userTyping && <div className={styles.Chats_typing}>
            <p><span>{userTyping}</span> is typing...</p>
          </div>}

          <div className={styles.Chats_end}>
            <InputBar
              files={files}
              onSend={onSend}
              onEdit={onEdit}
              onAttach={onAttach}
              onTyping={onTyping}
              setFiles={setFiles}
              mode={inputBarMode}
              setMode={setInputBarMode}
              value={inputBarValue}
            />
          </div>
        </div>
      }
    </div>
  );
};

export default Chats;
