import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListDots, faSearch, faThumbTack } from '@fortawesome/free-solid-svg-icons';

import styles from './style.module.scss';

interface HeaderChatsProps {
  isInfoOpen: boolean;
  setIsInfoOpen: (value: boolean) => void;
  conversationName: string;
  setIsSearchOpen?: (e: boolean) => void;
  setEdit: (newName: string) => void;
}

const HeaderChats = ({
  isInfoOpen,
  setIsInfoOpen,
  conversationName,
  setIsSearchOpen,
  setEdit,
}: HeaderChatsProps) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(conversationName);

  const onEdit = () => {
    setIsEdit(false);
    setEdit(newName);
  }

  const handleSearchMessage = () => setIsSearchOpen && setIsSearchOpen(true);

  return (
    <div className={styles.header} onContextMenu={(e) => e.preventDefault()}>
      <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${conversationName.toLowerCase()}&radius=50&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&randomizeIds=true`} alt="ConversationCardIcon" width={40} height={40} />
      <div className={styles.title}>
        {isEdit ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={onEdit}
            onKeyDown={(e) => e.key === 'Enter' && onEdit()}
            autoFocus
          />
        ) : (
            <button className={styles.editButton} onClick={() => setIsEdit(true)}>
              <h2>{conversationName}</h2>
            </button>
        )}
      </div>

      <div className={styles.headerActions}>
        <div className={styles.icon} onClick={handleSearchMessage}>
          <FontAwesomeIcon icon={faSearch} width={16} height={16} color='#7d7f92' />
        </div>

        <div className={styles.icon}>
          <FontAwesomeIcon icon={faThumbTack} width={16} height={16} color='#7d7f92' style={{
            transform: 'rotate(45deg)',
          }} />
        </div>

        <div className={styles.icon} onClick={handleSearchMessage}>
          <FontAwesomeIcon icon={faListDots} width={16} height={16} color='#7d7f92' />
        </div>

        {/* <div className={styles.info} onClick={() => setIsInfoOpen(!isInfoOpen)}>
          <img src="/sidebar.svg" alt="settings" width={5} height={5} style={{
            transform: isInfoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }} />
        </div> */}
      </div>
    </div>
  );
};

export default HeaderChats;
