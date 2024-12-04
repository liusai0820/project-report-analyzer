import React, { useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Button } from "../ui/button";
import { useState } from 'react';

const FinancialFlowChart = ({ data }) => {
  const [layout, setLayout] = useState('vertical');
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes, links } = useMemo(() => {
    if (!data?.flowDetails) return { nodes: [], links: [] };

    // 按层级收集节点
    const levelMap = {
      source: new Set(),    // 资金来源
      primary: new Set(),   // 一级科目
      secondary: new Set()  // 二级科目
    };

    // 第一遍遍历，收集所有节点
    data.flowDetails.forEach(flow => {
      levelMap.source.add(flow.source);
      levelMap.primary.add(flow.primaryCategory || '其他');
      levelMap.secondary.add(flow.target);
    });

    // 创建节点数组，并为每个节点分配层级和颜色
    const nodes = [
      ...Array.from(levelMap.source).map(id => ({
        id,
        color: "hsl(210, 70%, 50%)",
        nodeColor: "hsl(210, 70%, 50%)",
        category: 'source'
      })),
      ...Array.from(levelMap.primary).map(id => ({
        id,
        color: "hsl(180, 70%, 50%)",
        nodeColor: "hsl(180, 70%, 50%)",
        category: 'primary'
      })),
      ...Array.from(levelMap.secondary).map(id => ({
        id,
        color: "hsl(150, 70%, 50%)",
        nodeColor: "hsl(150, 70%, 50%)",
        category: 'secondary'
      }))
    ];

    // 创建链接并合并相同路径的金额
    const links = [];
    data.flowDetails.forEach(flow => {
      const primaryCategory = flow.primaryCategory || '其他';
      const amount = parseFloat(flow.amount);
      
      // 添加资金来源到一级科目的链接
      const sourceToPrimary = links.find(link => 
        link.source === flow.source && link.target === primaryCategory
      );
      
      if (sourceToPrimary) {
        sourceToPrimary.value = parseFloat(sourceToPrimary.value) + amount;
      } else {
        links.push({
          source: flow.source,
          target: primaryCategory,
          value: amount,
          gradientColor: "hsl(210, 70%, 50%)"
        });
      }

      // 添加一级科目到二级科目的链接
      const primaryToSecondary = links.find(link => 
        link.source === primaryCategory && link.target === flow.target
      );
      
      if (primaryToSecondary) {
        primaryToSecondary.value = parseFloat(primaryToSecondary.value) + amount;
      } else {
        links.push({
          source: primaryCategory,
          target: flow.target,
          value: amount,
          gradientColor: "hsl(180, 70%, 50%)"
        });
      }
    });

    // 对链接值进行四舍五入，保留两位小数
    links.forEach(link => {
      link.value = parseFloat(link.value.toFixed(2));
    });

    return { nodes, links };
  }, [data]);

  if (!data || nodes.length === 0) {
    return null;
  }

  const handleNodeClick = node => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  // 根据选中节点过滤链接
  const getFilteredData = () => {
    if (!selectedNode) return { nodes, links };

    const relevantLinks = links.filter(link => 
      link.source === selectedNode.id || link.target === selectedNode.id
    );
    
    const relevantNodeIds = new Set([
      ...relevantLinks.map(link => link.source),
      ...relevantLinks.map(link => link.target)
    ]);

    const filteredNodes = nodes.filter(node => relevantNodeIds.has(node.id));

    return { nodes: filteredNodes, links: relevantLinks };
  };

  const { nodes: displayNodes, links: displayLinks } = getFilteredData();

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-4">
        <Button
          onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
          className="bg-blue-500 hover:bg-blue-600"
        >
          切换布局: {layout === 'horizontal' ? '水平' : '垂直'}
        </Button>
        {selectedNode && (
          <Button
            onClick={() => setSelectedNode(null)}
            variant="outline"
          >
            清除筛选
          </Button>
        )}
      </div>
      <div className="h-[800px]">
        <ResponsiveSankey
          data={{ nodes: displayNodes, links: displayLinks }}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          orientation={layout}
          nodeThickness={20}
          nodeSpacing={40}
          nodeBorderRadius={3}
          nodeBorderWidth={0}
          nodePaddingX={4}
          nodePaddingY={8}
          nodeOpacity={1}
          linkOpacity={0.5}
          linkHoverOpacity={0.8}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition={layout === 'horizontal' ? 'outside' : 'inside'}
          labelOrientation={layout === 'horizontal' ? 'vertical' : 'horizontal'}
          labelPadding={16}
          animate={true}
          onClick={handleNodeClick}
          label={node => `${node.id}\n(${node.value?.toFixed(2)}万元)`}
          tooltip={({ node }) => (
            <div className="bg-white p-3 shadow-lg rounded-lg border">
              <strong className="text-gray-900">{node.id}</strong>
              <div className="text-gray-600 mt-1">
                金额：{node.value?.toFixed(2)} 万元
              </div>
            </div>
          )}
          theme={{
            labels: {
              text: {
                fontSize: 12,
                fontWeight: 500,
                fill: '#374151'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default FinancialFlowChart;