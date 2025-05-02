import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { MindMapNode } from '../types';
import { GitBranch, ChevronRight, ChevronDown } from 'lucide-react';

const NODE_SPACING = {
  MAIN: 120,
  SUB: 80,
  LEAF: 60
};

interface NodeProps {
  node: MindMapNode;
  x: number;
  y: number;
  isRoot?: boolean;
  isLeaf?: boolean;
  parentX?: number;
  parentY?: number;
  onToggle?: () => void;
  isExpanded?: boolean;
}

const Node: React.FC<NodeProps> = ({ 
  node, 
  x, 
  y, 
  isRoot = false, 
  isLeaf = false,
  parentX,
  parentY,
  onToggle,
  isExpanded = false
}) => {
  const radius = isRoot ? 60 : (isLeaf ? 25 : 40);
  const bgColor = isRoot ? '#2563EB' : (node.color || '#64748B');
  const hasChildren = node.children && node.children.length > 0;

  return (
    <g>
      {/* 连接线 */}
      {parentX !== undefined && parentY !== undefined && (
        <path
          d={`M ${parentX} ${parentY} Q ${(parentX + x) / 2} ${(parentY + y) / 2} ${x} ${y}`}
          stroke={`${bgColor}80`}
          strokeWidth="2"
          fill="none"
        />
      )}

      {/* 节点 */}
      <g 
        transform={`translate(${x},${y})`}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        onClick={onToggle}
      >
        <circle
          r={radius}
          fill={`${bgColor}40`}
          stroke={bgColor}
          strokeWidth="2"
        />
        
        {/* 展开/收起图标 */}
        {hasChildren && !isLeaf && (
          <g transform={`translate(${radius - 15},-${radius - 15})`}>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </g>
        )}

        {/* 文本 */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1F2937"
          fontSize="12"
          fontFamily="'Noto Sans SC', sans-serif"
        >
          {node.label.length > 10 ? node.label.substring(0, 8) + '...' : node.label}
        </text>
      </g>
    </g>
  );
};

const MindMap: React.FC = () => {
  const { mindMapData } = useData();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([mindMapData.id]));

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNodes = (node: MindMapNode, x: number, y: number, level: number = 0, parentX?: number, parentY?: number) => {
    const isExpanded = expandedNodes.has(node.id);
    const children = node.children || [];
    
    return (
      <g key={node.id}>
        <Node
          node={node}
          x={x}
          y={y}
          isRoot={level === 0}
          isLeaf={level === 2}
          parentX={parentX}
          parentY={parentY}
          onToggle={() => children.length > 0 && toggleNode(node.id)}
          isExpanded={isExpanded}
        />
        
        {isExpanded && children.length > 0 && (
          <g>
            {children.map((child, index) => {
              const childrenCount = children.length;
              const angleStep = Math.PI / Math.max(childrenCount - 1, 1);
              const startAngle = -Math.PI / 2 - (angleStep * (childrenCount - 1)) / 2;
              const angle = startAngle + index * angleStep;
              
              const distance = level === 0 ? NODE_SPACING.MAIN : NODE_SPACING.SUB;
              const childX = x + distance * Math.cos(angle);
              const childY = y + distance * Math.sin(angle);
              
              return renderNodes(child, childX, childY, level + 1, x, y);
            })}
          </g>
        )}
      </g>
    );
  };

  if (!mindMapData.children || mindMapData.children.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 text-center text-gray-500">
        <GitBranch className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p>添加学习内容后将生成思维导图</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <GitBranch className="h-5 w-5 mr-2" />
          学习思维导图
        </h2>
      </div>
      <div className="relative w-full" style={{ height: '400px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="-300 -200 600 400"
          preserveAspectRatio="xMidYMid meet"
        >
          {renderNodes(mindMapData, 0, 0)}
        </svg>
      </div>
    </div>
  );
};

export default MindMap;