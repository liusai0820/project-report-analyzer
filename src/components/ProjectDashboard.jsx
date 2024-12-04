import React from 'react';
import { Card } from '../components/ui/card';
import FlexibleProgressCard from '../components/flexible/FlexibleProgressCard';
import FinancialSankey from '../components/flexible/FinancialSankey';

const FlexibleProjectDashboard = ({ data }) => {
  const formatInvestment = (amount) => {
    if (!amount) return '未设置';
    const total = Number(amount);
    const special = Math.round(total * 0.7); // 假设专项资金占 70%
    const self = total - special;
    return `总额 ${total} 万（专项 ${special} 万 + 自筹 ${self} 万）`;
  };

  // 格式化日期
  const formatDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year}年第${quarter}季度`;
  };

  const renderProjectHeader = () => (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {data.projectInfo?.title || '项目'}{formatDate()}进展情况
      </h1>
    </div>
  );

  const renderBasicInfo = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">项目基本信息</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">项目承担单位：</span>
            <span className="text-gray-900">{data.projectInfo?.company}</span>
          </div>
          <div>
            <span className="text-gray-500">项目建设地点：</span>
            <span className="text-gray-900">{data.projectInfo?.location}</span>
          </div>
          <div>
            <span className="text-gray-500">项目建设周期：</span>
            <span className="text-gray-900">{data.projectInfo?.period}</span>
          </div>
          <div>
            <span className="text-gray-500">项目投资：</span>
            <span className="text-gray-900">{formatInvestment(data.projectInfo?.investment)}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderProgress = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">进度指标</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">研发整体进度</h3>
            <FlexibleProgressCard
              data={{
                value: data.progressIndicators?.[0]?.value || 0,
                name: "研发进度",
                description: "包含所有研发任务的综合完成进度"
              }}
              type="progress"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">资金执行进度</h3>
            <FlexibleProgressCard
              data={{
                value: data.progressIndicators?.[1]?.value || 0,
                name: "经费使用",
                description: "项目经费使用进度"
              }}
              type="progress"
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderFinancial = () => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">经费执行情况</h2>
      <Card className="p-6">
        <FinancialSankey data={data.financialData} />
      </Card>
    </div>
  );

  const renderResearchProgress = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">研究进展</h2>
        <div className="space-y-6">
          {data.researchProgress?.map((progress, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <FlexibleProgressCard
                data={{
                  value: progress.value,
                  name: progress.title,
                  description: progress.description,
                }}
                type="progress"
                className="mb-2"
              />
              <p className="text-sm text-gray-600 mt-2">{progress.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderRisks = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">风险预警</h2>
        <div className="space-y-4">
          {data.risks
            ?.sort((a, b) => {
              const levelWeight = { high: 3, medium: 2, low: 1 };
              return levelWeight[b.level] - levelWeight[a.level];
            })
            .map((risk, index) => (
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
                <p className="text-sm">{risk.description}</p>
                <div className="mt-2 text-sm">
                  <span className="font-medium">应对措施：</span>
                  {risk.solution || '持续监控中...'}
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {renderProjectHeader()}
      {renderBasicInfo()}
      {renderProgress()}
      {renderFinancial()}
      {renderResearchProgress()}
      {renderRisks()}
    </div>
  );
};

export default FlexibleProjectDashboard;