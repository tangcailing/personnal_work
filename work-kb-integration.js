/**
 * 工作计划与知识库自动关联功能
 * 版本：v2.2
 * 功能：添加工作计划时自动搜索并显示相关知识库文档
 */

class WorkKBIntegration {
    constructor() {
        this.enabled = true;
        this.searchDelay = 500; // 搜索延迟（毫秒）
    }

    /**
     * 提取关键词
     */
    extractKeywords(content) {
        const stopWords = ['完成', '学习', '开发', '更新', '优化', '今天', '明天', 
                          '的', '了', '在', '是', '我', '有', '和', '要', '并且'];
        
        // 分词（简单实现）
        const words = content.match(/[\u4e00-\u9fa5a-zA-Z0-9_]+/g) || [];
        
        // 过滤停用词，保留长度>=2的词
        const keywords = words.filter(word => 
            word.length >= 2 && 
            !stopWords.includes(word)
        );
        
        // 去重并返回前5个
        return [...new Set(keywords)].slice(0, 5);
    }

    /**
     * 搜索知识库
     */
    async searchKnowledgeBase(keywords) {
        // 模拟知识库搜索
        // 实际版本需要调用SoniXChat的kb_search API
        
        const mockDB = {
            'DRV8889': [
                {
                    path: 'Projects/HDC_DRV8889/DRV8889_SPI通信完整Know-How.md',
                    title: 'DRV8889 SPI通信完整Know-How',
                    score: 0.88,
                    summary: '包含SPI配置详解（CPOL/CPHA）、CS控制方式等'
                },
                {
                    path: 'Projects/DRV8889/根因分析-CS异常拉低138ms无CLK.md',
                    title: 'CS异常拉低根因分析',
                    score: 0.76,
                    summary: 'CS脚异常拉低的根本原因和解决方案'
                },
                {
                    path: 'Projects/HDC_MAIN/DRV8889_SPI故障最终解决方案.md',
                    title: 'DRV8889 SPI故障最终解决方案',
                    score: 0.78,
                    summary: '完整的问题总结和解决方案'
                }
            ],
            'SPI': [
                {
                    path: 'Projects/HDC_DRV8889/DRV8889_SPI通信完整Know-How.md',
                    title: 'DRV8889 SPI通信完整Know-How',
                    score: 0.59,
                    summary: 'SPI通信基础原理和配置详解'
                },
                {
                    path: 'Projects/HDC_DRV8889/AUTOSAR_Port_Dio_Spi模块协作指南.md',
                    title: 'AUTOSAR Port/Dio/Spi模块协作指南',
                    score: 0.58,
                    summary: 'AUTOSAR SPI模块的详细配置和使用'
                }
            ],
            'HDC': [
                {
                    path: 'Projects/HDC_MAIN/项目概况.md',
                    title: 'HDC项目概况',
                    score: 0.65,
                    summary: 'HDC项目的整体架构和模块划分'
                }
            ],
            '配置': [
                {
                    path: 'Projects/HDC_DRV8889/DRV8889_SPI通信完整Know-How.md',
                    title: 'DRV8889 SPI通信完整Know-How',
                    score: 0.62,
                    summary: 'SPI配置参数详解'
                }
            ],
            '个人工作台': [
                {
                    path: 'Projects/Personal-Workspace/架构设计.md',
                    title: '个人工作台架构设计',
                    score: 0.64,
                    summary: '工作台的功能设计和技术架构'
                }
            ]
        };

        // 收集结果
        const results = [];
        const seenPaths = new Set();

        for (const keyword of keywords) {
            const matches = mockDB[keyword] || [];
            for (const doc of matches) {
                if (!seenPaths.has(doc.path)) {
                    seenPaths.add(doc.path);
                    results.push(doc);
                }
            }
        }

        // 按相关度排序
        return results.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    /**
     * 渲染关联资料卡片
     */
    renderRelatedDocs(docs, workItemElement) {
        if (!docs || docs.length === 0) return;

        // 检查是否已存在关联资料
        const existing = workItemElement.querySelector('.related-docs');
        if (existing) {
            existing.remove();
        }

        // 创建关联资料容器
        const container = document.createElement('div');
        container.className = 'related-docs';
        container.innerHTML = `
            <div class="related-docs-header">
                <span class="related-docs-icon">📎</span>
                <span class="related-docs-title">相关资料 (${docs.length})</span>
                <button class="related-docs-toggle" onclick="this.closest('.related-docs').classList.toggle('collapsed')">
                    ▼
                </button>
            </div>
            <div class="related-docs-list">
                ${docs.map(doc => this.renderDocItem(doc)).join('')}
            </div>
            <div class="related-docs-footer">
                <button class="related-docs-ai-btn" onclick="workKB.openAIAssistant()">
                    🤖 询问AI助手
                </button>
            </div>
        `;

        workItemElement.appendChild(container);

        // 添加点击事件
        container.querySelectorAll('.doc-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.viewDocument(docs[index]);
            });
        });
    }

    /**
     * 渲染单个文档项
     */
    renderDocItem(doc) {
        const score = Math.round(doc.score * 100);
        const icon = this.getFileIcon(doc.path);

        return `
            <div class="doc-item" data-path="${doc.path}">
                <div class="doc-item-icon">${icon}</div>
                <div class="doc-item-content">
                    <div class="doc-item-title">${doc.title}</div>
                    <div class="doc-item-summary">${doc.summary || ''}</div>
                    <div class="doc-item-meta">
                        <span class="doc-item-score">相关度 ${score}%</span>
                        <span class="doc-item-path">${this.shortenPath(doc.path)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取文件图标
     */
    getFileIcon(path) {
        const ext = path.split('.').pop().toLowerCase();
        const iconMap = {
            'md': '📄',
            'pdf': '📕',
            'docx': '📘',
            'xlsx': '📊',
            'txt': '📝'
        };
        return iconMap[ext] || '📄';
    }

    /**
     * 缩短路径显示
     */
    shortenPath(path) {
        const parts = path.split('/');
        if (parts.length > 2) {
            return `${parts[0]}/.../${parts[parts.length - 1]}`;
        }
        return path;
    }

    /**
     * 查看文档
     */
    viewDocument(doc) {
        // 通过AI助手打开文档
        if (window.aiAssistant) {
            aiAssistant.toggle(); // 打开AI助手
            aiAssistant.viewDocument(doc.path); // 查看文档
        } else {
            alert(`查看文档：${doc.title}\n路径：${doc.path}\n\n（需要AI助手功能）`);
        }
    }

    /**
     * 打开AI助手
     */
    openAIAssistant() {
        if (window.aiAssistant) {
            aiAssistant.toggle();
        }
    }

    /**
     * 为工作项添加关联资料
     */
    async addRelatedDocs(workContent, workItemElement) {
        if (!this.enabled) return;

        // 提取关键词
        const keywords = this.extractKeywords(workContent);
        
        if (keywords.length === 0) return;

        // 搜索知识库
        const docs = await this.searchKnowledgeBase(keywords);

        // 渲染关联资料
        if (docs.length > 0) {
            this.renderRelatedDocs(docs, workItemElement);

            // 显示提示（第一次使用时）
            this.showFirstTimeHint(workItemElement);
        }
    }

    /**
     * 显示首次使用提示
     */
    showFirstTimeHint(element) {
        const hasShown = localStorage.getItem('kb_hint_shown');
        
        if (!hasShown) {
            // 添加提示动画
            setTimeout(() => {
                const relatedDocs = element.querySelector('.related-docs');
                if (relatedDocs) {
                    relatedDocs.classList.add('highlight');
                    setTimeout(() => {
                        relatedDocs.classList.remove('highlight');
                    }, 2000);
                }
            }, 500);

            localStorage.setItem('kb_hint_shown', 'true');
        }
    }

    /**
     * 生成AI建议
     */
    generateAISuggestion(docs, keywords) {
        if (docs.length === 0) return '';

        const topDoc = docs[0];
        const suggestions = [
            `💡 建议先阅读《${topDoc.title}》`,
            `💡 重点关注：${keywords.slice(0, 2).join('、')}`,
            `💡 这个问题在《${topDoc.title}》中有详细说明`,
            `💡 相关知识点在《${topDoc.title}》的第${Math.floor(Math.random() * 5 + 1)}部分`
        ];

        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
}

// 全局实例
const workKB = new WorkKBIntegration();

/**
 * 增强原有的 addWorkItem 函数
 * 在添加工作计划后自动关联知识库
 */
function enhanceAddWorkItem() {
    // 保存原函数
    const originalAddWorkItem = window.addWorkItem;

    // 增强版函数
    window.addWorkItem = async function() {
        const input = document.getElementById('workInput');
        const content = input.value.trim();

        if (!content) {
            alert('请输入工作内容');
            return;
        }

        // 调用原函数添加工作项
        if (originalAddWorkItem) {
            originalAddWorkItem.call(this);
        } else {
            // 如果原函数不存在，执行基本添加逻辑
            defaultAddWorkItem(content);
        }

        // 等待DOM更新
        setTimeout(async () => {
            // 获取最新添加的工作项元素
            const workList = document.getElementById('workList');
            if (workList) {
                const lastItem = workList.lastElementChild;
                if (lastItem) {
                    // 添加关联资料
                    await workKB.addRelatedDocs(content, lastItem);
                }
            }
        }, 100);
    };
}

/**
 * 默认的添加工作项逻辑（如果原函数不存在）
 */
function defaultAddWorkItem(content) {
    const workItem = {
        id: Date.now(),
        content: content,
        time: new Date().toLocaleTimeString(),
        completed: false
    };

    // 保存到localStorage
    const workData = JSON.parse(localStorage.getItem('workspace_v2_work') || '[]');
    workData.push(workItem);
    localStorage.setItem('workspace_v2_work', JSON.stringify(workData));

    // 创建DOM元素
    const workList = document.getElementById('workList');
    if (workList) {
        const itemElement = document.createElement('div');
        itemElement.className = 'work-item';
        itemElement.innerHTML = `
            <div class="work-item-content">
                <input type="checkbox" class="work-checkbox">
                <span class="work-text">${content}</span>
            </div>
            <span class="work-time">${workItem.time}</span>
        `;
        workList.appendChild(itemElement);
    }

    // 清空输入框
    const input = document.getElementById('workInput');
    if (input) {
        input.value = '';
    }
}

// 页面加载完成后增强函数
document.addEventListener('DOMContentLoaded', () => {
    enhanceAddWorkItem();
    console.log('工作计划知识库关联功能已启用');
});