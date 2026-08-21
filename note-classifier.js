// ==================== 笔记智能分类模块 ====================

// 分类定义
const NOTE_CATEGORIES = {
    WORK: { 
        name: '工作', 
        icon: '💼', 
        color: '#5B8FF9',
        keywords: ['工作', '项目', '会议', '任务', '客户', '报告', 'deadline', '进度', '需求', '开发', '测试', '上线', '方案', '计划']
    },
    STUDY: { 
        name: '学习', 
        icon: '📚', 
        color: '#9270CA',
        keywords: ['学习', '课程', '教程', '笔记', '知识', '技术', '算法', '编程', '阅读', '总结', '复习', 'bug', '代码']
    },
    LIFE: { 
        name: '生活', 
        icon: '🏠', 
        color: '#61DDAA',
        keywords: ['生活', '健康', '运动', '饮食', '购物', '旅行', '休闲', '娱乐', '电影', '游戏', '家庭', '朋友']
    },
    IDEA: { 
        name: '想法', 
        icon: '💡', 
        color: '#F6BD16',
        keywords: ['想法', '创意', '灵感', '点子', '思考', '感悟', '计划', '未来', '目标', '梦想', '改进', '优化']
    },
    FINANCE: { 
        name: '财务', 
        icon: '💰', 
        color: '#F4664A',
        keywords: ['财务', '理财', '投资', '账单', '支出', '收入', '预算', '存款', '股票', '基金', '花费', '消费']
    },
    OTHER: { 
        name: '其他', 
        icon: '📝', 
        color: '#7f8c8d',
        keywords: []
    }
};

/**
 * 智能分析笔记分类
 * @param {string} title - 笔记标题
 * @param {string} content - 笔记内容
 * @returns {string} - 分类名称
 */
function analyzeNoteCategory(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    const scores = {};
    
    // 计算每个分类的匹配分数
    for (const [key, category] of Object.entries(NOTE_CATEGORIES)) {
        if (key === 'OTHER') continue;
        
        let score = 0;
        category.keywords.forEach(keyword => {
            // 统计关键词出现次数
            const regex = new RegExp(keyword, 'gi');
            const matches = text.match(regex);
            if (matches) {
                score += matches.length;
            }
        });
        
        scores[key] = score;
    }
    
    // 找出得分最高的分类
    let maxScore = 0;
    let bestCategory = 'OTHER';
    
    for (const [key, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = key;
        }
    }
    
    // 如果所有分类得分都是0，返回"其他"
    return maxScore > 0 ? bestCategory : 'OTHER';
}

/**
 * 提取关键词标签
 * @param {string} text - 文本内容
 * @returns {Array} - 关键词数组
 */
function extractKeywords(text) {
    // 简单的关键词提取（基于词频）
    const words = text.toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ') // 只保留中文、英文、数字
        .split(/\s+/)
        .filter(word => word.length >= 2); // 至少2个字符
    
    // 统计词频
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // 排序并取前5个
    const keywords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
    
    return keywords;
}

/**
 * 为笔记添加分类和标签
 * @param {Object} note - 笔记对象
 * @returns {Object} - 增强后的笔记对象
 */
function enrichNote(note) {
    if (!note.category) {
        note.category = analyzeNoteCategory(note.title, note.content);
    }
    
    if (!note.tags || note.tags.length === 0) {
        note.tags = extractKeywords(note.title + ' ' + note.content);
    }
    
    return note;
}

/**
 * 批量分析所有笔记
 * @param {Array} notes - 笔记数组
 * @returns {Array} - 增强后的笔记数组
 */
function batchAnalyzeNotes(notes) {
    return notes.map(note => enrichNote(note));
}

/**
 * 按分类筛选笔记
 * @param {Array} notes - 笔记数组
 * @param {string} category - 分类名称（如 'WORK'）
 * @returns {Array} - 筛选后的笔记
 */
function filterNotesByCategory(notes, category) {
    if (!category || category === 'ALL') {
        return notes;
    }
    return notes.filter(note => note.category === category);
}

/**
 * 按标签筛选笔记
 * @param {Array} notes - 笔记数组
 * @param {string} tag - 标签
 * @returns {Array} - 筛选后的笔记
 */
function filterNotesByTag(notes, tag) {
    return notes.filter(note => note.tags && note.tags.includes(tag));
}

/**
 * 获取分类统计
 * @param {Array} notes - 笔记数组
 * @returns {Object} - 各分类的数量
 */
function getCategoryStats(notes) {
    const stats = {};
    
    for (const key of Object.keys(NOTE_CATEGORIES)) {
        stats[key] = 0;
    }
    
    notes.forEach(note => {
        const category = note.category || 'OTHER';
        stats[category] = (stats[category] || 0) + 1;
    });
    
    return stats;
}

/**
 * 获取所有标签及其使用次数
 * @param {Array} notes - 笔记数组
 * @returns {Object} - 标签及其计数
 */
function getAllTags(notes) {
    const tagCount = {};
    
    notes.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        }
    });
    
    // 排序并返回
    return Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [tag, count]) => {
            obj[tag] = count;
            return obj;
        }, {});
}

/**
 * 搜索笔记
 * @param {Array} notes - 笔记数组
 * @param {string} query - 搜索关键词
 * @returns {Array} - 匹配的笔记
 */
function searchNotes(notes, query) {
    if (!query || query.trim() === '') {
        return notes;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return notes.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(lowerQuery);
        const contentMatch = note.content.toLowerCase().includes(lowerQuery);
        const tagsMatch = note.tags && note.tags.some(tag => tag.includes(lowerQuery));
        
        return titleMatch || contentMatch || tagsMatch;
    });
}

/**
 * 手动更改笔记分类
 * @param {Object} note - 笔记对象
 * @param {string} newCategory - 新分类
 */
function changeNoteCategory(note, newCategory) {
    if (NOTE_CATEGORIES[newCategory]) {
        note.category = newCategory;
    }
}

/**
 * 添加标签到笔记
 * @param {Object} note - 笔记对象
 * @param {string} tag - 标签
 */
function addTagToNote(note, tag) {
    if (!note.tags) {
        note.tags = [];
    }
    
    if (!note.tags.includes(tag)) {
        note.tags.push(tag);
    }
}

/**
 * 从笔记移除标签
 * @param {Object} note - 笔记对象
 * @param {string} tag - 标签
 */
function removeTagFromNote(note, tag) {
    if (note.tags) {
        note.tags = note.tags.filter(t => t !== tag);
    }
}
