const DataTransformer = {
  validateData: (data) => {
    // 基本的必需字段检查
    const requiredFields = {
      projectInfo: ['title'], // 只保留最基本的必需字段
    };

    // 验证基本必需字段
    for (const [section, fields] of Object.entries(requiredFields)) {
      if (!data[section]) return false;
      if (!fields.every(field => data[section][field])) return false;
    }

    // 验证数组类型字段的数据格式
    const arrayFields = ['progressIndicators', 'researchProgress', 'risks'];
    for (const field of arrayFields) {
      if (data[field] && !Array.isArray(data[field])) return false;
    }

    // 验证数值范围（如百分比）
    const validatePercentage = (value) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 100;
    };

    // 检查进度指标的值
    if (data.progressIndicators) {
      if (!data.progressIndicators.every(item => validatePercentage(item.value))) {
        return false;
      }
    }

    // 检查研究进展的完成度
    if (data.researchProgress) {
      if (!data.researchProgress.every(item => validatePercentage(item.value))) {
        return false;
      }
    }

    // 检查财务数据的百分比
    if (data.financials?.expenses) {
      if (!data.financials.expenses.every(item => validatePercentage(item.percentage))) {
        return false;
      }
    }

    return true;
  },

  cleanData: (data) => {
    // 数据清洗逻辑
    if (data.progressIndicators) {
      data.progressIndicators = data.progressIndicators.map(item => ({
        ...item,
        value: Math.min(Math.max(0, Number(item.value)), 100) // 确保值在0-100之间
      }));
    }

    return data;
  },

  async transformLLMOutput(llmOutput) {
    try {
      const data = typeof llmOutput === 'string' ? JSON.parse(llmOutput) : llmOutput;
      
      if (!this.validateData(data)) {
        throw new Error('数据格式验证失败');
      }

      return this.cleanData(data);
    } catch (error) {
      console.error('数据转换错误:', error);
      throw error;
    }
  }
};

export default DataTransformer;