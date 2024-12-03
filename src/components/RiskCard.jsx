import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const RiskCard = ({ level, title, description }) => {
  const getColorClass = () => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'low':
        return 'bg-green-100 border-green-500 text-green-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border-l-4 ${getColorClass()}`}>
      <div className="flex items-center">
        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
};

export default RiskCard;