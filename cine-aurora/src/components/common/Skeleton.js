import React from 'react';
import './Skeleton.css';

export default function Skeleton({ type = 'text', className = '' }) {
  const classes = `skeleton ${type === 'card' ? 'skeleton-card' : type === 'title' ? 'skeleton-title' : 'skeleton-text'} ${className}`;
  return <div className={classes}></div>;
}
