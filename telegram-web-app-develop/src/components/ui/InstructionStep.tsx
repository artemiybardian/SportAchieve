import { FC, ReactNode } from 'react';
import { Text } from './Typography';

interface InstructionStepProps {
  number: number;
  children: ReactNode;
}

export const InstructionStep: FC<InstructionStepProps> = ({ number, children }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
      <div
        style={{
          backgroundColor: '#68C6E0',
          height: '24px',
          width: '24px',
          borderRadius: '24px',
          color: 'white',
          marginRight: '17px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ fontFamily: 'SF Pro Display', fontWeight: '400', fontSize: '14px' }}>
          {number}
        </div>
      </div>
      <Text style={{ marginTop: '3px', flex: 1 }}>{children}</Text>
    </div>
  );
};
