import React from 'react';
import { Card } from '../ui/card';
import FlexibleProgressCard from './FlexibleProgressCard';
import FinancialSankey from './FinancialSankey';

const FlexibleProjectDashboard = ({ data }) => {
  console.log('Dashboard received data:', JSON.stringify(data, null, 2));

  const preprocessData = (rawData) => {
    if (!rawData) return null;

    const processProgressIndicators = (indicators) => {
      if (!Array.isArray(indicators)) return [];
      return indicators.map(indicator => ({
        ...indicator,
        value: typeof indicator.value === 'string' ? parseFloat(indicator.value) : indicator.value,
        total: indicator.total || 100
      }));
    };

    const processResearchProgress = (progress) => {
      if (!Array.isArray(progress)) return [];
      return progress.map(item => ({
        ...item,
        value: typeof item.value === 'string' ? parseFloat(item.value) : item.value,
        description: item.description || '暂无详细说明'
      }));
    };

    const processRisks = (risks) => {
      if (!Array.isArray(risks)) return [];
      return risks.map(risk => ({
        ...risk,
        level: (risk.level || 'medium').toLowerCase(),
        description: risk.description || '暂无风险说明'
      }));
    };

    return {
      ...rawData,
      progressIndicators: processProgressIndicators(rawData.progressIndicators),
      researchProgress: processResearchProgress(rawData.researchProgress),
      risks: processRisks(rawData.risks)
    };
  };

  const processedData = preprocessData(data);
  console.log('Processed dashboard data:', processedData);

  const dashboardConfig = {
    projectInfo: {
      title: '项目基本信息',
      type: 'info'
    },
    financialData: {
      title: '经费执行情况',
      type: 'financial'
    },
    progressIndicators: {
      title: '进度指标',
      type: 'progress',
      gridCols: 4
    },
    researchProgress: {
      title: '研究进展',
      type: 'progress'
    },
    risks: {
      title: '风险预警',
      type: 'status'
    }
  };

  const renderSection = (sectionData, sectionConfig) => {
    if (!sectionData) {
      console.log(`Section ${sectionConfig.title} data is missing`);
      return null;
    }

    const { title, type = 'grid', gridCols = 2 } = sectionConfig;

    // 对于财务数据部分使用特殊渲染
    if (type === 'financial') {
      return (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <FinancialSankey data={sectionData} />
        </div>
      );
    }

    // 其他类型的数据渲染
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`}>
          {Array.isArray(sectionData) ? (
            sectionData.map((item, index) => (
              <FlexibleProgressCard
                key={index}
                data={item}
                type={type}
              />
            ))
          ) : (
            <Card className="p-4">
              {Object.entries(sectionData).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="text-gray-500">{key}：</span>
                  <span className="text-gray-900">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value || '')}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    );
  };

  if (!processedData) {
    return <div className="text-center py-8 text-gray-500">暂无数据</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {Object.entries(dashboardConfig).map(([section, config]) => (
        <React.Fragment key={section}>
          {renderSection(processedData[section], config)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FlexibleProjectDashboard;