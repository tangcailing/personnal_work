/**
 * AI工作助手 - 侧边栏组件
 * 版本：v2.2
 * 功能：知识库搜索、智能关联、文档查看
 */

class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.currentDoc = null;
        this.chatHistory = [];
        this.init();
    }

    /**
     * 初始化AI助手
     */
    init() {
        this.createSidebar();
        this.createFloatingButton();
        this.bindEvents();
        this.loadChatHistory();
    }

    /**
     * 创建侧边栏DOM结构
     */
    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.id = 'ai-assistant-sidebar';
        sidebar.className = 'ai-sidebar';
        sidebar.innerHTML = `
            <div class="ai-sidebar-header">
                <div class="ai-header-title">
                    <span class="ai-icon">🤖</span>
                    <h3>AI工作助手</h3>
                </div>
                <button class="ai-close-btn" onclick="aiAssistant.toggle()">✕</button>
            </div>

            <div class="ai-sidebar-content">
                <!-- 聊天消息区域 -->
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-welcome-message">
                        <div class="ai-avatar">🤖</div>
                        <div class="ai-message-bubble">
                            <p>你好！我是你的AI工作助手。</p>
                            <p>我可以帮你：</p>
                            <ul>
                                <li>🔍 搜索知识库文档</li>
                                <li>📚 推荐相关学习资料</li>
                                <li>📝 总结工作内容</li>
                                <li>💡 回答技术问题</li>
                            </ul>
                            <p>试试说："帮我找DRV8889的资料"</p>
                        </div>
                    </div>
                </div>

                <!-- 文档查看区域 -->
                <div class="ai-doc-viewer" id="aiDocViewer" style="display: none;">
                    <div class="ai-doc-header">
                        <button class="ai-back-btn" onclick="aiAssistant.closeDocViewer()">
                            ← 返回对话
                        </button>
                        <span class="ai-doc-title" id="aiDocTitle"></span>
                    </div>
                    <div class="ai-doc-content" id="aiDocContent"></div>
                </div>
            </div>

            <div class="ai-sidebar-footer">
                <!-- 快捷操作按钮 -->
                <div class="ai-quick-actions">
                    <button class="ai-quick-btn" onclick="aiAssistant.quickAction('search')">
                        🔍 搜索资料
                    </button>
                    <button class="ai-quick-btn" onclick="aiAssistant.quickAction('summary')">
                        📝 总结工作
                    </button>
                </div>

                <!-- 输入区域 -->
                <div class="ai-input-area">
                    <textarea 
                        id="aiInput" 
                        class="ai-input" 
                        placeholder="输入你的问题..."
                        rows="2"
                    ></textarea>
                    <button class="ai-send-btn" onclick="aiAssistant.sendMessage()">
                        发送 ➤
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(sidebar);
    }

    /**
     * 创建浮动触发按钮
     */
    createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'ai-assistant-trigger';
        button.className = 'ai-floating-btn';
        button.innerHTML = `
            <span class="ai-btn-icon">🤖</span>
            <span class="ai-btn-text">AI助手</span>
        `;
        button.onclick = () => this.toggle();

        document.body.appendChild(button);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // Enter发送消息（Shift+Enter换行）
        const input = document.getElementById('aiInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // 点击侧边栏外部关闭
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('ai-assistant-sidebar');
            const trigger = document.getElementById('ai-assistant-trigger');
            
            if (this.isOpen && 
                sidebar && 
                !sidebar.contains(e.target) && 
                !trigger.contains(e.target)) {
                // 暂时注释，避免误关闭
                // this.toggle();
            }
        });
    }

    /**
     * 切换侧边栏显示/隐藏
     */
    toggle() {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById('ai-assistant-sidebar');
        const trigger = document.getElementById('ai-assistant-trigger');

        if (this.isOpen) {
            sidebar.classList.add('active');
            trigger.classList.add('hidden');
            document.getElementById('aiInput')?.focus();
        } else {
            sidebar.classList.remove('active');
            trigger.classList.remove('hidden');
        }
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();

        if (!message) return;

        // 显示用户消息
        this.addMessage('user', message);
        input.value = '';

        // 显示加载状态
        const loadingId = this.addMessage('assistant', '正在思考...', true);

        // 处理消息
        try {
            const response = await this.processMessage(message);
            this.removeMessage(loadingId);
            this.addMessage('assistant', response);
        } catch (error) {
            this.removeMessage(loadingId);
            this.addMessage('assistant', '抱歉，出现了错误：' + error.message);
        }
    }

    /**
     * 处理用户消息
     */
    async processMessage(message) {
        const lowerMsg = message.toLowerCase();

        // 搜索知识库
        if (lowerMsg.includes('搜索') || lowerMsg.includes('找') || lowerMsg.includes('查')) {
            return await this.searchKnowledgeBase(message);
        }

        // 总结工作
        if (lowerMsg.includes('总结')) {
            return await this.summarizeWork();
        }

        // 读取文档
        if (lowerMsg.includes('读') || lowerMsg.includes('看')) {
            return await this.readDocument(message);
        }

        // 默认响应
        return this.getDefaultResponse(message);
    }

    /**
     * 搜索知识库
     */
    async searchKnowledgeBase(query) {
        // 提取关键词
        const keywords = this.extractKeywords(query);
        
        // 模拟知识库搜索（实际需要调用SoniXChat API）
        const results = await this.mockKBSearch(keywords);

        if (results.length === 0) {
            return '没有找到相关文档。试试换个关键词？';
        }

        // 生成结果HTML
        let response = `找到 **${results.length}** 个相关文档：\n\n`;
        
        results.forEach((doc, index) => {
            const score = Math.round(doc.score * 100);
            response += `**${index + 1}. ${doc.title}**\n`;
            response += `   📊 相关度：${score}%\n`;
            response += `   📁 路径：${doc.path}\n`;
            response += `   [查看文档](#view:${doc.path})\n\n`;
        });

        response += '\n💡 点击"查看文档"可以阅读完整内容';

        return response;
    }

    /**
     * 提取关键词
     */
    extractKeywords(text) {
        // 移除常用词
        const stopWords = ['帮我', '搜索', '查找', '找', '的', '了', '在', '是'];
        const words = text.match(/[\u4e00-\u9fa5a-zA-Z0-9_]+/g) || [];
        
        return words
            .filter(word => word.length >= 2 && !stopWords.includes(word))
            .slice(0, 5);
    }

    /**
     * 模拟知识库搜索（实际版本需要调用真实API）
     */
    async mockKBSearch(keywords) {
        // 模拟数据库
        const mockDB = {
            'DRV8889': [
                {
                    path: 'Projects/HDC_DRV8889/DRV8889_SPI通信完整Know-How.md',
                    title: 'DRV8889_SPI通信完整Know-How',
                    score: 0.88
                },
                {
                    path: 'Projects/DRV8889/根因分析-CS异常拉低138ms无CLK.md',
                    title: '根因分析-CS异常拉低138ms无CLK',
                    score: 0.76
                }
            ],
            'SPI': [
                {
                    path: 'Projects/HDC_DRV8889/DRV8889_SPI通信完整Know-How.md',
                    title: 'DRV8889_SPI通信完整Know-How',
                    score: 0.59
                },
                {
                    path: 'Projects/HDC_DRV8889/AUTOSAR_Port_Dio_Spi模块协作指南.md',
                    title: 'AUTOSAR_Port_Dio_Spi模块协作指南',
                    score: 0.58
                }
            ],
            '工作台': [
                {
                    path: 'Projects/Personal-Workspace/架构设计.md',
                    title: '个人工作台架构设计',
                    score: 0.64
                }
            ]
        };

        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 收集结果
        const results = [];
        const seenPaths = new Set();

        keywords.forEach(keyword => {
            const matches = mockDB[keyword] || [];
            matches.forEach(doc => {
                if (!seenPaths.has(doc.path)) {
                    seenPaths.add(doc.path);
                    results.push(doc);
                }
            });
        });

        // 按相关度排序
        return results.sort((a, b) => b.score - a.score).slice(0, 5);
    }

    /**
     * 读取文档
     */
    async readDocument(query) {
        // 从消息中提取文档路径（简化版）
        // 实际需要更复杂的解析逻辑
        return '请点击搜索结果中的"查看文档"按钮来阅读文档内容。';
    }

    /**
     * 总结工作
     */
    async summarizeWork() {
        // 获取今日工作数据
        const workData = JSON.parse(localStorage.getItem('workspace_v2_work') || '[]');
        
        if (workData.length === 0) {
            return '今天还没有添加工作记录。';
        }

        let summary = '📝 **今日工作总结**\n\n';
        summary += `✅ 共完成 ${workData.length} 项工作：\n\n`;

        workData.forEach((item, index) => {
            summary += `${index + 1}. ${item.content}\n`;
            summary += `   ⏰ 时间：${item.time}\n\n`;
        });

        summary += '\n💡 是否需要保存到知识库？\n';
        summary += '[保存总结](#action:save-summary)';

        return summary;
    }

    /**
     * 默认响应
     */
    getDefaultResponse(message) {
        const responses = [
            '我理解你的问题。你可以试试：\n\n- "搜索DRV8889的文档"\n- "总结今天的工作"\n- "帮我找SPI配置的资料"',
            '我能帮你搜索知识库、总结工作、查看文档。\n\n具体需要什么帮助？',
            '试试更具体地描述你的需求，比如：\n\n- "搜索XXX"\n- "总结工作"\n- "查看XXX文档"'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 添加消息到聊天记录
     */
    addMessage(role, content, isLoading = false) {
        const messagesContainer = document.getElementById('aiChatMessages');
        const messageId = 'msg_' + Date.now();

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${role}`;
        messageDiv.id = messageId;

        if (role === 'assistant') {
            messageDiv.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="ai-message-bubble ${isLoading ? 'loading' : ''}">
                    ${isLoading ? content : this.formatMessage(content)}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="ai-message-bubble">
                    ${this.formatMessage(content)}
                </div>
                <div class="ai-avatar">👤</div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // 保存到历史
        if (!isLoading) {
            this.chatHistory.push({ role, content, time: new Date() });
            this.saveChatHistory();
        }

        return messageId;
    }

    /**
     * 移除消息
     */
    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }

    /**
     * 格式化消息内容（支持Markdown）
     */
    formatMessage(content) {
        // 简单的Markdown渲染
        let html = content
            // 粗体
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // 链接（自定义协议）
            .replace(/\[(.+?)\]\(#view:(.+?)\)/g, '<a href="#" class="ai-doc-link" data-path="$2" onclick="aiAssistant.viewDocument(\'$2\'); return false;">$1</a>')
            .replace(/\[(.+?)\]\(#action:(.+?)\)/g, '<a href="#" class="ai-action-link" data-action="$2" onclick="aiAssistant.handleAction(\'$2\'); return false;">$1</a>')
            // 换行
            .replace(/\n/g, '<br>');

        return html;
    }

    /**
     * 查看文档
     */
    async viewDocument(path) {
        const docViewer = document.getElementById('aiDocViewer');
        const chatMessages = document.getElementById('aiChatMessages');
        const docTitle = document.getElementById('aiDocTitle');
        const docContent = document.getElementById('aiDocContent');

        // 显示加载状态
        docTitle.textContent = '加载中...';
        docContent.innerHTML = '<div class="ai-loading">正在加载文档...</div>';

        // 切换视图
        chatMessages.style.display = 'none';
        docViewer.style.display = 'flex';

        try {
            // 模拟加载文档（实际需要调用SoniXChat API）
            const docData = await this.mockLoadDocument(path);
            
            docTitle.textContent = docData.title;
            docContent.innerHTML = this.formatDocContent(docData.content);

            this.currentDoc = docData;
        } catch (error) {
            docContent.innerHTML = `<div class="ai-error">加载失败：${error.message}</div>`;
        }
    }

    /**
     * 关闭文档查看器
     */
    closeDocViewer() {
        const docViewer = document.getElementById('aiDocViewer');
        const chatMessages = document.getElementById('aiChatMessages');

        docViewer.style.display = 'none';
        chatMessages.style.display = 'flex';
        this.currentDoc = null;
    }

    /**
     * 模拟加载文档
     */
    async mockLoadDocument(path) {
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟文档内容
        const docs = {
            'Projects/HDC_DRV8889/DRV8889_SPI通信完整Know-How.md': {
                title: 'DRV8889_SPI通信完整Know-How',
                content: `
# DRV8889 SPI通信完整Know-How

## 第四部分：SPI模式配置（CPOL/CPHA）

### CPOL（时钟极性）
- **CPOL=0**：空闲时CLK为低电平
- **CPOL=1**：空闲时CLK为高电平

### CPHA（时钟相位）
- **CPHA=0**：第一个边沿采样
- **CPHA=1**：第二个边沿采样

### DRV8889要求
- **使用SPI模式1**
- CPOL=0, CPHA=1

### 配置示例
\`\`\`c
SpiConf_SpiChannel_DRV8889 = {
    .Polarity = SPI_LOW,   // CPOL=0
    .Phase = SPI_TRAILING  // CPHA=1
};
\`\`\`

## 第三部分：CS控制方式

### 硬件自动控制（推荐）
- 由AUTOSAR SPI驱动自动控制CS引脚
- 无需应用层干预

### 软件手动控制
- 应用层通过Dio模块控制CS
- 需要严格控制时序

**DRV8889项目使用：硬件自动控制**
                `
            }
        };

        const doc = docs[path];
        if (!doc) {
            throw new Error('文档不存在');
        }

        return doc;
    }

    /**
     * 格式化文档内容
     */
    formatDocContent(content) {
        // 简单的Markdown渲染
        return content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');
    }

    /**
     * 处理操作链接
     */
    handleAction(action) {
        switch (action) {
            case 'save-summary':
                this.saveSummary();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    /**
     * 保存总结
     */
    async saveSummary() {
        this.addMessage('assistant', '✅ 总结已保存到知识库\n\n路径：Projects/个人工作台/工作总结/');
    }

    /**
     * 快捷操作
     */
    quickAction(action) {
        const input = document.getElementById('aiInput');
        
        switch (action) {
            case 'search':
                input.value = '帮我搜索';
                input.focus();
                break;
            case 'summary':
                input.value = '总结今天的工作';
                this.sendMessage();
                break;
        }
    }

    /**
     * 保存聊天历史
     */
    saveChatHistory() {
        try {
            localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('保存聊天历史失败:', error);
        }
    }

    /**
     * 加载聊天历史
     */
    loadChatHistory() {
        try {
            const history = localStorage.getItem('ai_chat_history');
            if (history) {
                this.chatHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('加载聊天历史失败:', error);
        }
    }
}

// 全局实例
let aiAssistant;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    aiAssistant = new AIAssistant();
    console.log('AI助手已初始化');
});
