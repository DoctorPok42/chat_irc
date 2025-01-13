import React, { useState } from 'react';
import { useClickAway } from "@uidotdev/usehooks";
import {
  faArrowCircleLeft,
  faArrowCircleRight,
  faCopy,
  faDownload,
  faLink,
  faPen,
  faRotateLeft,
  faThumbTack,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Zoom } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { Emoji, EmojiStyle } from 'emoji-picker-react';
import Picker from 'emoji-picker-react';

import styles from './style.module.scss';

interface ContextMenuProps {
  x: number
  y: number
  e: any
  closeContextMenu: () => void
  handleContextMenuAction: (action: string) => void
  handleAddReaction: (reaction: string) => void
  message: any
  userId: string
  // isMessagePin: boolean
  downloadFile: (fileId : string, name: string, type: string, content?: string) => void
}

const emojiStyleChoose = "google" as EmojiStyle;

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

const ContextMenu = ({
  x,
  y,
  e,
  closeContextMenu,
  handleContextMenuAction,
  handleAddReaction,
  message,
  userId,
  // isMessagePin,
  downloadFile,
}: ContextMenuProps) => {
  const ref = useClickAway(() => {
    closeContextMenu();
  }) as React.MutableRefObject<HTMLDivElement>;
  const [showPicker, setShowPicker] = useState(false);

  const handleDownloadFile = (message: any) => {
    if (!message.options?.data?.name) return;
    downloadFile(
      message.content + "." + message.options?.data?.type.split("/")[1],
      message.options?.data?.name,
      message.options?.data?.type,
      message.content
    )
  }

  const handleGetEmojiPosition = () => {
    const { pageX, pageY } = e;

    let x = 0;
    let y = 0;

    if (pageX > window.innerWidth - 600) x = 1
    if (pageY > window.innerHeight - 270) y = pageY - 882

    return { x, y }
  }

  const canEdit = message.authorId === userId && !message.options.isFile;

  const menuButtons = [
    ...canEdit ? [{ name: "Edit", value: "edit", icon: faPen }] : [],
    ...message.options.isFile ? [{ name: "Download", value: "download", icon: faDownload, action: () => handleDownloadFile(message) }] : [],
    { name: "More reactions", icon: handleGetEmojiPosition().x ? faArrowCircleLeft : faArrowCircleRight, action: () => setShowPicker(!showPicker)},
    // { name: isMessagePin ? "Unpin Message" : "Pin Message", value: "pin", icon: faThumbTack, angle: 45 },
    ...message.options.isFile ? [] : [{ name: "Copy Text", value: "copy", icon: faCopy }],
    { name: "Copy Message Link", value: "clink", icon: faLink },
    { name: "Mark Unread", value: "unread", icon: faRotateLeft, angle: 0 },
    ...message.authorId === userId ? [{ name: "Delete", value: "delete", icon: faTrash, color: true }] : [],
  ]

  const preSelectedReactions = [
    { name: ":+1:", icon: "1f44d" },
    { name: ":heart:", icon: "2764-fe0f"  },
    { name: ":joy:", icon: "1f602"  },
    { name: ":cry:", icon: "1f622"  }
  ]

  const handleAction = (action: string) => {
    handleContextMenuAction(action);
    closeContextMenu();
  }

  return (
    <div
      ref={ref}
      id="contextMenuChat"
      className={styles.ContextMenu_container}
      onContextMenu={(e) => {e.preventDefault()}}
      style={{
        top: `${y - 1}px`,
        left: `${x - 80}px`,
      }}
    >
      <div className={styles.ContextMenu_content}>
        <div className={styles.ContextMenu_reactions}>
          {preSelectedReactions.map((reaction, index) => (
            <NameTooltip
              key={reaction.icon + index}
              title={reaction.name}
              placement="top"
              TransitionComponent={Zoom}
              TransitionProps={{ timeout: 100 }}
              arrow
            >
              <div
                key={reaction.icon + index}
                className={styles.ContextMenu_button_reactions}
                onClick={() => handleAddReaction(reaction.icon)}
              >
                  <p>
                    <Emoji
                      unified={reaction.icon}
                      emojiStyle={emojiStyleChoose}
                      size={25}
                    />
                  </p>
              </div>
            </NameTooltip>
          ))}
        </div>

        {menuButtons.map((button, index) => (
          <div
            key={button.name + index}
            className={styles.ContextMenu_button}
            id={button.color ? styles.ContextMenu_button_red : styles.ContextMenu_button_blue}
            onClick={
              button.action
                ? button.action
                : () => handleAction(button.value)
            }
            style={{
              backgroundColor: showPicker && button.name === "More reactions" ? "var(--blue)" : "",
              color: showPicker && button.name === "More reactions" ? "var(--white)" : "",
            }}
          >
            <p
              id={button.color ? styles.ContextMenu_button_red : styles.ContextMenu_button_blue}
            >
              {button.name}
            </p>
            <FontAwesomeIcon
              icon={button.icon}
              id={button.color ? styles.ContextMenu_button_red : styles.ContextMenu_button_blue}
              width={16}
              height={16}
              style={
                button.angle
                  ? { transform: `rotate(${button.angle}deg)` }
                  : {}
              }
            />
          </div>
        ))}

        <Picker
          open={showPicker}
          onEmojiClick={(emoji) => handleAddReaction(emoji.unified)}
          theme={"dark" as any}
          emojiStyle={emojiStyleChoose}
          style={{
            backgroundColor: "var(--black)",
            position: "absolute",
            ...(handleGetEmojiPosition().y !== 0 ? { bottom: "-.45em" } : { top: "-.45em" }),
            ...(handleGetEmojiPosition().x ? { right: "-22.5em" } : { left: "13.5em" }),
            transform: `translateX(${x > window.innerWidth - 600 ? "-163.5%" : ""})`
          }}
          searchPlaceHolder='Find the perfect emoji...'
          lazyLoadEmojis
        />
      </div>
    </div>
  );
};

export default ContextMenu;
