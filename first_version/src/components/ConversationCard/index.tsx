import { useMemo } from 'react';
import formatDate from '../../tools/formatDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag, faShield, faShieldHeart } from '@fortawesome/free-solid-svg-icons';

import styles from './style.module.scss';

interface ConversationCardProps {
  id?: string;
  conversation: {
    _id: string;
    conversationType: 'private' | 'group';
    updatedAt: Date;
    lastMessage: string;
    lastMessageDate: Date;
    lastMessageAuthorId: string;
    name: string;
    unreadMessages: number;
  },
  onClick: () => void
  showContact: boolean
}

const ConversationCard = ({
  id,
  conversation,
  onClick,
  showContact,
}: ConversationCardProps) => {
  const formattedDate = useMemo(() => formatDate(new Date(conversation.lastMessageDate)), [conversation.lastMessageDate]);

  return (
    <div className={styles.ConversationCard_container} onClick={onClick} style={{
      backgroundColor: id === conversation._id ? '#3e4453' : 'transparent'
    }}>
      <div className={styles.img_Conv}>
        <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${conversation.name.toLowerCase()}&radius=22&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&randomizeIds=true`} alt="ConversationCardIcon" width={60} height={60} />
        <p>{conversation.conversationType === "private" && <FontAwesomeIcon id='test' icon={faShieldHeart} size="1x" color="#7d7f92" />}</p>
      </div>
      <div className={styles.userInfo}>
        {showContact && <div className={styles.title}>
          <h3>
            {conversation.name}
          </h3>
          <span>
            {formattedDate}
          </span>
        </div>}

        {showContact && <div className={styles.details}>
          <p>
            {conversation.lastMessage}
          </p>

          <div className={styles.notif}>
            {conversation.unreadMessages > 0 && <span>{
              conversation.unreadMessages > 99 ? '99+' : conversation.unreadMessages
              }</span>}
          </div>
        </div>}
      </div>
    </div>
  );
};

export default ConversationCard;
