import React, { useState } from 'react';
import { UnstyledButton } from './unstyled-button';
import { logo128B62White, logo128B64 } from './logo';

const hoverButtonSmallDefaults = {
  logoSize: 18,
  textSize: 14,
  buttonMinHeight: 40,
};
const hoverButtonMediumDefaults = {
  logoSize: 24,
  textSize: 18,
  buttonMinHeight: 46,
};
const hoverButtonLargeDefaults = {
  logoSize: 32,
  textSize: 24,
  buttonMinHeight: 56,
};

export interface ConnectButtonProps {
  size?: 'sm'|'md'|'lg'
  buttonStyle?: React.CSSProperties
  buttonBackground?: string
  buttonHoverBackground?: string
  buttonOutlineColor?: string
  buttonOutlineHoverColor?: string
  buttonMinHeight?: number
  buttonBorderRadius?: number
  buttonProps?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  logoContainerStyle?: React.CSSProperties
  logoSize?: number
  textContainerStyle?: React.CSSProperties
  textColor?: string
  textHoverColor?: string
  textSize?: number
  text?: string
  onClick?: () => void
}
export const ConnectButtonBase = (props: ConnectButtonProps) => {

  const {
    size = 'md',
  } = props;

  const defaultSizeProps = size === 'sm' ? hoverButtonSmallDefaults : size === 'lg' ? hoverButtonLargeDefaults : hoverButtonMediumDefaults;

  const {
    buttonStyle = {},
    buttonBackground = '#15181b',
    // buttonBackground = 'linear-gradient(to left, #1a2a43, #15181b)',
    buttonHoverBackground = '#1a7cd5',
    buttonOutlineColor = '#2c8ef8',
    buttonOutlineHoverColor = '#2c8ef8',
    buttonMinHeight = defaultSizeProps.buttonMinHeight,
    buttonBorderRadius = defaultSizeProps.buttonMinHeight / 2,
    buttonProps = {},
    logoContainerStyle = {},
    logoSize = defaultSizeProps.logoSize,
    textContainerStyle = {},
    textColor = '#ddd',
    textHoverColor = '#fff',
    textSize = defaultSizeProps.textSize,
    text = 'Connect to NodeWallet',
    onClick,
  } = props;

  const [ hovering, setHovering ] = useState<boolean>(false);
  const [ active, setActive ] = useState<boolean>(false);

  const onMouseOver = (e: React.MouseEvent) => {
    setHovering(true);
  };
  const onMouseOut = (e: React.MouseEvent) => {
    setHovering(false);
    setActive(false);
  };
  const onMouseDown = (e: React.MouseEvent) => {
    setActive(true);
  };
  const onMouseUp = (e: React.MouseEvent) => {
    setActive(false);
  };
  const onConnectClick = (e: React.MouseEvent) => {
    if(onClick) {
      onClick();
    }
  };

  return (
    <UnstyledButton
      {...buttonProps}
      onClick={onConnectClick}
      style={{
        ...styles.connectButton,
        ...buttonStyle,
        outlineColor: hovering ? buttonOutlineHoverColor : buttonOutlineColor,
        background: hovering ? buttonHoverBackground : buttonBackground,
        opacity: active ? 0.7 : 1,
        minHeight: buttonMinHeight,
        borderRadius: buttonMinHeight / 2,
      }}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div style={{
        ...styles.logoContainer,
        ...logoContainerStyle,
        width: logoSize,
        height: logoSize,
      }}>
        <img alt={'nw logo'} width={logoSize} height={logoSize} src={hovering ? logo128B62White : logo128B64}/>
      </div>
      <div style={{
        ...styles.textContainer,
        ...textContainerStyle,
        fontSize: textSize,
        color: hovering ? textHoverColor : textColor,
      }}>{text}</div>
    </UnstyledButton>
  );
};

const styles: { [key: string]: React.CSSProperties} = {
  connectButton: {
    outlineStyle: 'solid',
    outlineWidth: '1px',
    paddingLeft: 14.4,
    paddingRight: 14.4,
    paddingTop: 7.2,
    paddingBottom: 7.2,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 20,
  },
  logoContainer: {
    display: 'block',
  },
  textContainer: {
    paddingLeft: 8,
  },
};
