import React from 'react';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return <div style={{ color: 'red', marginBottom: '1rem' }}>{message}</div>;
};

export default ErrorMessage;