import React from 'react';

const ProgressBar = ({ title, value, description }) => {
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-sm font-medium text-blue-600">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div 
          className="h-2 bg-blue-600 rounded-full" 
          style={{ width: `${value}%` }}
        />
      </div>
      {description && (
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
};

export default ProgressBar;