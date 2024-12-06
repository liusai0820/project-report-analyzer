import React, { useMemo, useState } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { Button } from "../ui/button";

const FinancialFlowChart = ({ data }) => {
  const [fundType, setFundType] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes, links } = useMemo(() => {
    if (!data?.flowDetails) return { nodes: [], links: [] };
    
    // 预处理确保所有 ID 唯一
    const processNodeId = (id, category) => `${category}_${id}`;
    
    // 过滤数据
    const filteredFlows = data.flowDetails.filter(flow => {
      if (fundType === 'all') return true;
      if (fundType === 'special') return flow.source.includes('专项资金');
      if (fundType === 'self') return flow.source.includes('自筹资金');
      return true;
    });

    const levelMap = {
      source: new Set(),
      primary: new Set(),
      secondary: new Set()
    };

    // 处理节点时添加层级前缀
    filteredFlows.forEach(flow => {
      if (flow.source) levelMap.source.add(processNodeId(flow.source, 'source'));
      if (flow.primaryCategory) levelMap.primary.add(processNodeId(flow.primaryCategory, 'primary'));
      if (flow.target) levelMap.secondary.add(processNodeId(flow.target, 'target'));
    });

    const nodes = [
      ...Array.from(levelMap.source).map(id => ({
        id,
        nodeColor: "hsl(210, 70%, 50%)",
        category: 'source',
        label: id.split('_')[1]
      })),
      ...Array.from(levelMap.primary).map(id => ({
        id,
        nodeColor: "hsl(180, 70%, 50%)",
        category: 'primary',
        label: id.split('_')[1]
      })),
      ...Array.from(levelMap.secondary).map(id => ({
        id,
        nodeColor: "hsl(150, 70%, 50%)",
        category: 'secondary',
        label: id.split('_')[1]
      }))
    ];

    const links = [];
    filteredFlows.forEach(flow => {
      if (!flow.source || !flow.primaryCategory || !flow.target || !flow.amount) return;

      const sourceId = processNodeId(flow.source, 'source');
      const primaryId = processNodeId(flow.primaryCategory, 'primary');
      const targetId = processNodeId(flow.target, 'target');

      // 添加第一层链接
      const sourceToPrimary = links.find(link => 
        link.source === sourceId && link.target === primaryId
      );
      
      if (sourceToPrimary) {
        sourceToPrimary.value += parseFloat(flow.amount) || 0;
      } else {
        links.push({
          source: sourceId,
          target: primaryId,
          value: parseFloat(flow.amount) || 0
        });
      }

      // 添加第二层链接
      const primaryToTarget = links.find(link => 
        link.source === primaryId && link.target === targetId
      );
      
      if (primaryToTarget) {
        primaryToTarget.value += parseFloat(flow.amount) || 0;
      } else {
        links.push({
          source: primaryId,
          target: targetId,
          value: parseFloat(flow.amount) || 0
        });
      }
    });

    links.forEach(link => {
      link.value = parseFloat(link.value.toFixed(2));
    });

    // 添加数据验证日志
    console.log('Processed nodes:', nodes);
    console.log('Processed links:', links);

    return { 
      nodes: nodes.filter(node => node.id), 
      links: links.filter(link => 
        link.source && 
        link.target && 
        typeof link.value === 'number' && 
        !isNaN(link.value)
      )
    };
  }, [data, fundType]);

  const getFilteredData = () => {
    if (!selectedNode || !nodes.length || !links.length) {
      return { nodes, links };
    }

    try {
      const relevantLinks = links.filter(link => 
        link.source === selectedNode.id || link.target === selectedNode.id
      );
      
      if (!relevantLinks.length) {
        return { nodes, links };
      }

      const relevantNodeIds = new Set([
        ...relevantLinks.map(link => link.source),
        ...relevantLinks.map(link => link.target)
      ]);

      return {
        nodes: nodes.filter(node => relevantNodeIds.has(node.id)),
        links: relevantLinks
      };
    } catch (error) {
      console.error('数据过滤错误:', error);
      return { nodes, links };
    }
  };

  const handleNodeClick = (node) => {
    if (!node) return;
    
    try {
      setSelectedNode(selectedNode?.id === node.id ? null : node);
    } catch (error) {
      console.error('节点点击处理错误:', error);
      setSelectedNode(null);
    }
  };

  const { nodes: displayNodes, links: displayLinks } = getFilteredData();

  if (!displayNodes.length || !displayLinks.length) {
    return (
      <div className="w-full">
        <div className="mb-4 flex gap-4">
          <Button
            onClick={() => setFundType('all')}
            className={`${fundType === 'all' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            全部资金
          </Button>
          <Button
            onClick={() => setFundType('special')}
            className={`${fundType === 'special' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            专项资金
          </Button>
          <Button
            onClick={() => setFundType('self')}
            className={`${fundType === 'self' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            自筹资金
          </Button>
        </div>
        <div className="h-[800px] flex items-center justify-center text-gray-500">
          暂无资金流向数据
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-4">
        <Button
          onClick={() => {
            setFundType('all');
            setSelectedNode(null);
          }}
          className={`${fundType === 'all' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
        >
          全部资金
        </Button>
        <Button
          onClick={() => {
            setFundType('special');
            setSelectedNode(null);
          }}
          className={`${fundType === 'special' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
        >
          专项资金
        </Button>
        <Button
          onClick={() => {
            setFundType('self');
            setSelectedNode(null);
          }}
          className={`${fundType === 'self' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
        >
          自筹资金
        </Button>
        {selectedNode && (
          <Button
            onClick={() => setSelectedNode(null)}
            variant="outline"
          >
            返回总览
          </Button>
        )}
      </div>
      <div className="h-[800px]">
        <ResponsiveSankey
          data={{ nodes: displayNodes, links: displayLinks }}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          orientation="horizontal"
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
          labelPosition="inside"
          labelOrientation="horizontal"
          labelPadding={16}
          animate={true}
          onClick={handleNodeClick}
          label={node => `${node.label}\n(${node.value?.toFixed(2)}万元)`}
          tooltip={({ node }) => (
            <div className="bg-white p-3 shadow-lg rounded-lg border">
              <strong className="text-gray-900">{node.label}</strong>
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