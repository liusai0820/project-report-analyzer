import * as pdfjsLib from 'pdfjs-dist';

// 设置 worker
const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

const PDFService = {
  async readPDF(arrayBuffer) {
    try {
      if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
        throw new Error('无效的 PDF 文件数据');
      }

      // 等待 PDF 文档加载完成
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // 用于存储所有页面的文本内容
      let fullText = [];
      
      // 遍历所有页面并等待每一页的文本提取完成
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        // 获取页面
        const page = await pdfDoc.getPage(pageNum);
        // 获取页面文本内容
        const textContent = await page.getTextContent();
        // 将页面文本添加到数组中
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText.push(pageText);
      }
      
      // 合并所有页面的文本
      return fullText.join('\n');
    } catch (error) {
      console.error('PDF 解析错误:', error);
      throw new Error(`PDF 文件读取失败: ${error.message}`);
    }
  }
};

export default PDFService;