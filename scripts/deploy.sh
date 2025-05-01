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

# 检查是否有未提交的更改
check_changes() {
    if [[ $(git status --porcelain) ]]; then
        print_message "$YELLOW" "检测到未提交的更改..."
        git status
        read -p "是否提交这些更改? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            read -p "请输入提交信息: " commit_message
            git commit -m "$commit_message"
        else
            print_message "$RED" "请先处理未提交的更改"
            exit 1
        fi
    fi
}

# 推送到远程仓库
push_changes() {
    print_message "$YELLOW" "推送更改到远程仓库..."
    if git push origin main; then
        print_message "$GREEN" "推送成功"
    else
        print_message "$RED" "推送失败"
        exit 1
    fi
}

# 检查工作流运行状态
check_workflow_status() {
    print_message "$YELLOW" "正在检查部署状态..."
    
    # 获取最新的工作流运行ID
    local workflow_id=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/zyxcambridge/AgentTimeTracker/actions/workflows/deploy.yml/runs" \
        | jq -r '.workflow_runs[0].id')
    
    if [ -z "$workflow_id" ]; then
        print_message "$RED" "无法获取工作流信息"
        exit 1
    fi
    
    # 循环检查状态
    local max_attempts=30
    local attempt=1
    local status=""
    
    while [ $attempt -le $max_attempts ]; do
        status=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/zyxcambridge/AgentTimeTracker/actions/runs/$workflow_id" \
            | jq -r '.status')
        
        if [ "$status" = "completed" ]; then
            local conclusion=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
                "https://api.github.com/repos/zyxcambridge/AgentTimeTracker/actions/runs/$workflow_id" \
                | jq -r '.conclusion')
            
            if [ "$conclusion" = "success" ]; then
                print_message "$GREEN" "部署成功！"
                print_message "$GREEN" "网站地址: https://zyxcambridge.github.io/AgentTimeTracker/"
                return 0
            else
                print_message "$RED" "部署失败"
                return 1
            fi
        fi
        
        print_message "$YELLOW" "部署进行中... (${attempt}/${max_attempts})"
        sleep 10
        ((attempt++))
    done
    
    print_message "$RED" "部署超时"
    return 1
}

# 检查网站可访问性
check_website() {
    print_message "$YELLOW" "正在检查网站可访问性..."
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --head https://zyxcambridge.github.io/AgentTimeTracker/ | grep "200 OK" > /dev/null; then
            print_message "$GREEN" "网站可以正常访问！"
            return 0
        else
            print_message "$YELLOW" "等待网站响应... (${attempt}/${max_attempts})"
            sleep 10
            ((attempt++))
        fi
    done
    
    print_message "$RED" "网站无法访问"
    return 1
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
    
    print_message "$GREEN" "开始部署流程..."
    
    check_changes
    push_changes
    check_workflow_status
    
    if [ $? -eq 0 ]; then
        check_website
    fi
}

# 运行主函数
main 