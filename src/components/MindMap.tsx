import React, { useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { MindMapNode } from '../types';
import { GitBranch } from 'lucide-react';

// 节点绘制尺寸和常量
const NODE_RADIUS = 60;
const CHILD_NODE_RADIUS = 40;
const LEAF_NODE_RADIUS = 25;
const FONT_SIZE = 12;
const ANIMATION_DURATION = 800;

const MindMap: React.FC = () => {
  const { mindMapData } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !mindMapData.children?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = 500; // 固定高度
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 绘制思维导图
    drawMindMap(ctx, canvas.width, canvas.height, mindMapData);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mindMapData]);

  // 绘制思维导图
  const drawMindMap = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    rootNode: MindMapNode
  ) => {
    if (!rootNode.children?.length) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 中心点
    const centerX = width / 2;
    const centerY = height / 2;

    // 动画帧
    let animationFrame = 0;
    const totalFrames = 60;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 进度百分比 (缓动函数)
      const progress = easeOutQuad(Math.min(animationFrame / totalFrames, 1));
      
      // 绘制主节点
      drawNode(ctx, centerX, centerY, NODE_RADIUS, rootNode.label, '#2563EB', progress);

      // 计算子节点的位置和绘制
      if (rootNode.children && rootNode.children.length > 0) {
        const angleStep = (2 * Math.PI) / rootNode.children.length;
        const radius = height / 3; // 距离中心点的半径
        
        rootNode.children.forEach((childNode, index) => {
          const angle = index * angleStep;
          const childX = centerX + radius * Math.cos(angle) * progress;
          const childY = centerY + radius * Math.sin(angle) * progress;
          
          // 绘制连线
          drawConnection(ctx, centerX, centerY, childX, childY, childNode.color || '#64748B', progress);
          
          // 绘制子节点
          drawNode(ctx, childX, childY, CHILD_NODE_RADIUS, childNode.label, childNode.color || '#64748B', progress);
          
          // 绘制子节点的子节点（叶节点）
          if (childNode.children && childNode.children.length > 0) {
            const leafAngleStep = Math.PI / 4;
            const leafNodeCount = Math.min(childNode.children.length, 5); // 限制显示数量
            const startAngle = angle - (leafAngleStep * (leafNodeCount - 1)) / 2;
            
            childNode.children.slice(0, 5).forEach((leafNode, leafIndex) => {
              const leafAngle = startAngle + leafIndex * leafAngleStep;
              const leafRadius = height / 6;
              const leafX = childX + leafRadius * Math.cos(leafAngle) * progress;
              const leafY = childY + leafRadius * Math.sin(leafAngle) * progress;
              
              // 绘制叶节点连线
              drawConnection(ctx, childX, childY, leafX, leafY, childNode.color || '#64748B', progress);
              
              // 绘制叶节点
              drawNode(ctx, leafX, leafY, LEAF_NODE_RADIUS, leafNode.label, childNode.color || '#64748B', 
              progress, true);
            });
          }
        });
      }
      
      // 继续动画
      animationFrame++;
      if (animationFrame <= totalFrames) {
        requestAnimationFrame(animate);
      }
    };
    
    // 开始动画
    animate();
  };

  // 绘制节点
  const drawNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    label: string,
    color: string,
    progress: number,
    isLeaf: boolean = false
  ) => {
    // 应用动画尺寸
    const animatedRadius = radius * progress;
    
    // 绘制圆形节点
    ctx.beginPath();
    ctx.arc(x, y, animatedRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isLeaf ? `${color}80` : `${color}40`; // 不同透明度
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 只有在进度接近1时才绘制文本
    if (progress > 0.8) {
      // 缩短文本如果太长
      let displayText = label;
      if (displayText.length > 10) {
        displayText = displayText.substring(0, 8) + '...';
      }
      
      // 绘制文本
      ctx.fillStyle = '#1F2937';
      ctx.font = `${FONT_SIZE}px 'Noto Sans SC', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayText, x, y);
    }
  };

  // 绘制连接线
  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    progress: number
  ) => {
    // 计算动画中的终点
    const endX = x1 + (x2 - x1) * progress;
    const endY = y1 + (y2 - y1) * progress;
    
    // 绘制连线
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    // 使用贝塞尔曲线使连线更有机
    const controlX = (x1 + endX) / 2;
    const controlY = (y1 + endY) / 2;
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    
    ctx.strokeStyle = `${color}80`; // 半透明
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // 缓动函数
  const easeOutQuad = (t: number): number => {
    return t * (2 - t);
  };

  // 如果没有数据显示提示
  if (!mindMapData.children || mindMapData.children.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 text-center text-gray-500">
        <GitBranch className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p>添加学习内容后将生成思维导图</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <GitBranch className="h-5 w-5 mr-2" />
          知识思维导图
        </h2>
      </div>
      
      <div ref={containerRef} className="p-4">
        <canvas ref={canvasRef} className="w-full h-[500px]" />
      </div>
    </div>
  );
};

export default MindMap;