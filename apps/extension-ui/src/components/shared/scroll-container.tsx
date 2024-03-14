import React from 'react';

interface ScrollContainerProps {
  children?: React.ReactNode;
  className?: string;
  overflow?: 'scroll'|'auto';
}
export const ScrollContainer = ({ children, className, overflow = 'auto'}: ScrollContainerProps) => {
  return (
    <div className={`position-absolute top-0 bottom-0 start-0 end-0 d-flex flex-column justify-content-start overflow-${overflow} ${className || ''}`}>
      {children}
    </div>
  );
};
