import React, { useState } from 'react';
import { FlexibleProjectDashboard } from './components/flexible';
import FileService from './services/fileService';
import DataTransformer from './services/dataTransformer';
import LLMService from './services/llmService';

function App() {
  const [data, setData] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    try {
      const content = await FileService.readFile(uploadedFile);
      const llmOutput = await LLMService.analyzeContent(content);
      const transformedData = await DataTransformer.transformLLMOutput(llmOutput);
      setData(transformedData);
    } catch (error) {
      console.error('处理错误：', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!data ? (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">项目报告可视化</h1>
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
          </div>
        </div>
      ) : (
        <FlexibleProjectDashboard data={data} />
      )}
    </div>
  );
}

export default App;