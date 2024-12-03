import React from 'react';
import CircleProgress from './CircleProgress.jsx';
import ProgressBar from './ProgressBar';
import RiskCard from './RiskCard';

const ProjectDashboard = ({ data }) => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* 项目基本信息 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{data.projectInfo.title}</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">承担单位：</span>
            <span className="text-gray-900">{data.projectInfo.company}</span>
          </div>
          <div>
            <span className="text-gray-500">实施地点：</span>
            <span className="text-gray-900">{data.projectInfo.location}</span>
          </div>
          <div>
            <span className="text-gray-500">实施周期：</span>
            <span className="text-gray-900">{data.projectInfo.period}</span>
          </div>
          <div>
            <span className="text-gray-500">总投资：</span>
            <span className="text-gray-900">{data.projectInfo.investment}</span>
          </div>
        </div>
      </div>

      {/* 进度指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {data.progressIndicators.map((indicator, index) => (
          <CircleProgress
            key={index}
            value={indicator.value}
            title={indicator.name}
            total={indicator.total}
          />
        ))}
      </div>

      {/* 研究进展 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">研究进展</h2>
        {data.researchProgress.map((progress, index) => (
          <ProgressBar
            key={index}
            title={progress.title}
            value={progress.value}
            description={progress.description}
          />
        ))}
      </div>

      {/* 风险预警 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">风险预警</h2>
        {data.risks.map((risk, index) => (
          <RiskCard
            key={index}
            level={risk.level}
            title={risk.title}
            description={risk.description}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;