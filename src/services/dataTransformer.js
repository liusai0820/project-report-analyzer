const DataTransformer = {
  validateData: (data) => {
    if (!data) return false;

    // 确保基础数据结构完整
    if (!data.projectInfo) {
      data.projectInfo = {};
    }

    // 确保必要字段存在
    data.projectInfo.title = data.projectInfo.title || '未命名项目';
    data.projectInfo.company = data.projectInfo.company || '未设置';
    data.projectInfo.location = data.projectInfo.location || '未设置';
    data.projectInfo.period = data.projectInfo.period || '未设置';
    data.projectInfo.investment = data.projectInfo.investment || 0;

    // 确保数组字段初始化
    data.progressIndicators = Array.isArray(data.progressIndicators) 
      ? data.progressIndicators 
      : [{
          name: '研发进度',
          value: 0,
          total: 100
        }, {
          name: '经费使用',
          value: 0,
          total: 100
        }];

    data.researchProgress = Array.isArray(data.researchProgress) 
      ? data.researchProgress 
      : [];

    data.risks = Array.isArray(data.risks) 
      ? data.risks 
      : [];

    return true;
  },

  cleanData: (data) => {
    // 清理和标准化数据
    if (data.progressIndicators) {
      data.progressIndicators = data.progressIndicators.map(item => ({
        ...item,
        value: Math.min(Math.max(0, Number(item.value || 0)), 100),
        total: Number(item.total || 100)
      }));
    }

    if (data.researchProgress) {
      data.researchProgress = data.researchProgress.map(item => ({
        ...item,
        title: item.title || '未命名进展',
        value: Math.min(Math.max(0, Number(item.value || 0)), 100),
        description: item.description || '暂无描述'
      }));
    }

    if (data.risks) {
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
        risks: []
      };
    }
  }
};

export default DataTransformer;