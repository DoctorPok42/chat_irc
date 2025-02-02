import ContentFileMessage from './content_file';
import ContentMessage from './content';
import FooterMessage from './footer';

import styles from './style.module.scss';

interface MessageProps {
  message: {
    _id: string
    text: string
    timestamp: Date
    sender: string
    img: string
    options?: {
      isLink: boolean
      isFile: boolean
      data?: { name: string, size: number, type: "image" | "video" | "audio" | "file" }
    }
    reactions?: { value: string, usersId: string[] }[]
    isTemp?: boolean
    type?: "client" | "server"
  }
  isGroup: boolean
  allMessages: any[]
  userId: string
  index: number
  handleAddReaction: (reaction: string) => void
  returnJustLink: (content: string) => { link: string, text: string }
  imagePreview: string | undefined
}

const Message = ({
  message,
  isGroup,
  allMessages,
  userId,
  index,
  handleAddReaction,
  returnJustLink,
  imagePreview,
}: MessageProps) => {
  return (
    <>
    {message.options?.data?.type.split("/")[0] !== "image" ?
        <div className={styles.ChatsMessage_content} style={{
            backgroundColor: message.sender !== userId ? "#ffffff" : "#3c73fb",
            paddingBottom: message.reactions ? ".5em" : "0.8em",
            ...message.sender !== userId && { boxShadow: "0 0 0 1px #e0e0e0" },
            color: message.sender !== userId ? "#000000" : "#ffffff",
          }}
        >
          <div className={styles.title} style={{
            marginBottom: isGroup ? "0.3em" : "0",
          }}>
            <span>
              {
                (allMessages[index - 1] && allMessages[index - 1].sender === message.sender) ? "" :
                  message.img
              }
            </span>
          </div>

          {message.options?.isFile ? (
            <ContentFileMessage message={message} />
          ) : (
            <ContentMessage message={message} returnJustLink={returnJustLink} userId={userId} />
          )}
          <FooterMessage message={message} handleAddReaction={handleAddReaction} userId={userId} />
        </div>
      :
        <div className={styles.ChatsMessage_content} style={{
          paddingTop: 0,
          paddingRight: 0,
          userSelect: "none",
        }}>
          <img src={imagePreview} alt="preview" className={styles.preview_image} />
          <FooterMessage message={message} handleAddReaction={handleAddReaction} userId={userId} />
        </div>
      }
    </>
  );
};

export default Message;
