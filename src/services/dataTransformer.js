const DataTransformer = {
  validateData: (data) => {
    // 首先检查数据是否存在
    if (!data) {
      console.error('数据为空');
      return false;
    }

    // 确保所有必要的顶层属性都存在
    const requiredSections = ['projectInfo', 'progressIndicators', 'researchProgress', 'risks'];
    for (const section of requiredSections) {
      if (!data[section]) {
        console.error(`缺少${section}部分`);
        data[section] = section === 'projectInfo' ? {} : [];
      }
    }

    // 确保 projectInfo 至少有 title
    if (!data.projectInfo.title) {
      console.error('projectInfo 缺少 title');
      data.projectInfo.title = '未命名项目';
    }

    // 确保数组类型的字段为数组
    const arrayFields = ['progressIndicators', 'researchProgress', 'risks'];
    for (const field of arrayFields) {
      if (!Array.isArray(data[field])) {
        console.error(`${field} 不是数组类型`);
        data[field] = [];
      }
    }

    // 验证进度指标的值范围
    if (data.progressIndicators.length > 0) {
      data.progressIndicators = data.progressIndicators.map(item => ({
        ...item,
        value: item.value ? Math.min(Math.max(0, Number(item.value)), 100) : 0,
        total: item.total || 100
      }));
    }

    // 验证研究进展的值范围
    if (data.researchProgress.length > 0) {
      data.researchProgress = data.researchProgress.map(item => ({
        ...item,
        value: item.value ? Math.min(Math.max(0, Number(item.value)), 100) : 0,
        title: item.title || '未命名进展',
        description: item.description || '暂无描述'
      }));
    }

    // 验证风险评级
    if (data.risks.length > 0) {
      data.risks = data.risks.map(item => ({
        ...item,
        level: ['high', 'medium', 'low'].includes(item.level?.toLowerCase()) 
          ? item.level.toLowerCase() 
          : 'medium',
        title: item.title || '未命名风险',
        description: item.description || '暂无描述'
      }));
    }

    return true;
  },

  cleanData: (data) => {
    // 数据清洗逻辑保持不变
    return data;
  },

  async transformLLMOutput(llmOutput) {
    try {
      const data = typeof llmOutput === 'string' ? JSON.parse(llmOutput) : llmOutput;
      
      // 验证并修复数据
      if (!this.validateData(data)) {
        console.warn('数据格式存在问题，已进行自动修复');
      }

      return this.cleanData(data);
    } catch (error) {
      console.error('数据转换错误:', error);
      // 返回一个基本的数据结构而不是抛出错误
      return {
        projectInfo: { title: '数据解析失败' },
        progressIndicators: [],
        researchProgress: [],
        risks: []
      };
    }
  }
};

export default DataTransformer;