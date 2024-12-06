import _ from 'lodash';

const DataTransformer = {
  // 基础验证逻辑
  validateData: (data) => {
    if (!data) return false;

    // 基础数据结构验证
    if (!data.projectInfo) {
      data.projectInfo = {};
    }

    // 项目基本信息验证
    const defaultValues = {
      title: '未命名项目',
      company: '未设置',
      location: '未设置',
      period: '未设置',
      investment: 0
    };

    Object.keys(defaultValues).forEach(key => {
      data.projectInfo[key] = data.projectInfo[key] || defaultValues[key];
    });

    // 财务数据验证
    if (data.financialData?.flowDetails) {
      const validationResult = DataTransformer.validateFinancialData(
        data.financialData.flowDetails,
        data.projectInfo.investment
      );
      if (!validationResult.isValid) {
        console.warn('Financial data validation failed:', validationResult.errors);
        if (validationResult.errors.some(error => error.severity === 'high')) {
          return false;
        }
      }
    }

    // 其他数组字段验证
    data.progressIndicators = DataTransformer.validateProgressIndicators(data.progressIndicators);
    data.researchProgress = DataTransformer.validateResearchProgress(data.researchProgress);
    data.risks = DataTransformer.validateRisks(data.risks);

    return true;
  },

  // 财务数据验证函数
  validateFinancialData: (flowDetails, totalInvestment) => {
    const errors = [];
    
    // 1. 基础数据格式验证
    if (!Array.isArray(flowDetails)) {
      return {
        isValid: false,
        errors: [{ message: '财务流向数据格式错误', severity: 'high' }]
      };
    }

    // 2. 必要字段验证
    const requiredFields = ['source', 'primaryCategory', 'target', 'amount'];
    flowDetails.forEach((flow, index) => {
      requiredFields.forEach(field => {
        if (!flow[field] && flow[field] !== 0) {
          errors.push({
            message: `流向数据 #${index + 1} 缺少必要字段: ${field}`,
            severity: 'high'
          });
        }
      });

      // 金额格式验证
      if (isNaN(Number(flow.amount))) {
        errors.push({
          message: `流向数据 #${index + 1} 金额格式错误`,
          severity: 'high'
        });
      }
    });

    // 3. 数据一致性验证
    if (flowDetails.length > 0) {
      // 获取所有唯一的分类
      const uniqueSources = _.uniq(flowDetails.map(flow => flow.source));
      const uniquePrimaryCategories = _.uniq(flowDetails.map(flow => flow.primaryCategory));
      const uniqueTargets = _.uniq(flowDetails.map(flow => flow.target));

      // 检查分类层级关系是否合理
      if (uniqueSources.length === 0 || uniquePrimaryCategories.length === 0 || uniqueTargets.length === 0) {
        errors.push({
          message: '资金流向层级关系不完整',
          severity: 'high'
        });
      }

      // 计算各层级的资金总额
      const sourceTotals = _.mapValues(_.groupBy(flowDetails, 'source'), 
        flows => _.sumBy(flows, flow => Number(flow.amount)));
      const targetTotals = _.mapValues(_.groupBy(flowDetails, 'target'), 
        flows => _.sumBy(flows, flow => Number(flow.amount)));

      // 验证总金额是否平衡
      const totalSourceAmount = _.sum(Object.values(sourceTotals));
      const totalTargetAmount = _.sum(Object.values(targetTotals));

      // 允许 0.01 的误差
      if (Math.abs(totalSourceAmount - totalTargetAmount) > 0.01) {
        errors.push({
          message: `资金来源总额(${totalSourceAmount})与支出总额(${totalTargetAmount})不平衡`,
          severity: 'high'
        });
      }

      // 如果提供了总投资额，验证资金总额是否超出范围
      if (totalInvestment && totalSourceAmount > totalInvestment * 1.1) {
        errors.push({
          message: `资金流向总额(${totalSourceAmount})超出项目投资总额(${totalInvestment})`,
          severity: 'medium'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      stats: {
        flowCount: flowDetails.length,
        totalAmount: _.sumBy(flowDetails, flow => Number(flow.amount)),
        categories: {
          sources: _.uniq(flowDetails.map(flow => flow.source)),
          primary: _.uniq(flowDetails.map(flow => flow.primaryCategory)),
          targets: _.uniq(flowDetails.map(flow => flow.target))
        }
      }
    };
  },

  validateProgressIndicators: (indicators) => {
    if (!Array.isArray(indicators)) {
      return [];
    }

    return indicators.map(item => ({
      ...item,
      value: Math.min(Math.max(0, Number(item.value || 0)), 100),
      total: Number(item.total || 100)
    }));
  },

  validateResearchProgress: (progress) => {
    if (!Array.isArray(progress)) {
      return [];
    }

    return progress.map(item => ({
      ...item,
      title: item.title || '未命名进展',
      value: Math.min(Math.max(0, Number(item.value || 0)), 100),
      description: item.description || '暂无描述'
    }));
  },

  validateRisks: (risks) => {
    if (!Array.isArray(risks)) {
      return [];
    }

    return risks.map(risk => ({
      ...risk,
      level: ['high', 'medium', 'low'].includes(risk.level?.toLowerCase()) 
        ? risk.level.toLowerCase() 
        : 'medium',
      title: risk.title || '未命名风险',
      description: risk.description || '暂无描述',
      solution: risk.solution || '未设置应对措施'
    }));
  },

  cleanData: (data) => {
    if (data.financialData?.flowDetails) {
      // 确保每个流向的 source、target 是唯一的
      const seen = new Set();
      data.financialData.flowDetails = data.financialData.flowDetails.filter(flow => {
        const key = `${flow.source}-${flow.target}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    
    if (!data) return data;

    // 清理财务数据
    if (data.financialData?.flowDetails) {
      data.financialData.flowDetails = data.financialData.flowDetails.map(flow => ({
        ...flow,
        amount: Number(Number(flow.amount).toFixed(2)),
        source: String(flow.source).trim(),
        primaryCategory: String(flow.primaryCategory).trim(),
        target: String(flow.target).trim()
      }));
    }

    // 清理其他数据
    if (Array.isArray(data.progressIndicators)) {
      data.progressIndicators = data.progressIndicators.map(item => ({
        ...item,
        value: Math.min(Math.max(0, Number(item.value || 0)), 100),
        total: Number(item.total || 100)
      }));
    }

    if (Array.isArray(data.researchProgress)) {
      data.researchProgress = data.researchProgress.map(item => ({
        ...item,
        title: item.title || '未命名进展',
        value: Math.min(Math.max(0, Number(item.value || 0)), 100),
        description: item.description || '暂无描述'
      }));
    }

    if (Array.isArray(data.risks)) {
      data.risks = data.risks.map(risk => ({
        ...risk,
        level: ['high', 'medium', 'low'].includes(risk.level?.toLowerCase()) 
          ? risk.level.toLowerCase() 
          : 'medium',
        title: risk.title || '未命名风险',
        description: risk.description || '暂无描述',
        solution: risk.solution || '未设置应对措施'
      }));
    }

    return data;
  },

  async transformLLMOutput(llmOutput) {
    try {
      const data = typeof llmOutput === 'string' ? JSON.parse(llmOutput) : llmOutput;
      
      if (!this.validateData(data)) {
        console.warn('数据格式存在问题，已进行自动修复');
      }

      return this.cleanData(data);
    } catch (error) {
      console.error('数据转换错误:', error);
      return {
        projectInfo: {
          title: '解析失败',
          company: '未知',
          location: '未知',
          period: '未知',
          investment: 0
        },
        progressIndicators: [],
        researchProgress: [],
        risks: [],
        financialData: {
          flowDetails: []
        }
      };
    }
  }
};

export default DataTransformer;