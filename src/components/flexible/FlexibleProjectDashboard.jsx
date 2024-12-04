import React from 'react';
import { Card } from '../ui/card';
import FlexibleProgressCard from './FlexibleProgressCard';
import FinancialSankey from './FinancialSankey';

const FlexibleProjectDashboard = ({ data }) => {
  const formatInvestment = (value) => {
    if (!value) return '未设置';
    return `总额 ${value} 万元（专项资金 ${Math.floor(value * 0.5)} 万元 + 自筹资金 ${Math.floor(value * 0.5)} 万元）`;
  };

  const renderHeader = () => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
        {data.projectInfo.title}
      </h1>
    </div>
  );

  const renderBasicInfo = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">项目基本信息</h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          <div className="flex flex-col">
            <span className="text-gray-500 mb-1">项目承担单位</span>
            <span className="text-lg font-medium">{data.projectInfo.company}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-1">项目建设地点</span>
            <span className="text-lg font-medium">{data.projectInfo.location}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-1">项目建设周期</span>
            <span className="text-lg font-medium">{data.projectInfo.period}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 mb-1">项目投资规模</span>
            <span className="text-lg font-medium">{formatInvestment(data.projectInfo.investment)}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  const calculateOverallProgress = () => {
    if (!data.researchProgress || data.researchProgress.length === 0) {
      return 0;
    }
    // 计算所有研究进展的平均值
    const totalProgress = data.researchProgress.reduce((sum, item) => sum + item.value, 0);
    return (totalProgress / data.researchProgress.length).toFixed(1);
  };

  const calculateFundingProgress = () => {
    if (!data.financialData?.flowDetails || data.financialData.flowDetails.length === 0) {
      return 0;
    }
    // 计算已使用的资金总额
    const totalSpent = data.financialData.flowDetails.reduce((sum, flow) => sum + flow.amount, 0);
    // 计算资金使用百分比（相对于总投资额）
    const totalInvestment = data.projectInfo.investment || 0;
    return totalInvestment > 0 ? ((totalSpent / totalInvestment) * 100).toFixed(1) : 0;
  };

  const renderProgressIndicators = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">进度指标</h2>
        <div className="grid grid-cols-2 gap-6">
          <FlexibleProgressCard
            data={{
              value: calculateOverallProgress(),
              name: "研发进度",
              description: "包含所有研发任务的综合完成进度"
            }}
            type="progress"
          />
          <FlexibleProgressCard
            data={{
              value: calculateFundingProgress(),
              name: "经费使用",
              description: "项目经费使用进度"
            }}
            type="progress"
          />
        </div>
      </div>
    </Card>
  );

  const renderFinancial = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">经费执行情况</h2>
        <div className="h-96">
          <FinancialSankey data={data.financialData} />
        </div>
      </div>
    </Card>
  );

  const renderResearchProgress = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">研究进展</h2>
        <div className="grid gap-6">
          {data.researchProgress?.map((progress, index) => (
            <FlexibleProgressCard
              key={index}
              data={{
                value: progress.value,
                name: progress.title,
                description: progress.description
              }}
              type="progress"
            />
          ))}
        </div>
      </div>
    </Card>
  );

  const renderRisks = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">风险预警</h2>
        <div className="grid gap-4">
          {data.risks?.map((risk, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                risk.level === 'high'
                  ? 'border-red-500 bg-red-50'
                  : risk.level === 'medium'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-green-500 bg-green-50'
              }`}
            >
              <h3 className="font-medium mb-2">{risk.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
              <div className="text-sm text-gray-600">
                <span className="font-medium">应对措施：</span>
                {risk.solution}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  if (!data) {
    return <div className="text-center py-8 text-gray-500">暂无数据</div>;
  }

  return (
    <div className="max-w-[1920px] mx-auto py-8 px-8">
      {renderHeader()}
      {renderBasicInfo()}
      {renderProgressIndicators()}
      {renderFinancial()}
      {renderResearchProgress()}
      {renderRisks()}
    </div>
  );
};

export default FlexibleProjectDashboard;