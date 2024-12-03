import mammoth from 'mammoth';
import PDFService from './pdfService';

const FileService = {
  validateFile: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!file) {
      throw new Error('请选择文件');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('仅支持 TXT、PDF、DOC、DOCX 格式文件');
    }
    
    if (file.size > maxSize) {
      throw new Error('文件大小不能超过10MB');
    }
    
    return true;
  },

  async readFile(file) {
    try {
      if (!file) {
        throw new Error('未选择文件');
      }

      switch (file.type) {
        case 'text/plain':
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file);
          });
          
        case 'application/pdf':
          const arrayBuffer = await file.arrayBuffer();
          if (!arrayBuffer) {
            throw new Error('PDF 文件内容为空');
          }
          const pdfText = await PDFService.readPDF(arrayBuffer);
          return pdfText;
          
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.readWord(file);
          
        default:
          throw new Error('不支持的文件格式');
      }
    } catch (error) {
      console.error('文件读取错误:', error);
      throw error;
    }
  },

  async readWord(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Word 文件读取错误:', error);
      throw new Error('Word 文件读取失败');
    }
  }
};

export default FileService;