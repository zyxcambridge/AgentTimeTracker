#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查 GitHub Pages 设置
check_pages_settings() {
    print_message "$YELLOW" "检查 GitHub Pages 设置..."
    
    local pages_info=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/zyxcambridge/AgentTimeTracker/pages")
    
    if echo "$pages_info" | grep -q "Not Found"; then
        print_message "$RED" "GitHub Pages 未启用"
        return 1
    else
        local status=$(echo "$pages_info" | jq -r '.status')
        if [ "$status" = "built" ]; then
            print_message "$GREEN" "GitHub Pages 已正确配置"
            return 0
        else
            print_message "$YELLOW" "GitHub Pages 状态: $status"
            return 1
        fi
    fi
}

# 检查最新的部署状态
check_latest_deployment() {
    print_message "$YELLOW" "检查最新部署状态..."
    
    local latest_run=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/zyxcambridge/AgentTimeTracker/actions/workflows/deploy.yml/runs" \
        | jq -r '.workflow_runs[0]')
    
    if [ -z "$latest_run" ] || [ "$latest_run" = "null" ]; then
        print_message "$RED" "未找到部署记录"
        return 1
    fi
    
    local status=$(echo "$latest_run" | jq -r '.status')
    local conclusion=$(echo "$latest_run" | jq -r '.conclusion')
    local created_at=$(echo "$latest_run" | jq -r '.created_at')
    
    print_message "$YELLOW" "最新部署时间: $created_at"
    print_message "$YELLOW" "部署状态: $status"
    
    if [ "$status" = "completed" ] && [ "$conclusion" = "success" ]; then
        print_message "$GREEN" "最新部署成功"
        return 0
    else
        print_message "$RED" "最新部署状态异常"
        return 1
    fi
}

# 检查网站可访问性
check_website_accessibility() {
    print_message "$YELLOW" "检查网站可访问性..."
    
    local response=$(curl -s -I https://zyxcambridge.github.io/AgentTimeTracker/)
    local http_code=$(echo "$response" | grep "HTTP" | awk '{print $2}')
    
    if [ "$http_code" = "200" ]; then
        print_message "$GREEN" "网站可以正常访问"
        return 0
    else
        print_message "$RED" "网站无法访问 (HTTP 状态码: $http_code)"
        return 1
    fi
}

# 检查资源加载
check_resources() {
    print_message "$YELLOW" "检查关键资源..."
    
    local main_js=$(curl -s -I https://zyxcambridge.github.io/AgentTimeTracker/assets/index.js | grep "HTTP" | awk '{print $2}')
    local main_css=$(curl -s -I https://zyxcambridge.github.io/AgentTimeTracker/assets/index.css | grep "HTTP" | awk '{print $2}')
    
    if [ "$main_js" = "200" ] && [ "$main_css" = "200" ]; then
        print_message "$GREEN" "所有关键资源加载正常"
        return 0
    else
        print_message "$RED" "部分资源加载失败"
        [ "$main_js" != "200" ] && print_message "$RED" "JavaScript 文件加载失败"
        [ "$main_css" != "200" ] && print_message "$RED" "CSS 文件加载失败"
        return 1
    fi
}

# 主函数
main() {
    # 检查是否设置了 GITHUB_TOKEN
    if [ -z "$GITHUB_TOKEN" ]; then
        print_message "$RED" "错误: 未设置 GITHUB_TOKEN 环境变量"
        print_message "$YELLOW" "请先设置 GITHUB_TOKEN:"
        print_message "$YELLOW" "export GITHUB_TOKEN='你的GitHub个人访问令牌'"
        exit 1
    fi
    
    print_message "$GREEN" "开始检查部署状态..."
    
    local success=true
    
    check_pages_settings || success=false
    check_latest_deployment || success=false
    check_website_accessibility || success=false
    check_resources || success=false
    
    if [ "$success" = true ]; then
        print_message "$GREEN" "✅ 所有检查通过！"
        print_message "$GREEN" "网站地址: https://zyxcambridge.github.io/AgentTimeTracker/"
        exit 0
    else
        print_message "$RED" "❌ 部分检查未通过"
        exit 1
    fi
}

# 运行主函数
main 