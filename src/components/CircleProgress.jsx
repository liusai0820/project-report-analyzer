import React from 'react';
import FlexibleProgressCard from './flexible/FlexibleProgressCard';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CircleProgress = ({ value, title, total }) => {
  // 将原有属性转换为 FlexibleProgressCard 支持的格式
  const progressData = {
    value,
    total: 100, // 将百分比统一转换为 100 基准
    label: title,
    description: total,
    displayType: 'circle'
  };

  return (
    <FlexibleProgressCard 
      data={progressData}
      customRenderer={(data) => (
        // 保留原有的圆形进度条渲染逻辑
        <div className="flex flex-col items-center">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: data.value },
                    { value: 100 - data.value }
                  ]}
                  innerRadius={25}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <div className="text-lg font-bold">{data.value}%</div>
            <div className="text-sm text-gray-600">{data.label}</div>
            <div className="text-xs text-gray-400">{data.description}</div>
          </div>
        </div>
      )}
    />
  );
};

export default CircleProgress;