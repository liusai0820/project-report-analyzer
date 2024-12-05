import React, { useState, useEffect } from 'react';
import { FlexibleProjectDashboard } from './components/flexible';
import FileService from './services/fileService';
import DataTransformer from './services/dataTransformer';
import LLMService from './services/llmService';
import UploadInterface from './components/UploadInterface';

// 新增：用于持久化存储的工具函数
const StorageService = {
  getData: () => {
    try {
      const savedData = localStorage.getItem('projectLensData');
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  setData: (data) => {
    try {
      localStorage.setItem('projectLensData', JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  clearData: () => {
    try {
      localStorage.removeItem('projectLensData');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

function App() {
  const [data, setData] = useState(() => StorageService.getData());
  const [isResetting, setIsResetting] = useState(false);

  // 当 data 变化时，保存到 localStorage
  useEffect(() => {
    if (data) {
      StorageService.setData(data);
    }
  }, [data]);

  const handleDataReady = (newData) => {
    setData(newData);
  };

  const handleReset = () => {
    setIsResetting(true);
    StorageService.clearData();
    setData(null);
    setIsResetting(false);
  };

  // 将所有服务作为对象传递
  const services = {
    FileService,
    LLMService,
    DataTransformer
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!data ? (
        <UploadInterface 
          services={services}
          onDataReady={handleDataReady}
          key={isResetting ? 'reset' : 'normal'} 
        />
      ) : (
        <div>
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
          <FlexibleProjectDashboard data={data} />
        </div>
      )}
    </div>
  );
}

export default App;