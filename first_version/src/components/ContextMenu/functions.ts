const ContextMenuFunctions = (
  action: string,
  token: string,
  id: string,
  allMessages: any,
  conversations: any,
  setConversation: any,
  setAllMessages: any,
  updateMessage: (changedMessages?: any) => void,
  setInputBarMode: (arg: "chat" | "edit") => void,
  setInputBarValue: (arg: string) => void,
  emitEvent: any,
  messageIdHoverContextMenu: string | null,
  setCanHaveNewMessages: (arg: boolean) => void,
  authorId: string,
  setIsForceUnread: (arg: boolean) => void
) => {
  switch (action) {
    case "copy":
      const messageToCopy = allMessages.find(
        (e: { _id: string }) => e._id === messageIdHoverContextMenu
      )?.content;

      if (messageToCopy) {
        const el = document.createElement("textarea");
        el.value = messageToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      break;

    case "clink":
      const linkToCopy = window.location.href + `/${messageIdHoverContextMenu}`;

      if (linkToCopy) {
        const el = document.createElement("textarea");
        el.value = linkToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      break;

    case "edit":
      setInputBarMode("edit");
      setInputBarValue(
        allMessages.find(
          (e: { _id: string }) => e._id === messageIdHoverContextMenu
        )?.content
      );
      break;

    case "pin":
      emitEvent(
        "pinMessage",
        { token, conversationId: id, messageId: messageIdHoverContextMenu },
        (data: any) => {
          const conversationIndex = conversations.findIndex(
            (e: { _id: string }) => e._id === id
          );
          const newConversations = [...conversations];
          newConversations[conversationIndex].pinnedMessages = data.data;
          setConversation(newConversations);
        }
      );
      break;

    case "unread":
      emitEvent(
        "unreadMessage",
        { token, conversationId: id, messageId: messageIdHoverContextMenu },
        () => {
          const messageIndex = allMessages.findIndex(
            (e: { _id: string }) => e._id === messageIdHoverContextMenu
          );
          const newAllMessages = [...allMessages];

          newAllMessages[messageIndex].viewedBy = newAllMessages[
            messageIndex
          ].viewedBy.filter((e: string) => e !== authorId);

          for (let i = messageIndex + 1; i < newAllMessages.length; i++) {
            newAllMessages[i].viewedBy = newAllMessages[i].viewedBy.filter(
              (e: string) => e !== authorId
            );
          }
          setIsForceUnread(true);
          setCanHaveNewMessages(true);
          setAllMessages(newAllMessages);
        }
      );
      break;

    case "delete":
      emitEvent(
        "deleteMessage",
        { token, conversationId: id, messageId: messageIdHoverContextMenu },
        () => {
          setAllMessages(
            allMessages.filter(
              (e: { _id: string }) => e._id !== messageIdHoverContextMenu
            )
          );
          updateMessage(
            allMessages.filter(
              (e: { _id: string }) => e._id !== messageIdHoverContextMenu
            )
          );
        }
      );
      break;
  }
};

export default ContextMenuFunctions;
