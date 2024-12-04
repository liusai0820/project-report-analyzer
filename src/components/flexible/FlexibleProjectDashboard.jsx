import React from 'react';
import { Card } from '../ui/card';
import FlexibleProgressCard from '../flexible/FlexibleProgressCard';
import FinancialSankey from '../flexible/FinancialSankey';

const FlexibleProjectDashboard = ({ data }) => {
  // 格式化投资金额显示
  const formatInvestment = (value) => {
    if (!value) return '未设置';
    const total = parseInt(value);
    const special = Math.floor(total * 0.5); // 假设专项资金占比50%
    const selfRaised = total - special;
    return `总额 ${total} 万元（专项资金 ${special} 万元 + 自筹资金 ${selfRaised} 万元）`;
  };

  // 渲染页面标题
  const renderHeader = () => (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {data.projectInfo.title} {data.projectInfo.period}进展情况
      </h1>
    </div>
  );

  // 渲染基本信息
  const renderBasicInfo = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">项目基本信息</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <span className="text-gray-600 mr-2">项目承担单位：</span>
            <span>{data.projectInfo.company}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600 mr-2">项目建设地点：</span>
            <span>{data.projectInfo.location}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600 mr-2">项目建设周期：</span>
            <span>{data.projectInfo.period}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600 mr-2">项目投资规模：</span>
            <span>{formatInvestment(data.projectInfo.investment)}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  // 渲染进度指标
  const renderProgressIndicators = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">进度指标</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">研发整体进度</h3>
            <FlexibleProgressCard
              data={{
                value: 81.2,
                name: "研发进度",
                description: "包含所有研发任务的综合完成进度"
              }}
              type="progress"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">资金执行进度</h3>
            <FlexibleProgressCard
              data={{
                value: 75.5,
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

  // 渲染经费执行情况
  const renderFinancial = () => (
    <div className="mb-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">经费执行情况</h2>
        <div className="h-96">
          <FinancialSankey data={data.financialData} />
        </div>
      </Card>
    </div>
  );

  // 渲染研究进展
  const renderResearchProgress = () => (
    <Card className="mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">研究进展</h2>
        <div className="space-y-6">
          {data.researchProgress?.map((item, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-blue-600">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  // 渲染风险预警
  const renderRisks = () => {
    // 风险等级权重
    const riskWeight = { high: 3, medium: 2, low: 1 };
    
    // 排序风险
    const sortedRisks = [...(data.risks || [])].sort(
      (a, b) => riskWeight[b.level] - riskWeight[a.level]
    );

    return (
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">风险预警</h2>
          <div className="space-y-4">
            {sortedRisks.map((risk, index) => (
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
                <h3 className="font-semibold mb-2">{risk.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">应对措施：</span>
                  {risk.solution || '持续监控中...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  if (!data) {
    return <div className="text-center py-8 text-gray-500">暂无数据</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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