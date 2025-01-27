import { useState } from 'react';

import styles from './style.module.scss';

interface CommandProps {
  onAction: (action: string) => void;
  status: string;
  showList: any[];
  activeList: boolean;
  setActiveList: (value: boolean) => void;
}

const Command = ({
  onAction,
  status,
  showList,
  activeList,
  setActiveList,
}: CommandProps) => {
  const [inputValue, setInputValue] = useState<string>('/');

  const commandList = [
    {
      name: '/nick <nickename>',
      description: 'Change your nickname',
    },
    {
      name: '/list [string]',
      description: 'List the avaible channels from the server. If a string is provided, it will filter the channels by the string',
    },
    {
      name: '/create <name>',
      description: 'Create a new channel with the provided name',
    },
    {
      name: '/delete <name>',
      description: 'Delete a channel with the provided name',
    },
    {
      name: '/join <name>',
      description: 'Join a channel with the provided name',
    },
    {
      name: '/quit <name>',
      description: 'Quit a channel with the provided name',
    },
    {
      name: '/users',
      description: 'List the users on the current channel',
    },
    {
      name: '/msg <nickename> <message>',
      description: 'Send a private message to a user on the current channel',
    }
  ]

  const handleFilter = (value: string) => {
    if (!value.startsWith('/')) return [];
    return commandList.filter(command => command.name.includes(value)) &&
      commandList.filter(command => command.name.includes(value.split(' ')[0]))
  }

  const changeInput = (value: string) => {
    if (showList.length > 0 || activeList) {
      setActiveList(false)
    }
    if (value.length === 0) {
      setInputValue('/')
    } else {
      setInputValue(value)
    }
  }

  return (
    <div className={styles.Command_container}>
      <div className={styles.content}>
        <div className={styles.title}>
          <h1>Command Panel</h1>
          {status && <p style={{
            backgroundColor: status === 'Success' ? 'var(--green)' : 'var(--red)',
          }}>{status}</p>}
        </div>

        <div className={styles.body}>
          <div className={styles.input}>
            <input
              type="text"
              placeholder="Type a command by '/'"
              autoFocus
              value={inputValue}
              onChange={(e) => changeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAction(inputValue)
                  setInputValue('/')
                }
              }}
            />
          </div>

          <div className={styles.list}>
            <ul>
              {!activeList ? handleFilter(inputValue).map((command, index) => (
                <li
                  key={index + command.name}
                  className={styles.item}
                  onClick={() => setInputValue(command.name.split(' ')[0] + ' ')}
                  style={{
                    borderBottom: index === handleFilter(inputValue).length - 1 ? 'none' : '1px solid var(--gray)'
                  }}
                >
                  <span>{command.name}</span>
                  <p>{command.description}</p>
                </li>
              )) : showList.length > 0 ? (
                showList.map((item, index) => (
                  <li key={index + showList.length} className={styles.item}>
                    <span>{item.name || item.username}</span>
                  </li>
                ))
              ) : (
                <li className={styles.item}>
                  <span>No results</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Command;
