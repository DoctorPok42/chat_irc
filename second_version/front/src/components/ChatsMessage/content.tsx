import React from 'react';

import styles from './style.module.scss';

interface ContentMessageProps {
  message: {
    text: string
    sender: string
    options?: {
      isLink: boolean
    }
  }
  returnJustLink: (content: string) => { link: string, text: string}
  userId: string
}

const ContentMessage = ({
  message,
  returnJustLink,
  userId,
}: ContentMessageProps) => {
  return (
    <div className={styles.content}>
      {
        message.options?.isLink ?
          message.text.split(" ").map((e, index) => {
            const link = returnJustLink(e);
            return (
              <span key={e + index }>
                {link.link ? <>{" "}<a href={link.link} style={{
                  color: message.sender !== userId ? "#6b8afd" : "var(--dark-blue)",
                }} target="_blank" rel="noreferrer">{link.link}</a>{" "}</> : link.text}
              </span>
            )
          })
        :
          message.text
      }
    </div>
  );
};

export default ContentMessage;
