// AI 智能分类器 v2

// 工作计划区分类器
const WORK_CATEGORIES = {
    TASK: {
        key: 'task',
        name: '今天的工作内容',
        icon: '📌',
        keywords: ['任务', '工作', '开会', '会议', '讨论', '编写', '完成', '处理', '安排', '计划做', '需要做', '待办', '今天要']
    },
    PROGRESS: {
        key: 'progress',
        name: '今日新工作进度',
        icon: '🚀',
        keywords: ['进度', '完成了', '做完', '进展', '达到', '实现了', '搞定', '已完成', '已做', '更新', '推进', '%', '百分']
    },
    LEARNING: {
        key: 'learning',
        name: '今日学习的新知识',
        icon: '📚',
        keywords: ['学习', '学会', '掌握', '了解', '知识', '技能', '教程', '课程', '研究', '阅读', '看了', '理解', '新技术', '算法']
    }
};

// 运动类型映射
const EXERCISE_TYPES = {
    running: { name: '🏃 跑步', caloriesPerMin: 10 },
    gym: { name: '🏋️ 健身房', caloriesPerMin: 8 },
    yoga: { name: '🧘 瑜伽', caloriesPerMin: 4 },
    swimming: { name: '🏊 游泳', caloriesPerMin: 12 },
    cycling: { name: '🚴 骑行', caloriesPerMin: 9 },
    walking: { name: '🚶 步行', caloriesPerMin: 5 },
    other: { name: '其他', caloriesPerMin: 6 }
};

// 自媒体类型
const MEDIA_TYPES = {
    idea: { name: '💡 内容灵感', icon: '💡' },
    plan: { name: '📅 发布计划', icon: '📅' },
    stats: { name: '📊 数据统计', icon: '📊' }
};

/**
 * 分析工作内容，自动分类
 * @param {string} content - 工作内容文本
 * @returns {string} - 分类 key (task/progress/learning)
 */
function classifyWorkContent(content) {
    const text = content.toLowerCase();
    
    const scores = {
        task: 0,
        progress: 0,
        learning: 0
    };
    
    // 计算每个分类的得分
    for (const [key, category] of Object.entries(WORK_CATEGORIES)) {
        for (const keyword of category.keywords) {
            if (text.includes(keyword.toLowerCase())) {
                scores[category.key] += 1;
            }
        }
    }
    
    // 特殊规则：如果包含百分号或"完成了"，优先判定为进度
    if (text.includes('%') || text.includes('百分') || text.includes('完成了') || text.includes('做完了')) {
        scores.progress += 3;
    }
    
    // 特殊规则：如果包含"学"相关词汇，优先判定为学习
    if (text.includes('学习') || text.includes('学会') || text.includes('掌握')) {
        scores.learning += 3;
    }
    
    // 特殊规则：如果包含"任务"、"需要"、"计划"等词，优先判定为任务
    if (text.includes('任务') || text.includes('需要做') || text.includes('计划做') || text.includes('待办')) {
        scores.task += 3;
    }
    
    // 找出得分最高的分类
    let maxScore = 0;
    let bestCategory = 'task'; // 默认分类
    
    for (const [key, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = key;
        }
    }
    
    // 如果所有得分都是 0，按内容长度判断
    if (maxScore === 0) {
        if (content.length < 20) {
            return 'task'; // 短文本默认为任务
        } else if (content.length > 50) {
            return 'learning'; // 长文本可能是学习笔记
        }
    }
    
    return bestCategory;
}

/**
 * 提取关键信息
 * @param {string} content - 内容文本
 * @returns {object} - 提取的信息
 */
function extractKeyInfo(content) {
    const info = {
        hasTime: false,
        hasProgress: false,
        hasQuantity: false
    };
    
    // 提取百分比
    const percentMatch = content.match(/(\d+)%|百分之(\d+)/);
    if (percentMatch) {
        info.hasProgress = true;
        info.progress = percentMatch[1] || percentMatch[2];
    }
    
    // 提取数字
    const numberMatch = content.match(/\d+/g);
    if (numberMatch && numberMatch.length > 0) {
        info.hasQuantity = true;
        info.numbers = numberMatch;
    }
    
    return info;
}

/**
 * 生成 AI 分类提示
 * @param {string} category - 分类结果
 * @param {string} content - 原始内容
 * @returns {string} - 提示信息
 */
function generateClassificationHint(category, content) {
    const categoryInfo = WORK_CATEGORIES[category.toUpperCase()];
    if (!categoryInfo) return '';
    
    const keyInfo = extractKeyInfo(content);
    
    let hint = `${categoryInfo.icon} 已自动分类为：${categoryInfo.name}`;
    
    if (keyInfo.hasProgress) {
        hint += ` | 进度：${keyInfo.progress}%`;
    }
    
    return hint;
}

/**
 * 计算运动消耗的卡路里（如果用户未输入）
 * @param {string} exerciseType - 运动类型
 * @param {number} duration - 时长（分钟）
 * @returns {number} - 估算的卡路里
 */
function estimateCalories(exerciseType, duration) {
    const exercise = EXERCISE_TYPES[exerciseType];
    if (!exercise) return 0;
    
    return Math.round(exercise.caloriesPerMin * duration);
}

/**
 * 格式化运动类型显示
 * @param {string} exerciseType - 运动类型 key
 * @returns {string} - 格式化的名称
 */
function formatExerciseType(exerciseType) {
    const exercise = EXERCISE_TYPES[exerciseType];
    return exercise ? exercise.name : exerciseType;
}

/**
 * 格式化自媒体类型显示
 * @param {string} mediaType - 自媒体类型 key
 * @returns {string} - 格式化的名称
 */
function formatMediaType(mediaType) {
    const media = MEDIA_TYPES[mediaType];
    return media ? media.name : mediaType;
}

/**
 * 获取自媒体类型图标
 * @param {string} mediaType - 自媒体类型 key
 * @returns {string} - 图标
 */
function getMediaIcon(mediaType) {
    const media = MEDIA_TYPES[mediaType];
    return media ? media.icon : '📝';
}