import React from 'react';

export const UnstyledButton = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) => {

  const style: React.CSSProperties = {
    background: 'none',
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    outline: 'inherit',
  };

  return (
    <button
      {...props}
      style={{...style, ...props.style}}
    >{props.children}</button>
  );
};
