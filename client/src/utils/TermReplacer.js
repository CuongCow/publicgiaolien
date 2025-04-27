import React from 'react';
import { replaceStationTerm } from './helpers';

/**
 * Component để thay thế từ "Trạm" với thuật ngữ đã cấu hình
 * Cách sử dụng: <TermReplacer>Trạm đã hoàn thành</TermReplacer>
 */
const TermReplacer = ({ children }) => {
  if (typeof children !== 'string') {
    console.warn('TermReplacer chỉ nên dùng với nội dung dạng chuỗi');
    return children;
  }

  return <>{replaceStationTerm(children)}</>;
};

export default TermReplacer; 