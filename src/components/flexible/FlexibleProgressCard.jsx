import React from 'react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';

const FlexibleProgressCard = ({ 
  data,
  type = 'default',
  className = ''
}) => {
  // 调试日志
  console.log('ProgressCard received data:', data, 'type:', type);

  const getProgressValue = (value, total = 100) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const numTotal = typeof total === 'string' ? parseFloat(total) : total;
    
    if (isNaN(numValue) || isNaN(numTotal)) return 0;
    return (numValue / numTotal) * 100;
  };

  const getStatusColor = (status) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-500',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      low: 'bg-green-100 text-green-800 border-green-500',
      default: 'bg-gray-100 text-gray-800 border-gray-500'
    };
    return colors[status?.toLowerCase()] || colors.default;
  };

  const renderContent = () => {
    if (!data) return null;

    switch (type) {
      case 'progress':
        const percentage = getProgressValue(data.value, data.total);
        return (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>{data.name || data.title || ''}</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
            <Progress value={percentage} className="w-full" />
            {data.description && (
              <p className="text-sm text-gray-500">{data.description}</p>
            )}
          </div>
        );

      case 'status':
        return (
          <div className={`p-4 rounded-lg border-l-4 ${getStatusColor(data.level)}`}>
            <h3 className="font-medium">{data.title}</h3>
            <p className="mt-1 text-sm">{data.description}</p>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h3 className="font-medium">
              {data.name || data.title || '未命名项目'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {typeof data.value === 'object' 
                ? JSON.stringify(data.value, null, 2)
                : String(data.value || '')}
            </p>
            {data.description && (
              <p className="text-sm text-gray-500 mt-2">{data.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Card className={`w-full shadow-sm ${className}`}>
      {renderContent()}
    </Card>
  );
};

export default FlexibleProgressCard;