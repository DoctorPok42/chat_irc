import React from 'react';

import styles from './style.module.scss';

interface UserCardProps {
  user: {
    id: string
    phone: string,
    username: string | undefined
  }
  onClick: () => void
}

const UserCard = ({
  user,
  onClick,
}: UserCardProps) => {
  return (
    <div className={styles.UserCard_container} onClick={onClick}>
      <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${user.username?.toLocaleLowerCase()}&radius=22&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&randomizeIds=true`} alt="userCardIcon" width={60} height={60} />
      <div className={styles.userInfo}>
        {user.username && <p>{user.username}</p>}
        <p>{user.phone.replace(/(\d{2})(?=\d)/g, "$1 ")}</p>
      </div>
    </div>
  );
};

export default UserCard;
