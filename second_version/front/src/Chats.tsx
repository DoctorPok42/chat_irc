import { useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import getToken from "./tools/getToken";
import { Chats, Command } from "./components";
import emitEvent from "./tools/webSocketHandler";

function App({ id }: { id: Readonly<string> }) {
  const [command, setCommand] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false)
  const [conversations, setConversations] = useState<any>([])

  // if (!conversations.map((conversation: any) => conversation._id).includes(id) && id)
  //   window.location.href = "/chats"

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [allMessages, setAllMessages] = useState<any>(null)
  const [firstTime, setFirstTime] = useState<boolean>(true)
  const [status, setStatus] = useState<string>("")
  const [showList, setShowList] = useState<any[]>([])
  const [activeList, setActiveList] = useState<boolean>(false)

  const mainRef = useRef<HTMLDivElement>(null)

  const { token, phone, userId } = getToken(new Cookies());

  const getConversations = async () => {
    emitEvent("getConversations", { token }, (data: any) => {
      const conversations = data.channel.map((conversation: any) => {
        return {
            _id: conversation._id,
            conversationType: conversation.type,
            name: conversation.name,
            links: [],
            files: [],
            pinnedMessages: [],
            membersId: conversation.users,
            createdAt: conversation.time,
            updatedAt: conversation.time,
            lastMessage: conversation.lastMessage,
            lastMessageAuthorId: conversation.lastMessageAuthorId,
            lastMessageId: conversation.lastMessageId,
            lastMessageDate: conversation.lastMessageDate,
        }
      })
      setConversations(conversations)
    })
  }

  const getAllMessages = async () => emitEvent("getAllMessages", { token }, async (data: any) => {
    if (data.messages === "All messages sent.")
      setAllMessages(data.data)
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        setCommand(true);
      } else if (event.key === "Escape") {
        setCommand(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    if (firstTime) {
      getConversations()
      getAllMessages()
      setFirstTime(false)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (allMessages && conversations) {
      setIsLoading(false)
    }
  }, [allMessages, conversations])

  const handleAction = (action: string) => {
    setStatus("")
    emitEvent(action.split(" ")[0].split("/")[1], { token , args: action.split(" ").slice(1).toString().trim() }, (data: any, error: any) => {
      if (error) {
        setStatus(error)
        setShowList([])
      } else {
        console.log(data)
        getConversations()
        getAllMessages()
        setStatus("Success")
        if (action.split(" ")[0].split("/")[1] === "delete" || action.split(" ")[0].split("/")[1] === "archive") {
          window.location.href = "/chats"
        }
        if (action.split(" ")[0].split("/")[1] === "list" || action.split(" ")[0].split("/")[1] === "users") {
          setShowList(data.data)
          setActiveList(true)
        }
      }

      setTimeout(() => {
        setStatus("")
      }, 3000)
    });
  }

  return (
    <main ref={mainRef} className="container">
      <Chats
        token={token}
        isConversation={id ? true : false}
        id={id}
        userId={userId || ""}
        isInfoOpen={isInfoOpen}
        setIsInfoOpen={setIsInfoOpen}
        conversations={conversations}
        setConversation={setConversations}
        getConversations={() => {}}
        isSearchOpen={false}
        setIsSearchOpen={() => {}}
        isLoading={isLoading}
        phone={phone || ""}
        messages={
          allMessages?.[id] ? allMessages[id] : []
        }
        setMessages={() => {}}
        files={[]}
        setFiles={() => {}}
      />

      {command && (
        <Command
          onAction={handleAction}
          status={status}
          showList={showList}
          activeList={activeList}
          setActiveList={setActiveList}
        />
      )}
    </main>
  );
}

export default App;
