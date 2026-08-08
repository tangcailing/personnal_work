/**
 * 通义千问 API 调用模块
 * 用于自媒体内容分析
 */

class QianwenAPI {
    constructor() {
        this.apiKey = null;
        this.apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
        this.modelName = 'qwen-plus'; // 使用 qwen-plus 模型
        this.storageKey = 'qianwen_api_key_encrypted';
    }

    /**
     * 初始化 - 从本地存储加载 API Key
     */
    init() {
        const savedKey = localStorage.getItem(this.storageKey);
        if (savedKey) {
            // 简单解密（Base64）
            try {
                this.apiKey = atob(savedKey);
                return true;
            } catch (e) {
                console.error('API Key 解密失败:', e);
                return false;
            }
        }
        return false;
    }

    /**
     * 保存 API Key
     */
    saveAPIKey(key) {
        if (!key || !key.startsWith('sk-')) {
            throw new Error('API Key 格式不正确，应以 sk- 开头');
        }
        // 简单加密（Base64）
        const encrypted = btoa(key);
        localStorage.setItem(this.storageKey, encrypted);
        this.apiKey = key;
    }

    /**
     * 检查 API Key 是否已配置
     */
    hasAPIKey() {
        return !!this.apiKey;
    }

    /**
     * 调用通义千问 API
     */
    async callAPI(prompt, systemPrompt = '') {
        if (!this.apiKey) {
            throw new Error('请先配置 API Key');
        }

        const messages = [];
        
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        
        messages.push({
            role: 'user',
            content: prompt
        });

        const requestBody = {
            model: this.modelName,
            input: {
                messages: messages
            },
            parameters: {
                result_format: 'message',
                max_tokens: 2000,
                temperature: 0.7
            }
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 调用失败: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (data.output && data.output.choices && data.output.choices.length > 0) {
                return data.output.choices[0].message.content;
            } else {
                throw new Error('API 返回格式异常');
            }
        } catch (error) {
            console.error('API 调用错误:', error);
            throw error;
        }
    }

