import React, { useMemo } from 'react';
import { Card } from '../ui/card';
import { ResponsiveSankey } from '@nivo/sankey';

const FinancialSankey = ({ data }) => {
  const { nodes, links } = useMemo(() => {
    if (!data?.flowDetails) return { nodes: [], links: [] };

    // 收集所有唯一的节点
    const uniqueNodes = new Set();
    data.flowDetails.forEach(flow => {
      uniqueNodes.add(flow.source);
      uniqueNodes.add(flow.target);
    });

    // 创建节点数组
    const nodes = Array.from(uniqueNodes).map(id => ({
      id,
      nodeColor: "hsl(219, 70%, 50%)"
    }));

    // 创建链接数组
    const links = data.flowDetails.map(flow => ({
      source: flow.source,
      target: flow.target,
      value: parseFloat(flow.amount) || 0,
      color: "hsl(219, 70%, 50%)"
    }));

    return { nodes, links };
  }, [data]);

  if (!data || nodes.length === 0) {
    return null;
  }

  return (
    <Card className="w-full p-4">
      <h2 className="text-lg font-semibold mb-4">资金流向分析</h2>
      <div className="h-96">
        <ResponsiveSankey
          data={{ nodes, links }}
          margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
          align="justify"
          colors={{ scheme: 'category10' }}
          nodeOpacity={1}
          nodeThickness={18}
          nodeInnerPadding={3}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderColor={{
            from: 'color',
            modifiers: [['darker', 0.8]]
          }}
          linkOpacity={0.5}
          linkHoverOpacity={0.8}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="vertical"
          labelPadding={16}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1]]
          }}
          animate={true}
          motionStiffness={140}
          motionDamping={13}
          tooltip={({ node, value }) => (
            <div className="bg-white p-2 shadow rounded">
              <strong>{node.id}</strong>: {value ? `￥${value.toLocaleString()}` : ''}
            </div>
          )}
        />
      </div>
    </Card>
  );
};

export default FinancialSankey;