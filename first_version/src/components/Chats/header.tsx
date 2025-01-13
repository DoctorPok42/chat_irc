import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faThumbTack } from '@fortawesome/free-solid-svg-icons';

import styles from './style.module.scss';

interface HeaderChatsProps {
  isInfoOpen: boolean;
  setIsInfoOpen: (value: boolean) => void;
  conversationName: string;
  setIsSearchOpen?: (e: boolean) => void;
  setSearchState: (e: "message" | "user") => void;
  setEdit: (newName: string) => void;
}

const HeaderChats = ({
  isInfoOpen,
  setIsInfoOpen,
  conversationName,
  setIsSearchOpen,
  setSearchState,
  setEdit,
}: HeaderChatsProps) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(conversationName);

  const onEdit = () => {
    setIsEdit(false);
    setEdit(newName);
  }

  const handleSearchMessage = () => {
    setSearchState('message');
    setIsSearchOpen && setIsSearchOpen(true);
  }

  return (
    <div className={styles.header} onContextMenu={(e) => e.preventDefault()}>
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
          <h2 onClick={() => setIsEdit(true)}>{conversationName}</h2>
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