    /**
     * 分析自媒体内容
     */
    async analyzeMediaContent(data) {
        const {
            platform,
            contentType,
            title,
            content,
            publishTime,
            views,
            likes,
            collects,
            comments,
            shares,
            follows
        } = data;

        // 构建系统提示词
        const systemPrompt = `你是一位资深的自媒体运营专家，精通各大平台（小红书、抖音、B站等）的流量算法和爆款内容规律。
你的任务是深度分析用户发布的内容数据，找出问题，并给出具体的改进建议。

分析要点：
1. 平台算法机制（该平台的推荐逻辑）
2. 标题吸引力（是否符合爆款标题特征）
3. 内容质量（结构、价值、可读性）
4. 发布时机（是否在流量高峰期）
5. 数据表现诊断（找出数据不好的原因）
6. 对比同类爆款（差距在哪里）

输出格式要求：
使用清晰的结构化输出，包含表情符号，分为以下几个部分：
📊 数据诊断
🔍 问题分析
💡 改进建议
🔥 爆款对比`;

        // 构建用户提示词
        const platformNames = {
            'xiaohongshu': '小红书',
            'douyin': '抖音',
            'bilibili': 'B站',
            'weixin': '微信公众号',
            'weibo': '微博',
            'zhihu': '知乎'
        };

        const contentTypes = {
            'life': '生活记录',
            'knowledge': '知识分享',
            'product': '好物推荐',
            'tutorial': '教程攻略',
            'vlog': 'Vlog',
            'other': '其他'
        };

        let userPrompt = `请分析以下自媒体内容的表现：

【平台】${platformNames[platform] || platform}
【内容类型】${contentTypes[contentType] || contentType}
【标题】${title}`;

        if (content) {
            userPrompt += `\n【正文】${content}`;
        }

        if (publishTime) {
            const time = new Date(publishTime);
            userPrompt += `\n【发布时间】${time.getMonth() + 1}月${time.getDate()}日 ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
        }

        userPrompt += `\n
【数据表现】
- 阅读/播放量：${views || 0}
- 点赞数：${likes || 0}
- 收藏数：${collects || 0}
- 评论数：${comments || 0}
- 分享/转发数：${shares || 0}
- 涨粉数：${follows || 0}

请深度分析这个内容为什么数据不理想，并给出具体的改进建议。`;

        try {
            const result = await this.callAPI(userPrompt, systemPrompt);
            return result;
        } catch (error) {
            // 如果 API 调用失败，返回规则分析
            return this.fallbackAnalysis(data);
        }
    }

    /**
     * 降级方案：基于规则的分析
     */
    fallbackAnalysis(data) {
        const {
            platform,
            title,
            views,
            likes,
            collects,
            comments,
            publishTime
        } = data;

        let analysis = '⚠️ AI API 暂时不可用，使用规则分析\n\n';
        
        analysis += '📊 数据诊断\n\n';
        
        // 计算互动率
        const totalViews = views || 1;
        const totalInteractions = (likes || 0) + (collects || 0) + (comments || 0);
        const interactionRate = ((totalInteractions / totalViews) * 100).toFixed(2);
        
        analysis += `• 阅读量：${views || 0}\n`;
        analysis += `• 互动率：${interactionRate}%（点赞+收藏+评论 / 阅读量）\n`;
        
        if (interactionRate < 3) {
            analysis += `  ⚠️ 互动率偏低，建议提升内容吸引力\n`;
        } else if (interactionRate > 8) {
            analysis += `  ✅ 互动率良好！\n`;
        }
        
        analysis += '\n🔍 问题分析\n\n';
        
        // 标题分析
        analysis += '1. 标题吸引力\n';
        if (title.length < 10) {
            analysis += '  • 标题过短，建议 15-25 字\n';
        }
        if (!/[0-9]/.test(title)) {
            analysis += '  • 缺少数字，可增加具体数据（如：3个方法、5分钟）\n';
        }
        if (!/[！!？?]/.test(title)) {
            analysis += '  • 缺少情绪符号，可加强语气（！？等）\n';
        }
        
        // 发布时间分析
        if (publishTime) {
            const time = new Date(publishTime);
            const hour = time.getHours();
            analysis += '\n2. 发布时机\n';
            
            if (platform === 'xiaohongshu') {
                if (hour >= 12 && hour <= 14) {
                    analysis += '  • 午休时段（12-14点），流量适中 ✓\n';
                } else if (hour >= 19 && hour <= 22) {
                    analysis += '  • 晚间高峰（19-22点），流量最佳 ✅\n';
                } else if (hour >= 7 && hour <= 9) {
                    analysis += '  • 早高峰（7-9点），通勤时段 ✓\n';
                } else {
                    analysis += `  • 当前时段（${hour}点）流量较低，建议 7-9点 或 19-22点发布\n`;
                }
            }
        }
        
        analysis += '\n💡 改进建议\n\n';
        analysis += '✅ 标题优化：\n';
        analysis += '  • 加入数字（3个、5分钟、10种）\n';
        analysis += '  • 使用疑问或感叹（？！）\n';
        analysis += '  • 突出核心价值点\n';
        analysis += '  • 参考：「5分钟搞定！这个方法太绝了🔥」\n\n';
        
        analysis += '✅ 内容优化：\n';
        analysis += '  • 开头吸引：前3秒决定用户是否继续看\n';
        analysis += '  • 增加互动：结尾引导评论（你觉得呢？）\n';
        analysis += '  • 视觉优化：配图/视频质量要高\n\n';
        
        analysis += '✅ 发布策略：\n';
        if (platform === 'xiaohongshu') {
            analysis += '  • 最佳时间：7-9点、12-14点、19-22点\n';
            analysis += '  • 使用热门话题标签\n';
        }
        
        return analysis;
    }

    /**
     * 清除 API Key
     */
    clearAPIKey() {
        localStorage.removeItem(this.storageKey);
        this.apiKey = null;
    }

    /**
     * 解析内容链接
     * @param {string} url - 内容链接
     * @returns {Promise<Object>} - 解析结果 {platform, title, content, contentType}
     */
    async parseContentLink(url) {
        if (!this.apiKey) {
            throw new Error('请先配置 API Key');
        }

        const prompt = `请访问并分析以下链接的内容：

${url}

请按以下JSON格式返回（只返回JSON，不要其他文字）：
{
    "platform": "平台名称（xiaohongshu/douyin/bilibili/weixin/weibo/zhihu之一）",
    "title": "内容标题",
    "content": "正文内容摘要（200字以内）",
    "contentType": "内容类型（life/knowledge/product/tutorial/vlog/other之一）"
}

注意：
1. platform 必须是：xiaohongshu, douyin, bilibili, weixin, weibo, zhihu 之一
2. contentType 必须是：life, knowledge, product, tutorial, vlog, other 之一
3. 只返回JSON，不要有其他说明文字`;

        const requestBody = {
            model: this.modelName,
            input: {
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            },
            parameters: {
                result_format: 'message',
                max_tokens: 800,
                temperature: 0.3
            }
        };

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `API 请求失败: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.output && data.output.choices && data.output.choices[0]) {
                const content = data.output.choices[0].message.content;
                
                // 尝试提取JSON
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    return result;
                }
                
                throw new Error('AI 返回格式错误，请重试');
            }
            
            throw new Error('API 返回数据格式异常');
            
        } catch (error) {
            console.error('链接解析失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
const qianwenAPI = new QianwenAPI();
