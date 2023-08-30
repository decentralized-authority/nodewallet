import React, { useEffect, useState } from 'react';
import MarkdownIt from 'markdown-it';
import { TOS_URL } from '../../constants';

export interface TosContainerProps {
  className?: string;
}
export const TosContainer = ({ className = '' }: TosContainerProps) => {

  const [ tos, setTos ] = useState('');
  useEffect(() => {
    fetch(TOS_URL)
      .then((response) => response.text())
      .then((text) => {
        const md = new MarkdownIt();
        setTos(md.render(text));
      })
      .catch((error) => console.error(error))
  }, []);

  return (
    <div className={`border w-100 position-relative ${className}`}>
      <div
        className={'ps-2 pe-2 top-0 bottom-0 start-0 end-0 position-absolute overflow-x-hidden overflow-y-scroll'}
        dangerouslySetInnerHTML={{__html: tos}}
      />
    </div>
  );
};
