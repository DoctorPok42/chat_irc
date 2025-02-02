import React from 'react';

import styles from './style.module.scss';

interface AuthorMessageProps {
  allMessages: any[]
  index: number
  message: {
    sender: string
    img: string
  }
  userId: string
  place: "left" | "right"
}

const AuthorMessage = ({
  allMessages,
  index,
  message,
  userId,
  place,
}: AuthorMessageProps) => {
  return (
    <div className={styles.ChatsMessage_author}>
      {(
        (place === "left" ? message.sender !== userId : message.sender === userId) && (allMessages[index + 1] && allMessages[index + 1].sender !== message.sender || !allMessages[index + 1])) &&
        <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${message.img}&radius=50&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&randomizeIds=true`} alt="userCardIcon" width={50} height={50} />
      }
    </div>
  );
};

export default AuthorMessage;
