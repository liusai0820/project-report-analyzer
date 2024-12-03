import React, { useState } from 'react';
import ProjectDashboard from './components/ProjectDashboard';
import { FlexibleProjectDashboard } from './components/flexible';
import FileService from './services/fileService';
import { mockData } from './mockData';
import DataTransformer from './services/dataTransformer';
import LLMService from './services/llmService';

function App() {
  const [data, setData] = useState(null);
  const [useFlexible, setUseFlexible] = useState(false);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    try {
      const content = await FileService.readFile(uploadedFile);
      const llmOutput = await LLMService.analyzeContent(content);
      const transformedData = await DataTransformer.transformLLMOutput(llmOutput);
      setData(transformedData);
    } catch (error) {
      alert(error.message);
      setData(mockData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!data ? (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">项目报告可视化</h1>
            <div className="space-y-4">
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                onClick={() => setData(mockData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                加载测试数据
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useFlexible"
                  checked={useFlexible}
                  onChange={(e) => setUseFlexible(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="useFlexible">使用新版灵活组件</label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {useFlexible ? (
            <FlexibleProjectDashboard data={data} />
          ) : (
            <ProjectDashboard data={data} />
          )}
          <div className="max-w-7xl mx-auto py-4 px-4">
            <button
              onClick={() => setData(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;