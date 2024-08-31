import React from 'react';
import { cn } from '../../lib/utils';

export const Label = ({ htmlFor, children, className, ...props }) => (
  <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-gray-700", className)} {...props}>
    {children}
  </label>
);