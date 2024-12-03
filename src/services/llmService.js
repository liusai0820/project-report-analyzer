const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

const LLMService = {
  // 添加数据格式验证函数
  validateLLMResponse: (data) => {
    console.log('验证 LLM 响应数据：', data);
    
    const requiredFields = {
      projectInfo: ['title', 'company', 'location', 'period', 'investment'],
      progressIndicators: ['name', 'value', 'total'],
      researchProgress: ['title', 'value', 'description'],
      risks: ['level', 'title', 'description']
    };

    // 检查所有必需的部分是否存在
    for (const [section, fields] of Object.entries(requiredFields)) {
      console.log(`检查 ${section} 部分`);
      
      if (!data[section]) {
        console.error(`缺少 ${section} 部分`);
        return false;
      }

      // 检查数组类型的数据
      if (Array.isArray(data[section])) {
        if (data[section].length === 0) {
          console.error(`${section} 数组为空`);
          return false;
        }

        // 检查每个数组项的字段
        for (const item of data[section]) {
          const missingFields = fields.filter(field => !item[field]);
          if (missingFields.length > 0) {
            console.error(`${section} 中缺少字段:`, missingFields);
            return false;
          }
        }
      } 
      // 检查对象类型的数据
      else if (typeof data[section] === 'object') {
        const missingFields = fields.filter(field => !data[section][field]);
        if (missingFields.length > 0) {
          console.error(`${section} 中缺少字段:`, missingFields);
          return false;
        }
      }
    }

    return true;
  },

  async analyzeContent(content) {
    if (!content) {
      console.error('输入内容为空');
      throw new Error('内容不能为空');
    }

    try {
      console.log('开始分析内容，长度:', content.length);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'Project Report Analyzer'
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-sonnet",
          messages: [{
            role: "user",
            content: this.generatePrompt(content)
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API 响应错误:', errorData);
        throw new Error(`API 调用失败: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('LLM API 响应:', data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('API 返回格式错误:', data);
        throw new Error('API 返回数据格式不正确');
      }

      const responseContent = data.choices[0].message.content;
      console.log('LLM 返回的原始内容:', responseContent);

      // 提取 JSON 字符串
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('未找到 JSON 数据');
        throw new Error('未能提取到有效的 JSON 数据');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonMatch[0]);
        console.log('解析后的数据:', parsedData);
      } catch (error) {
        console.error('JSON 解析错误:', error);
        throw new Error('JSON 解析失败');
      }

      // 验证数据格式
      if (!this.validateLLMResponse(parsedData)) {
        console.error('数据格式验证失败');
        throw new Error('LLM 返回的数据格式不符合要求');
      }

      return parsedData;
    } catch (error) {
      console.error('LLM 处理错误:', error);
      throw error;
    }
  },

  generatePrompt: (content) => {
    const prompt = `请仔细分析以下项目报告内容，并严格按照指定的 JSON 格式返回关键信息。请确保：
    1. 所有必需字段都要填写
    2. 数值类型的字段必须是数字
    3. 所有数组至少包含一个元素
    4. 风险等级只能是 high/medium/low
    5. 如果报告中包含经费使用表格，请提取资金流向数据

    返回格式：
    {
      "projectInfo": {
        "title": "项目名称",
        "company": "承担单位",
        "location": "实施地点",
        "period": "实施周期",
        "investment": "投资金额"
      },
      "progressIndicators": [
        {
          "name": "指标名称",
          "value": 75,
          "total": "100"
        }
      ],
      "researchProgress": [
        {
          "title": "进展名称",
          "value": 80,
          "description": "详细说明"
        }
      ],
      "risks": [
        {
          "level": "high/medium/low",
          "title": "风险名称",
          "description": "风险说明"
        }
      ],
      "financialData": {
        "totalBudget": "总预算金额",
        "flowDetails": [
          {
            "source": "来源类别",
            "target": "使用科目",
            "amount": "金额",
            "category": "费用类别"
          }
        ],
        "budgetCategories": [
          {
            "name": "科目名称",
            "budget": "预算金额",
            "spent": "已支出金额",
            "remaining": "剩余金额"
          }
        ]
      }
    }

    请确保：
    1. 从经费使用表格中提取资金流向数据
    2. 保留原始金额数值，不要进行单位转换
    3. 识别主要支出类别和子类别的层级关系
    4. 标注资金流向的来源和去向
    
    项目报告内容：
    ${content}`;
    console.log('生成的提示词:', prompt);
    return prompt;
  }
};

export default LLMService;