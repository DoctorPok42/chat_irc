import React, { useEffect, useState } from 'react';
import { SearchBar } from '..';
import emitEvent from '../../tools/webSocketHandler';
import UserCard from '../UserCard';
import ConversationCard from '../ConversationCard';
import { Skeleton } from '@mui/material';

import styles from './style.module.scss';

interface ContactProps {
  token: string;
  id?: string;
  conversations?: any[];
  setConversation?: (any: any) => void;
  userId: string;
  isLoading: boolean;
  showContact: boolean;
  setShowContact: (show: boolean) => void;
}

const Contact = ({
  token,
  id,
  conversations = [],
  setConversation,
  userId,
  isLoading,
  showContact,
  setShowContact,
}: ContactProps) => {
  const [userSearched, setUserSearched] = useState<{
    id: string
    phone: string,
    username: string | undefined
  }[]>([])
  const [search, setSearch] = useState<string>('')
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (search.length > 0) {
      setIsPopupOpen(true)
    } else {
      setIsPopupOpen(false)
    }
  }, [search])

  const onSearch = (search: string) => {
    setSearch(search.trim())
    if (search.trim().length < 1) {
      setUserSearched([])
      return
    }

    emitEvent("userSearch", { token, arg: search.trim() }, (data: any) => {
      if (data.status === "success") {
        let newUsers = data.data.map((e: any) => ({
          id: e.id,
          phone: e.phone,
          username: e.username
        }));
        newUsers = newUsers.filter((e: any) => e.id !== userId)
        setUserSearched(newUsers)
      }
      setLoading(false)
    })
  }

  const onChooseUser = (user: any) => {
    emitEvent("conversationsChoose", { token, userId: user.id }, (data: any) => {
      setUserSearched([])
      setIsPopupOpen(false)
      setSearch('')
      setConversation && setConversation([...conversations, data.data])
      window.location.href = `/chats/${data.data._id}`
    })
  }

  return (
    <div className={styles.Contact_container} onContextMenu={(e) => e.preventDefault()}>
      {/* <div className={styles.arrow} style={{
        transform: showContact ? 'rotate(0)' : 'rotate(180deg)',
        opacity: (!isLoading && id) ? 1 : 0,
      }}>
        <FontAwesomeIcon
          icon={faCircleChevronLeft}
          onClick={() => setShowContact(!showContact)}
          color='#7d7f92'
          width={25}
          height={25}
        />
      </div> */}

      <SearchBar onSearch={onSearch} showContact={showContact} setShowContact={setShowContact} clearSearch={search === ''} />

      <div className={styles.userSearched} style={{
        padding: isPopupOpen ? '0.6em 0.5em' : '0 0.5em',
        height: isPopupOpen ? 'auto' : '0',
        minHeight: isPopupOpen ? '5em' : '0',
      }}>
        {(userSearched.length < 1 && isPopupOpen && !loading) && <div className={styles.noUserFound}>
          <h2>😢 No user found!</h2>
        </div>}

        {userSearched.map((user, index) => (
          <UserCard key={index + user.id} user={user} onClick={() => onChooseUser(user)} />
        ))}
      </div>

      <div className={styles.conversations}>
        {(!isLoading && conversations) ? conversations.map((conversation, index) => (
          <ConversationCard key={index + conversation._id} id={id} conversation={conversation} onClick={() => window.location.href = `/chats/${conversation._id}`} showContact={showContact} />
        )) :
          Array(7).fill(0).map((_, index) => (
            <Skeleton
              key={index + "skeleton"}
              variant="rectangular"
              width="22em"
              height="100px"
              animation="wave"
              style={{
                borderRadius: '22px',
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default Contact;
