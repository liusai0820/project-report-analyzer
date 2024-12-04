// App.js - 保持核心逻辑
import React, { useState } from 'react';
import { FlexibleProjectDashboard } from './components/flexible';
import FileService from './services/fileService';
import DataTransformer from './services/dataTransformer';
import LLMService from './services/llmService';
import UploadInterface from './components/UploadInterface';

function App() {
  const [data, setData] = useState(null);

  // 将所有服务作为对象传递给 UploadInterface
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
          onDataReady={setData} 
        />
      ) : (
        <FlexibleProjectDashboard data={data} />
      )}
    </div>
  );
}

export default App;