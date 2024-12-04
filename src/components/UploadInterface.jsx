import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Upload, FileText, CheckCircle2, Zap } from 'lucide-react';

const ProcessStep = ({ title, status, isLast }) => {
  const getLineStyle = () => {
    if (status === 'completed') return 'w-full';
    if (status === 'current') return 'w-1/2 transition-all duration-1000';
    return 'w-0';
  };

  return (
    <div className="flex-1">
      <div className="relative flex items-center justify-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
          status === 'completed' ? 'bg-blue-600 scale-100' :
          status === 'current' ? 'bg-blue-400 scale-110' :
          'bg-gray-200 scale-90'
        }`}>
          {status === 'completed' ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <div className={`w-6 h-6 rounded-full bg-white ${
              status === 'current' ? 'animate-pulse' : ''
            }`} />
          )}
        </div>
        {!isLast && (
          <div className="absolute left-[calc(50%+2rem)] w-[calc(100%-5rem)] h-2 bg-gray-200 overflow-hidden rounded-full">
            <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ${getLineStyle()}`} />
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <span className={`text-base font-medium transition-all duration-500 ${
          status === 'completed' ? 'text-blue-600 scale-105' :
          status === 'current' ? 'text-blue-400 scale-110' :
          'text-gray-400 scale-100'
        }`}>
          {title}
        </span>
      </div>
    </div>
  );
};

const UploadInterface = ({ services, onDataReady }) => {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);
  
  const steps = [
    '文件解析',
    '内容提取',
    '数据结构化',
    '可视化生成'
  ];

  // 文件处理相关函数保持不变...
  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return validTypes.includes(file.type);
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      setFile(file);
    } else {
      alert('请上传 PDF、Word 或 TXT 格式的文件');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const simulateMinimumTime = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      // 文件解析步骤
      setCurrentStep(0);
      const content = await services.FileService.readFile(file);
      await simulateMinimumTime(2000); // 确保至少显示2秒
      
      // 内容提取步骤
      setCurrentStep(1);
      const llmOutput = await services.LLMService.analyzeContent(content);
      await simulateMinimumTime(3000); // LLM处理通常较慢，至少显示3秒
      
      // 数据结构化步骤
      setCurrentStep(2);
      const transformedData = await services.DataTransformer.transformLLMOutput(llmOutput);
      await simulateMinimumTime(1500);
      
      // 可视化生成步骤
      setCurrentStep(3);
      await simulateMinimumTime(1500);
      
      onDataReady(transformedData);
    } catch (error) {
      console.error('Processing error:', error);
      alert(`处理过程中发生错误: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
    <div className="w-full max-w-7xl">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Zap className="w-16 h-16 text-blue-600" />
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              ProjectLens
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent ml-4 text-4xl">
              项目报告智能分析助手
            </span>
          </h1>
        </div>
        <p className="text-3xl text-gray-600 font-medium tracking-wide">
          让 AI 为您的项目报告生成清晰直观的可视化分析
        </p>
      </div>

        <Card className="p-16 bg-white/80 backdrop-blur shadow-xl rounded-3xl">
          <div
            className={`border-3 border-dashed rounded-2xl p-16 text-center mb-12 transition-all duration-300 ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50/50 scale-102 shadow-lg' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <Upload className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <p className="text-2xl text-gray-600 mb-4">
              {isDragActive ? '松开鼠标上传文件' : '拖拽文件到此处，或点击选择'}
            </p>
            <p className="text-base text-gray-500">
              支持 PDF、Word、TXT 格式文件
            </p>
          </div>

          {file && (
            <div className="mb-12 p-8 bg-gray-50 rounded-2xl flex items-center">
              <FileText className="w-12 h-12 text-blue-500 mr-6" />
              <div>
                <p className="text-xl font-medium text-gray-700">{file.name}</p>
                <p className="text-base text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {!isProcessing && file && (
            <button 
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xl font-medium rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleProcess}
            >
              开始智能分析
            </button>
          )}

          {isProcessing && (
            <div className="mt-16">
              <div className="flex justify-between items-start">
                {steps.map((step, index) => (
                  <ProcessStep
                    key={step}
                    title={step}
                    status={
                      index < currentStep ? 'completed' :
                      index === currentStep ? 'current' : 'pending'
                    }
                    isLast={index === steps.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UploadInterface;