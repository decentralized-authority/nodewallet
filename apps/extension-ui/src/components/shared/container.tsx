import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}
export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={`position-absolute top-0 bottom-0 start-0 end-0 d-flex flex-column justify-content-start overflow-hidden ${className || ''}`}>
      {children}
    </div>
  );
};
