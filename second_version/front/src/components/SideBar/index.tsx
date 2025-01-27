import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faComments } from '@fortawesome/free-solid-svg-icons';
import { Zoom } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import styles from './style.module.scss';

interface SideBarProps {
  path: string;
  phone?: string;
}

const NameTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: 'var(--black)',
      color: 'var(--white)',
      boxShadow: theme.shadows[1],
      fontSize: 13,
      fontFamily: 'Nunito, sans-serif',
      fontWeight: 600,
      tranform: 'scale(1.2)',
  },

  [`& .${tooltipClasses.arrow}`]: {
      color: 'var(--black)',
  },
}));

const SideBar = ({
  path,
  phone,
}: SideBarProps) => {
  const listButtons = [
    { name: 'All chats', path: '/chats', icon: faComments },
    { name: 'Dashboard', path: '/dashboard', icon: faChartSimple }
  ]

  return (
    <div className={styles.SideBar_container}>
      <div className={styles.content}>
        <div className={styles.logo} onClick={() => window.location.href = '/'}>
          <img src="/favicon.ico" alt="favicon" width={50} height={50} />
        </div>

        <div className={styles.list}>
          {listButtons.map((button, index) => (
            <NameTooltip
              key={button.name + index}
              title={button.name}
              placement="right"
              TransitionComponent={Zoom}
              TransitionProps={{ timeout: 100 }}
              arrow
            >
              <div key={button.name + index} className={styles.button} onClick={() => window.location.href = button.path} style={{
                color: path === button.path ? '#5ad27d' : '#8393a3',
              }}>
                <FontAwesomeIcon className={styles.icon} icon={button.icon} width={18} height={18} />
              </div>
            </NameTooltip>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.profile} onClick={() => window.location.href = '/me'} style={{
            transform: path === '/me' ? 'scale(1.1)' : 'scale(1)',
          }}>
            <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${phone}&radius=20&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&randomizeIds=true`} alt="favicon" width={50} height={50} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
