const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

const LLMService = {
  validateLLMResponse: (data) => {
    console.log('正在验证响应数据:', data);
    return true; // 暂时放宽验证
  },

  cleanJSONString: (text) => {
    try {
      // 仅保留最外层的 JSON 对象
      let match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('未找到 JSON 对象');
        return '{}';
      }
      
      let jsonStr = match[0]
        .replace(/[\u0000-\u001F]+/g, '') // 使用 Unicode 转义序列来匹配控制字符
        .replace(/\\/g, '\\\\')           // 转义反斜杠
        .replace(/"\s*([^"]*?)\s*"/g, '"$1"') // 清理字符串内的空白
        .replace(/,(\s*[}\]])/g, '$1')    // 移除对象和数组末尾的逗号
        .replace(/null/g, '""')           // 将 null 替换为空字符串
        .replace(/undefined/g, '""')       // 将 undefined 替换为空字符串
        .replace(/NaN/g, '0')             // 将 NaN 替换为 0
        .replace(/'\s*([^']*?)\s*'/g, '"$1"'); // 将单引号替换为双引号

      // 验证是否为有效的 JSON
      JSON.parse(jsonStr);
      return jsonStr;
    } catch (error) {
      console.error('JSON 清理失败:', error);
      return '{}';
    }
  },

  parseJSONSafely: (text) => {
    try {
      // 先尝试清理 JSON 字符串
      const cleanedJSON = LLMService.cleanJSONString(text);
      const parsed = JSON.parse(cleanedJSON);
      
      // 确保基本结构存在
      return {
        projectInfo: {
          title: parsed.projectInfo?.title || '未命名项目',
          company: parsed.projectInfo?.company || '未知',
          location: parsed.projectInfo?.location || '未知',
          period: parsed.projectInfo?.period || '未知',
          investment: Number(parsed.projectInfo?.investment || 0)
        },
        progressIndicators: Array.isArray(parsed.progressIndicators) ? parsed.progressIndicators : [],
        researchProgress: Array.isArray(parsed.researchProgress) ? parsed.researchProgress : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        financialData: {
          flowDetails: Array.isArray(parsed.financialData?.flowDetails) ? parsed.financialData.flowDetails : []
        }
      };
    } catch (error) {
      console.error('JSON 解析失败:', error);
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
        financialData: { flowDetails: [] }
      };
    }
  },

  async analyzeContent(content) {
    if (!content) {
      throw new Error('输入内容为空');
    }

    try {
      console.log('开始分析内容');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'Project Report Analyzer'
        },
        body: JSON.stringify({
          model: "google/gemini-pro",
          messages: [{
            role: "user",
            content: this.generatePrompt(content)
          }],
          temperature: 0.2, 
          max_tokens: 10000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status}`);
      }

      const apiResponse = await response.json();
      if (!apiResponse.choices?.[0]?.message?.content) {
        throw new Error('API 返回数据格式不正确');
      }

      // 使用安全的解析方法处理返回数据
      const parsedData = this.parseJSONSafely(apiResponse.choices[0].message.content);
      console.log('解析后的数据:', parsedData);

      return parsedData;
    } catch (error) {
      console.error('处理错误:', error);
      return this.parseJSONSafely('{}'); // 返回默认数据结构
    }
  },

  generatePrompt: (content) => {
    return `请分析以下项目报告内容，并严格按照JSON格式返回数据。请注意：

任务要求：
1. 仔细阅读项目报告内容
2. 提取关键信息包括：项目基本信息、进度指标、研发进展、风险预警和资金流向
3. 将提取的信息转换为指定的 JSON 格式
4. 确保所有字符串使用双引号，数值不含单位
5. 确保输出的 JSON 格式完全符合以下模板结构
6. 建设地点要明确具体所处位置
7. 研发进度要根据项目实际进展情况估算进度值，尽量避免数值完全重复。
8. 流向分析需要包含三个层级：资金来源（包含政府资助资金或者叫专项资金、自筹资金）、一级科目、二级科目
9. 请注意不要将两类不同来源的资金数据混淆了，且只统计项目总体支出资金流向情况，不需要反映当前季度的支出情况
10. 一级科目、二级科目的识别应该要从科目序号/缩进的不同来动态识别。
11.每个资金流向必须包含具体金额，确保source到target的金额加总平衡,资金流向按财务会计准则进行分类


{
  "projectInfo": {
    "title": "项目名称",
    "company": "承担单位",
    "location": "实施地点",
    "period": "实施周期",
    "investment": "项目投资额"
  },
  "progressIndicators": [
    {
      "name": "研发进度",
      "value": 75,
      "total": 100
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
      "level": "high",
      "title": "风险名称",
      "description": "风险说明",
      "solution": "应对措施"
    }
  ],
  "financialData": {
    "flowDetails": [
      {
        "source": "专项资金",
        "primaryCategory": "设备购置",
        "target": "研发设备",
        "amount": 100.00
      }
    ]
  }
}

项目报告内容：${content}

注意事项：
1. 只返回 JSON 数据，不要包含任何其他文本
2. 数值必须是纯数字，不要包含单位
3. 资金金额保留两位小数
4. 百分比使用 0-100 的整数
5. 风险等级只能是 high、medium、low 之一`;

  }
};

export default LLMService;