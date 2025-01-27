import React from 'react';
import AuthorMessage from './author';
import Message from './message';

import styles from './style.module.scss';

interface ChatsMessageProps {
  message: {
    _id: string
    content: string
    date: Date
    authorId: string
    img: string
    options?: {
      isLink: boolean
      isFile: boolean
      data?: { name: string, size: number, type: "image" | "video" | "audio" | "file" }
    }
    reactions?: { value: string, usersId: string[] }[]
    isTemp?: boolean
    viewedBy: string[]
    type?: "client" | "server"
  }
  isGroup: boolean
  allMessages: any[]
  userId: string
  index: number
  handleContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void
  setMessageIdHover: (e: string | null) => void
  handleAddReaction: (reaction: string) => void
  canHaveNewMessages: boolean
}

const ChatsMessage = ({
  message,
  isGroup,
  allMessages,
  userId,
  index,
  handleContextMenu,
  setMessageIdHover,
  handleAddReaction,
  canHaveNewMessages,
}: ChatsMessageProps) => {
  const isOtherMessage = allMessages[index + 1] && allMessages[index + 1].authorId === message.authorId;
  const isShowViewed = (!message.viewedBy?.includes(userId) && allMessages[index - 1]?.viewedBy?.includes(userId));

  const returnJustLink = (content: string): { link: string, text: string} => {
    const link = content.match(/(https?:\/\/[^\s]+)/g);
    if (!link) return { link: "", text: content };

    return { link: link[0], text: content.replace(link[0], "") };
  }

  let imagePreview;

  if (message.options?.data?.type.split("/")[0] === "image") {
    const fileBuffer = Buffer.from(message.content, "base64");
    const file = new File([fileBuffer], message.options.data.name, { type: message.options.data.type });
    imagePreview = URL.createObjectURL(file);
  }

  // Server message
  if (message.type?.includes("server")) {
    return (
      <h6 style={{
        color: "var(--blue)",
        fontSize: "0.8em",
        fontWeight: 1000,
        margin: "0.5em 0",
        textAlign: "center",
      }}>
        {message.content}
      </h6>
    );
  }

  return (
    <>
    {(isShowViewed && canHaveNewMessages) && (
      <div className={styles.ChatsMessage_viewed}>
        <span>new</span>
      </div>
    )}
    <div
      className={styles.ChatsMessage_container}
      style={{
        justifyContent: message.authorId !== userId ? "flex-start" : "flex-end",
        marginBottom: isOtherMessage ? "0.2em" : "1em",
      }}
      onContextMenu={(e) => handleContextMenu(e)}
      onMouseEnter={() => setMessageIdHover && setMessageIdHover(message._id)}
      onClick={(e) => {
        if (e.detail === 2)
          handleAddReaction("2764-fe0f");
      }}
    >

      <AuthorMessage allMessages={allMessages} index={index} message={message} userId={userId} place="left" />

      <Message
        message={message}
        isGroup={isGroup}
        allMessages={allMessages}
        userId={userId}
        index={index}
        handleAddReaction={handleAddReaction}
        returnJustLink={returnJustLink}
        imagePreview={imagePreview}
      />

      <AuthorMessage allMessages={allMessages} index={index} message={message} userId={userId} place="right" />
    </div>
    </>
  );
};

export default ChatsMessage;
