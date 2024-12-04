import React from 'react';
import { Card } from '../ui/card';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

const MilestoneTimeline = ({ milestones }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Circle className="w-6 h-6 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">研发里程碑</h2>
      <div className="relative">
        {milestones.map((milestone, index) => (
          <div key={index} className="mb-8 flex items-start">
            <div className="flex-shrink-0 relative z-10">
              {getStatusIcon(milestone.status)}
              {index !== milestones.length - 1 && (
                <div className="absolute top-6 left-3 w-px h-full bg-gray-200" />
              )}
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                <span className="ml-2 text-sm text-gray-500">{milestone.date}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
              {milestone.achievements && (
                <div className="mt-2">
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {milestone.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              {milestone.status === 'delayed' && milestone.delayReason && (
                <div className="mt-2 text-sm text-red-500">
                  延迟原因：{milestone.delayReason}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MilestoneTimeline;