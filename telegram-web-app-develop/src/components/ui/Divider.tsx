import { FC, CSSProperties } from 'react';

interface DividerProps {
  margin?: string;
  color?: string;
  style?: CSSProperties;
}

export const Divider: FC<DividerProps> = ({ 
  margin = '24px 0', 
  color = '#E6E9ED',
  style 
}) => {
  return (
    <div 
      style={{ 
        height: '1px',
        width: '100%',
        backgroundColor: color, 
        margin,
        ...style 
      }} 
    />
  );
};
