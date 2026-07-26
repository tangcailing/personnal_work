// 个人工作台 v2 - 主应用逻辑

// 数据存储键名
const STORAGE_KEYS = {
    WORK: 'workspace_v2_work',
    FITNESS: 'workspace_v2_fitness',
    MEDIA: 'workspace_v2_media',
    REFLECTION: 'workspace_v2_reflection',
    POMODORO: 'workspace_v2_pomodoro',
    EXPRESSION: 'workspace_v2_expression',
    CHECKIN: 'workspace_v2_checkin'  // 新增：打卡数据
};

// 全局数据
let workData = {
    tasks: [],
    progress: [],
    learning: []
};

let fitnessData = [];
let mediaData = [];
let reflectionData = [];
let pomodoroData = {
    count: 0,
    focusTime: 0,
    lastReset: new Date().toDateString()
};

// 表达训练数据
let expressionData = [];
let currentStory = null;
let currentRetelling = '';

// 打卡数据（新增）
let checkinData = {
    firstCheckinDate: null,      // 首次打卡日期
    totalDays: 0,                 // 总打卡天数
    continuousDays: 0,            // 连续打卡天数
    lastCheckinDate: null,        // 最后打卡日期
    checkinHistory: []            // 打卡历史 ['2024-12-25', '2024-12-26', ...]
};

// 番茄钟状态
let timerInterval = null;
let timerSeconds = 25 * 60;
let isTimerRunning = false;

// 当前激活的 Tab
let currentTab = 'work';

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化通义千问 API
    if (typeof qianwenAPI !== 'undefined') {
        qianwenAPI.init();
    }
    
    loadAllData();
    updateTime();
    setInterval(updateTime, 1000);
    renderAll();
});

// ==================== 时间更新 ====================
function updateTime() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    document.getElementById('currentDate').textContent = `${year} 年 ${month} 月 ${day} 日 ${weekday}`;
}

// ==================== Tab 切换 ====================
function switchTab(tabName) {
    currentTab = tabName;
    
    // 移除所有激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活当前 Tab
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`content-${tabName}`).classList.add('active');
}

// ==================== 数据加载与保存 ====================
function loadAllData() {
    // 加载工作数据
    const savedWork = localStorage.getItem(STORAGE_KEYS.WORK);
    if (savedWork) {
        workData = JSON.parse(savedWork);
    }
    
    // 加载健身数据
    const savedFitness = localStorage.getItem(STORAGE_KEYS.FITNESS);
    if (savedFitness) {
        fitnessData = JSON.parse(savedFitness);
    }
    
    // 加载自媒体数据
    const savedMedia = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (savedMedia) {
        mediaData = JSON.parse(savedMedia);
    }
    
    // 加载感悟数据
    const savedReflection = localStorage.getItem(STORAGE_KEYS.REFLECTION);
    if (savedReflection) {
        reflectionData = JSON.parse(savedReflection);
    }
    
    // 加载番茄钟数据
    const savedPomodoro = localStorage.getItem(STORAGE_KEYS.POMODORO);
    if (savedPomodoro) {
        pomodoroData = JSON.parse(savedPomodoro);
        
        // 检查是否需要重置（新的一天）
        const today = new Date().toDateString();
        if (pomodoroData.lastReset !== today) {
            pomodoroData = {
                count: 0,
                focusTime: 0,
                lastReset: today
            };
            savePomodoroData();
        }
    }
    
    // 加载表达训练数据
    const savedExpression = localStorage.getItem(STORAGE_KEYS.EXPRESSION);
    if (savedExpression) {
        expressionData = JSON.parse(savedExpression);
    }
    
    // 加载打卡数据（新增）
    const savedCheckin = localStorage.getItem(STORAGE_KEYS.CHECKIN);
    if (savedCheckin) {
        checkinData = JSON.parse(savedCheckin);
    }
}

function saveWorkData() {
    localStorage.setItem(STORAGE_KEYS.WORK, JSON.stringify(workData));
}

function saveFitnessData() {
    localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(fitnessData));
}

function saveMediaData() {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaData));
}

function saveReflectionData() {
    localStorage.setItem(STORAGE_KEYS.REFLECTION, JSON.stringify(reflectionData));
}

function savePomodoroData() {
    localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(pomodoroData));
}

function saveExpressionData() {
    localStorage.setItem(STORAGE_KEYS.EXPRESSION, JSON.stringify(expressionData));
}

function saveCheckinData() {
    localStorage.setItem(STORAGE_KEYS.CHECKIN, JSON.stringify(checkinData));
}

// ==================== 渲染所有视图 ====================
function renderAll() {
    renderWorkItems();
    renderFitnessData();
    renderMediaData();
    renderReflectionData();
    renderPomodoroStats();
    renderCheckinInfo();
    renderGrowthCurve();
    renderExpressionHistory();
    renderStats();
    updateTabCounts();
}

function updateTabCounts() {
    const workCount = workData.tasks.length + workData.progress.length + workData.learning.length;
    document.getElementById('work-count').textContent = `${workCount} 条`;
    
    document.getElementById('fitness-count').textContent = `${fitnessData.length} 条`;
    document.getElementById('media-count').textContent = `${mediaData.length} 条`;
    document.getElementById('reflection-count').textContent = `${reflectionData.length} 条`;
    document.getElementById('pomodoro-count').textContent = `${pomodoroData.count} 个`;
    
    // 更新表达训练计数
    updateExpressionCount();
}

// ==================== 工作计划区 ====================
function addWorkItem() {
    const input = document.getElementById('workInput');
    const typeSelect = document.getElementById('workTypeManual');
    
    const content = input.value.trim();
    if (!content) {
        alert('请输入工作内容！');
        return;
    }
    
    // 确定分类
    let type = typeSelect.value;
    if (type === 'auto') {
        type = classifyWorkContent(content);
    }
    
    // 创建工作项
    const item = {
        content: content,
        time: formatCurrentTime(),
        createdAt: new Date().toISOString()
    };
    
    // 添加到对应分类
    if (type === 'task') {
        workData.tasks.unshift(item);
    } else if (type === 'progress') {
        workData.progress.unshift(item);
    } else if (type === 'learning') {
        workData.learning.unshift(item);
    }
    
    // 显示分类结果
    const hint = generateClassificationHint(type, content);
    if (hint) {
        showToast(hint);
    }
    
    input.value = '';
    typeSelect.value = 'auto';
    
    saveWorkData();
    renderWorkItems();
    updateTabCounts();
}

function renderWorkItems() {
    renderWorkList('workTaskList', workData.tasks);
    renderWorkList('workProgressList', workData.progress);
    renderWorkList('workLearningList', workData.learning);
}

function renderWorkList(containerId, items) {
    const container = document.getElementById(containerId);
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div>暂无记录</div></div>';
        return;
    }
    
    container.innerHTML = items.map((item, index) => `
        <div class="work-item">
            <div class="work-item-content">${escapeHtml(item.content)}</div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="work-item-time">${item.time}</span>
                <button class="btn btn-danger btn-sm" onclick="deleteWorkItem('${containerId}', ${index})">删除</button>
            </div>
        </div>
    `).join('');
}

function deleteWorkItem(listId, index) {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    if (listId === 'workTaskList') {
        workData.tasks.splice(index, 1);
    } else if (listId === 'workProgressList') {
        workData.progress.splice(index, 1);
    } else if (listId === 'workLearningList') {
        workData.learning.splice(index, 1);
    }
    
    saveWorkData();
    renderWorkItems();
    updateTabCounts();
}

// ==================== 减脂塑形管理 ====================
function addExercise() {
    const typeSelect = document.getElementById('exerciseType');
    const durationInput = document.getElementById('exerciseDuration');
    const caloriesInput = document.getElementById('exerciseCalories');
    
    const type = typeSelect.value;
    const duration = parseInt(durationInput.value);
    
    if (!duration || duration <= 0) {
        alert('请输入有效的运动时长！');
        return;
    }
    
    // 如果用户未输入卡路里，自动估算
    let calories = parseInt(caloriesInput.value);
    if (!calories || calories <= 0) {
        calories = estimateCalories(type, duration);
    }
    
    const item = {
        type: type,
        duration: duration,
        calories: calories,
        time: formatCurrentTime(),
        createdAt: new Date().toISOString()
    };
    
    fitnessData.unshift(item);
    
    // 清空输入
    durationInput.value = '';
    caloriesInput.value = '';
    
    showToast(`✅ 已添加：${formatExerciseType(type)} ${duration}分钟，消耗 ${calories} 卡路里`);
    
    saveFitnessData();
    renderFitnessData();
    updateTabCounts();
}

function renderFitnessData() {
    // 计算今日统计
    const today = new Date().toDateString();
    const todayData = fitnessData.filter(item => {
        const itemDate = new Date(item.createdAt).toDateString();
        return itemDate === today;
    });
    
    const todayCount = todayData.length;
    const todayTime = todayData.reduce((sum, item) => sum + item.duration, 0);
    const todayCalories = todayData.reduce((sum, item) => sum + item.calories, 0);
    
    // 更新统计卡片
    document.getElementById('todayExerciseCount').textContent = todayCount;
    document.getElementById('todayExerciseTime').textContent = `${todayTime} 分`;
    document.getElementById('todayCalories').textContent = todayCalories;
    
    // 计算目标完成度（假设目标是 500 卡路里）
    const goal = 500;
    const progress = Math.min(Math.round((todayCalories / goal) * 100), 100);
    document.getElementById('fitnessProgress').textContent = `${progress}%`;
    
    // 渲染运动记录列表
    const list = document.getElementById('exerciseList');
    
    if (fitnessData.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏃</div><div>还没有运动记录</div></div>';
        return;
    }
    
    list.innerHTML = fitnessData.map((item, index) => `
        <div class="record-item">
            <div class="record-info">
                <div class="record-title">${formatExerciseType(item.type)}</div>
                <div class="record-details">
                    ⏱️ ${item.duration} 分钟 | 🔥 ${item.calories} 卡路里 | 🕐 ${item.time}
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteFitnessItem(${index})">删除</button>
        </div>
    `).join('');
}

function deleteFitnessItem(index) {
    if (!confirm('确定要删除这条运动记录吗？')) return;
    
    fitnessData.splice(index, 1);
    saveFitnessData();
    renderFitnessData();
    updateTabCounts();
}

// ==================== 打卡系统 ====================

// 获取今日日期字符串
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// 判断两个日期是否连续
function isConsecutiveDays(date1Str, date2Str) {
    if (!date1Str || !date2Str) return false;
    
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
}

// 获取本周打卡进度
function getWeeklyProgress() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (周日) 到 6 (周六)
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 转换为周一=0
    
    const weekProgress = [false, false, false, false, false, false, false];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - mondayOffset + i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (checkinData.checkinHistory.includes(dateStr)) {
            weekProgress[i] = true;
        }
    }
    
    return weekProgress;
}

// 获取成就徽章
function getAchievementBadges() {
    const badges = [];
    const days = checkinData.continuousDays;
    
    // 定义徽章等级
    const achievements = [
        { days: 3, icon: '🌱', name: '初露锋芒', color: '#10b981' },
        { days: 7, icon: '🌟', name: '坚持一周', color: '#3b82f6' },
        { days: 14, icon: '💎', name: '两周达人', color: '#8b5cf6' },
        { days: 30, icon: '👑', name: '月度冠军', color: '#f59e0b' },
        { days: 50, icon: '🏆', name: '五十强者', color: '#ef4444' },
        { days: 100, icon: '🎖️', name: '百日传奇', color: '#ec4899' }
    ];
    
    // 找到已获得的徽章
    for (const achievement of achievements) {
        if (days >= achievement.days) {
            badges.push(achievement);
        }
    }
    
    // 找到下一个待解锁徽章
    let nextBadge = null;
    for (const achievement of achievements) {
        if (days < achievement.days) {
            nextBadge = achievement;
            break;
        }
    }
    
    return { earned: badges, next: nextBadge };
}

// 获取成长数据（本周 vs 上周）
function getGrowthData() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    
    // 本周数据（最近7天）
    const thisWeekData = mediaData.filter(item => {
        const createdDate = new Date(item.createdAt);
        return createdDate >= sevenDaysAgo && createdDate <= today;
    });
    
    // 上周数据（7-14天前）
    const lastWeekData = mediaData.filter(item => {
        const createdDate = new Date(item.createdAt);
        return createdDate >= fourteenDaysAgo && createdDate < sevenDaysAgo;
    });
    
    // 计算平均值
    const calcAverage = (data, field) => {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
        return Math.round(sum / data.length);
    };
    
    const thisWeek = {
        count: thisWeekData.length,
        avgViews: calcAverage(thisWeekData, 'views'),
        avgLikes: calcAverage(thisWeekData, 'likes'),
        avgCollects: calcAverage(thisWeekData, 'collects'),
        avgComments: calcAverage(thisWeekData, 'comments')
    };
    
    const lastWeek = {
        count: lastWeekData.length,
        avgViews: calcAverage(lastWeekData, 'views'),
        avgLikes: calcAverage(lastWeekData, 'likes'),
        avgCollects: calcAverage(lastWeekData, 'collects'),
        avgComments: calcAverage(lastWeekData, 'comments')
    };
    
    // 计算增长率
    const calcGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };
    
    const growth = {
        views: calcGrowth(thisWeek.avgViews, lastWeek.avgViews),
        likes: calcGrowth(thisWeek.avgLikes, lastWeek.avgLikes),
        collects: calcGrowth(thisWeek.avgCollects, lastWeek.avgCollects),
        comments: calcGrowth(thisWeek.avgComments, lastWeek.avgComments)
    };
    
    return { thisWeek, lastWeek, growth };
}

// 生成智能洞察文案
function generateInsights() {
    if (mediaData.length < 2) {
        return '📊 发布更多内容后，我会为你生成智能洞察分析！';
    }
    
    const { thisWeek, lastWeek, growth } = getGrowthData();
    const insights = [];
    
    // 发布频率洞察
    if (thisWeek.count > lastWeek.count) {
        insights.push(`🚀 本周发布了 ${thisWeek.count} 条内容，比上周多 ${thisWeek.count - lastWeek.count} 条！保持高产！`);
    } else if (thisWeek.count < lastWeek.count) {
        insights.push(`⏰ 本周发布 ${thisWeek.count} 条，比上周少了。建议保持稳定的更新频率。`);
    }
    
    // 数据表现洞察
    if (growth.likes > 20) {
        insights.push(`💪 平均点赞数提升 ${growth.likes}%！内容质量在提高！`);
    } else if (growth.likes < -20) {
        insights.push(`💡 点赞数下降 ${Math.abs(growth.likes)}%，建议优化标题和封面。`);
    }
    
    if (growth.views > 30) {
        insights.push(`🔥 阅读量暴涨 ${growth.views}%！找到流量密码了！`);
    }
    
    if (growth.collects > 15) {
        insights.push(`⭐ 收藏率提升 ${growth.collects}%，说明内容实用性强！`);
    }
    
    // 互动洞察
    if (growth.comments > 25) {
        insights.push(`💬 评论增长 ${growth.comments}%，话题讨论度很高！`);
    }
    
    // 综合评价
    const avgGrowth = (growth.views + growth.likes + growth.collects + growth.comments) / 4;
    if (avgGrowth > 20) {
        insights.push(`🎉 整体数据强势上涨，继续保持这个势头！`);
    } else if (avgGrowth < -10) {
        insights.push(`🤔 整体数据有所下滑，建议分析爆款内容的特点。`);
    }
    
    return insights.length > 0 ? insights.join('\n') : '📈 数据表现平稳，继续努力！';
}

// 渲染成长曲线
function renderGrowthCurve() {
    const growthMetrics = document.getElementById('growthMetrics');
    const growthInsights = document.getElementById('growthInsights');
    const insightsList = document.getElementById('insightsList');
    
    if (!growthMetrics || !growthInsights || !insightsList) return;
    
    if (mediaData.length === 0) {
        growthMetrics.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                <div style="font-size: 16px;">发布第一条内容后，这里会显示你的成长曲线</div>
            </div>
        `;
        growthInsights.style.display = 'none';
        return;
    }
    
    const { thisWeek, lastWeek, growth } = getGrowthData();
    const insights = generateInsights();
    
    // 数据卡片
    const renderMetric = (label, thisWeekValue, growthValue, icon) => {
        const isPositive = growthValue > 0;
        const isNegative = growthValue < 0;
        const sign = isPositive ? '+' : '';
        const colorClass = isPositive ? 'up' : (isNegative ? 'down' : 'neutral');
        
        return `
            <div class="growth-metric">
                <div class="growth-metric-icon">${icon}</div>
                <div class="growth-metric-label">${label}</div>
                <div class="growth-metric-value ${colorClass}">${thisWeekValue}</div>
                <div class="growth-metric-change ${colorClass}">
                    ${sign}${growthValue}%
                </div>
            </div>
        `;
    };
    
    growthMetrics.innerHTML = `
        ${renderMetric('阅读量', thisWeek.avgViews, growth.views, '👁️')}
        ${renderMetric('点赞数', thisWeek.avgLikes, growth.likes, '👍')}
        ${renderMetric('收藏数', thisWeek.avgCollects, growth.collects, '⭐')}
        ${renderMetric('评论数', thisWeek.avgComments, growth.comments, '💬')}
    `;
    
    // 智能洞察
    if (insights) {
        insightsList.innerHTML = insights.replace(/\n/g, '<br>');
        growthInsights.style.display = 'block';
    } else {
        growthInsights.style.display = 'none';
    }
}

// 执行打卡
function performCheckin() {
    const today = getTodayString();
    
    // 检查今天是否已打卡
    if (checkinData.checkinHistory.includes(today)) {
        return false; // 已打卡
    }
    
    // 首次打卡
    if (!checkinData.firstCheckinDate) {
        checkinData.firstCheckinDate = today;
    }
    
    // 添加到历史
    checkinData.checkinHistory.push(today);
    checkinData.totalDays++;
    
    // 判断是否连续
    if (isConsecutiveDays(checkinData.lastCheckinDate, today)) {
        checkinData.continuousDays++;
    } else {
        checkinData.continuousDays = 1;
    }
    
    checkinData.lastCheckinDate = today;
    
    // 保存数据
    saveCheckinData();
    
    return true; // 打卡成功
}

// 显示打卡成功动画
function showCheckinSuccess() {
    const days = checkinData.continuousDays;
    const total = checkinData.totalDays;
    
    // 根据连续天数选择不同的庆祝消息
    let message = '';
    if (days === 1) {
        message = `🌱 完成首次打卡！开启成长之旅的第 1 天！`;
    } else if (days === 3) {
        message = `🌱 恭喜解锁【初露锋芒】徽章！连续打卡 ${days} 天！`;
    } else if (days === 7) {
        message = `🌟 恭喜解锁【坚持一周】徽章！连续打卡 ${days} 天！`;
    } else if (days === 14) {
        message = `💎 恭喜解锁【两周达人】徽章！连续打卡 ${days} 天！`;
    } else if (days === 30) {
        message = `👑 恭喜解锁【月度冠军】徽章！连续打卡 ${days} 天！`;
    } else if (days === 50) {
        message = `🏆 恭喜解锁【五十强者】徽章！连续打卡 ${days} 天！`;
    } else if (days === 100) {
        message = `🎖️ 恭喜解锁【百日传奇】徽章！你已成为传奇！`;
    } else {
        const messages = [
            `🎉 太棒了！连续打卡第 ${days} 天！`,
            `💪 坚持就是胜利！今天是第 ${total} 天！`,
            `🌟 你真的很优秀！继续保持！`,
            `🔥 保持这个势头！已坚持 ${days} 天！`
        ];
        message = messages[Math.floor(Math.random() * messages.length)];
    }
    
    showToast(message, 'success');
    
    // 如果是重要里程碑，显示特效
    if ([3, 7, 14, 30, 50, 100].includes(days)) {
        showCelebration();
    }
}

// 显示庆祝特效（里程碑）
function showCelebration() {
    const celebration = document.createElement('div');
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 80px;
        z-index: 9999;
        animation: bounce 0.6s ease-in-out;
        pointer-events: none;
    `;
    celebration.textContent = '🎉';
    document.body.appendChild(celebration);
    
    setTimeout(() => celebration.remove(), 800);
}

// 渲染打卡信息（美化版）
function renderCheckinInfo() {
    const continuousDaysEl = document.getElementById('continuousDays');
    const weekProgressEl = document.getElementById('weekProgress');
    const totalDaysEl = document.getElementById('totalDays');
    
    if (!continuousDaysEl || !weekProgressEl || !totalDaysEl) return;
    
    const weekProgress = getWeeklyProgress();
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
    
    // 更新连续打卡天数
    continuousDaysEl.querySelector('span:nth-child(2)').textContent = checkinData.continuousDays;
    
    // 更新累计打卡天数
    totalDaysEl.querySelector('span:nth-child(2)').textContent = checkinData.totalDays;
    
    // 更新本周进度
    weekProgressEl.innerHTML = weekProgress.map((checked, i) => 
        `<div class="checkin-day-dot ${checked ? 'checked' : ''}">
            ${checked ? '✓' : weekDays[i]}
        </div>`
    ).join('');
}

// ==================== 自媒体运营 ====================
// ==================== 自媒体运营 - AI 分析 ====================

// 保存自媒体记录（不分析）
function saveMediaRecord() {
    const platform = document.getElementById('mediaPlatform').value;
    const contentType = document.getElementById('mediaContentType').value;
    const title = document.getElementById('mediaTitle').value.trim();
    const content = document.getElementById('mediaContent').value.trim();
    const publishTime = document.getElementById('mediaPublishTime').value;
    
    const views = parseInt(document.getElementById('mediaViews').value) || 0;
    const likes = parseInt(document.getElementById('mediaLikes').value) || 0;
    const collects = parseInt(document.getElementById('mediaCollects').value) || 0;
    const comments = parseInt(document.getElementById('mediaComments').value) || 0;
    const shares = parseInt(document.getElementById('mediaShares').value) || 0;
    const follows = parseInt(document.getElementById('mediaFollows').value) || 0;
    
    if (!title) {
        showToast('请输入标题！', 'warning');
        return;
    }
    
    const item = {
        id: Date.now(),
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
        follows,
        analyzed: false,
        createdAt: new Date().toISOString()
    };
    
    mediaData.unshift(item);
    saveMediaData();
    renderMediaData();
    updateTabCounts();
    
    // 清空表单
    clearMediaForm();
    
    showToast('✅ 记录已保存', 'success');
}

// 保存并打卡
function saveAndCheckin() {
    const title = document.getElementById('mediaTitle').value.trim();
    
    if (!title) {
        showToast('请输入标题！', 'warning');
        return;
    }
    
    // 保存记录
    saveMediaRecord();
    
    // 执行打卡
    const success = performCheckin();
    
    if (success) {
        // 打卡成功，显示动画和更新界面
        showCheckinSuccess();
        renderCheckinInfo();
    } else {
        // 今天已打卡
        showToast('😊 今日已打卡，明天见！', 'info');
    }
    
    // 更新成长曲线
    renderGrowthCurve();
}

// AI 智能分析
async function analyzeWithAI() {
    // 获取表单数据
    const platform = document.getElementById('mediaPlatform').value;
    const contentType = document.getElementById('mediaContentType').value;
    const title = document.getElementById('mediaTitle').value.trim();
    const content = document.getElementById('mediaContent').value.trim();
    const publishTime = document.getElementById('mediaPublishTime').value;
    
    const views = parseInt(document.getElementById('mediaViews').value) || 0;
    const likes = parseInt(document.getElementById('mediaLikes').value) || 0;
    const collects = parseInt(document.getElementById('mediaCollects').value) || 0;
    const comments = parseInt(document.getElementById('mediaComments').value) || 0;
    const shares = parseInt(document.getElementById('mediaShares').value) || 0;
    const follows = parseInt(document.getElementById('mediaFollows').value) || 0;
    
    if (!title) {
        showToast('请输入标题！', 'warning');
        return;
    }
    
    // 检查 API Key
    if (!qianwenAPI.hasAPIKey()) {
        const userConfirm = confirm('首次使用需要配置通义千问 API Key，现在配置吗？');
        if (userConfirm) {
            showAPIKeySettings();
        }
        return;
    }
    
    // 显示加载状态
    const analysisResult = document.getElementById('aiAnalysisResult');
    const analysisContent = document.getElementById('analysisContent');
    
    analysisResult.style.display = 'block';
    analysisContent.innerHTML = '<div style="text-align: center; padding: 40px;">🤖 AI 正在深度分析中，请稍候...<br/><br/><div style="color: var(--text-secondary); font-size: 14px;">分析平台算法、对比爆款案例、生成改进建议</div></div>';
    
    // 滚动到结果区
    analysisResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    try {
        // 调用 API 分析
        const analysisText = await qianwenAPI.analyzeMediaContent({
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
        });
        
        // 显示分析结果
        analysisContent.innerHTML = formatAnalysisResult(analysisText);
        
        // 保存记录（包含分析结果）
        const item = {
            id: Date.now(),
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
            follows,
            analyzed: true,
            analysisResult: analysisText,
            createdAt: new Date().toISOString()
        };
        
        mediaData.unshift(item);
        saveMediaData();
        renderMediaData();
        updateTabCounts();
        
        // 清空表单
        clearMediaForm();
        
        showToast('✅ AI 分析完成！', 'success');
        
    } catch (error) {
        console.error('AI 分析失败:', error);
        analysisContent.innerHTML = `<div style="color: var(--danger-color); padding: 20px;">
            ❌ AI 分析失败：${error.message}<br/><br/>
            <button class="btn btn-primary" onclick="showAPIKeySettings()">检查 API 设置</button>
        </div>`;
        showToast('AI 分析失败，请检查 API 设置', 'error');
    }
}

// 格式化分析结果
function formatAnalysisResult(text) {
    // 将纯文本转换为 HTML，保留换行和格式
    let html = text
        .replace(/\n/g, '<br/>')
        .replace(/【(.*?)】/g, '<strong>【$1】</strong>')
        .replace(/##\s*(.*?)(<br\/>|$)/g, '<h4 style="margin-top: 20px; margin-bottom: 10px; color: var(--primary-color);">$1</h4>')
        .replace(/•/g, '&bull;');
    
    return `<div style="line-height: 1.8;">${html}</div>`;
}

// 清空表单
function clearMediaForm() {
    document.getElementById('mediaTitle').value = '';
    document.getElementById('mediaContent').value = '';
    document.getElementById('mediaPublishTime').value = '';
    document.getElementById('mediaViews').value = '';
    document.getElementById('mediaLikes').value = '';
    document.getElementById('mediaCollects').value = '';
    document.getElementById('mediaComments').value = '';
    document.getElementById('mediaShares').value = '';
    document.getElementById('mediaFollows').value = '';
}

// 显示 API Key 设置
function showAPIKeySettings() {
    const currentKey = qianwenAPI.hasAPIKey() ? '已配置（点击"清除"可重新设置）' : '未配置';
    
    const action = prompt(`通义千问 API Key 设置\n\n当前状态：${currentKey}\n\n请输入新的 API Key（格式：sk-xxxxxxx）\n或输入"清除"删除现有配置：`);
    
    if (action === null) {
        return; // 用户取消
    }
    
    if (action.toLowerCase() === '清除' || action.toLowerCase() === 'clear') {
        qianwenAPI.clearAPIKey();
        alert('✅ API Key 已清除');
        return;
    }
    
    if (!action.trim()) {
        return;
    }
    
    try {
        qianwenAPI.saveAPIKey(action.trim());
        alert('✅ API Key 配置成功！\n\n现在可以使用 AI 分析和链接解析功能了。');
    } catch (error) {
        alert('❌ 配置失败：' + error.message);
    }
}

// 解析内容链接
async function parseContentLink() {
    const linkInput = document.getElementById('contentLink');
    const url = linkInput.value.trim();
    
    if (!url) {
        showToast('请输入链接！', 'warning');
        return;
    }
    
    // 检查 API Key
    if (!qianwenAPI.hasAPIKey()) {
        const userConfirm = confirm('链接解析需要 API Key，现在配置吗？');
        if (userConfirm) {
            showAPIKeySettings();
        }
        return;
    }
    
    // 显示加载提示
    showToast('🤖 AI 正在解析链接...', 'info');
    linkInput.disabled = true;
    
    try {
        const result = await qianwenAPI.parseContentLink(url);
        
        // 自动填充表单
        if (result.platform) {
            document.getElementById('mediaPlatform').value = result.platform;
        }
        if (result.contentType) {
            document.getElementById('mediaContentType').value = result.contentType;
        }
        if (result.title) {
            document.getElementById('mediaTitle').value = result.title;
        }
        if (result.content) {
            document.getElementById('mediaContent').value = result.content;
        }
        
        showToast('✅ 链接解析成功！已自动填充内容', 'success');
        linkInput.value = ''; // 清空链接输入框
        
    } catch (error) {
        console.error('解析失败:', error);
        showToast('❌ 解析失败：' + error.message, 'error');
    } finally {
        linkInput.disabled = false;
    }
}

// 渲染自媒体记录列表
function renderMediaData() {
    const list = document.getElementById('mediaList');
    
    if (mediaData.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📱</div><div>还没有记录</div></div>';
        return;
    }
    
    list.innerHTML = mediaData.map((item, index) => {
        const platformNames = {
            'xiaohongshu': '📕 小红书',
            'douyin': '📹 抖音',
            'bilibili': '📺 B站',
            'weixin': '💬 公众号',
            'weibo': '🔶 微博',
            'zhihu': '💡 知乎'
        };
        
        const date = new Date(item.createdAt);
        const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-title">
                        ${platformNames[item.platform] || item.platform} 
                        ${item.analyzed ? '🤖' : ''} 
                        ${item.title}
                    </div>
                    <div class="record-details" style="margin-top: 5px;">
                        👁️ ${item.views || 0} | 👍 ${item.likes || 0} | ⭐ ${item.collects || 0} | 💬 ${item.comments || 0}
                    </div>
                    <div class="record-details" style="margin-top: 5px;">
                        🕐 ${timeStr}
                        ${item.analyzed ? ' | ✅ 已分析' : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    ${item.analyzed ? `<button class="btn btn-sm btn-primary" onclick="showAnalysisDetail(${index})">查看分析</button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteMediaItem(${index})">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 显示分析详情
function showAnalysisDetail(index) {
    const item = mediaData[index];
    if (!item.analyzed || !item.analysisResult) {
        showToast('该记录未包含分析结果', 'warning');
        return;
    }
    
    const analysisResult = document.getElementById('aiAnalysisResult');
    const analysisContent = document.getElementById('analysisContent');
    
    analysisContent.innerHTML = formatAnalysisResult(item.analysisResult);
    analysisResult.style.display = 'block';
    analysisResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteMediaItem(index) {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    mediaData.splice(index, 1);
    saveMediaData();
    renderMediaData();
    updateTabCounts();
}

// ==================== 今日感悟 ====================
function addReflection() {
    const input = document.getElementById('reflectionInput');
    
    const content = input.value.trim();
    if (!content) {
        alert('请输入今日感悟！');
        return;
    }
    
    const item = {
        content: content,
        time: formatCurrentTime(),
        createdAt: new Date().toISOString()
    };
    
    reflectionData.unshift(item);
    
    input.value = '';
    
    showToast('✅ 今日感悟已保存');
    
    saveReflectionData();
    renderReflectionData();
    updateTabCounts();
}

function renderReflectionData() {
    const list = document.getElementById('reflectionList');
    
    if (reflectionData.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💭</div><div>还没有今日感悟</div></div>';
        return;
    }
    
    list.innerHTML = reflectionData.map((item, index) => `
        <div class="record-item">
            <div class="record-info">
                <div class="record-details" style="color: var(--text-primary); font-size: 14px; line-height: 1.6;">
                    ${escapeHtml(item.content)}
                </div>
                <div class="record-details" style="margin-top: 8px;">
                    🕐 ${item.time}
                </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteReflection(${index})">删除</button>
        </div>
    `).join('');
}

function deleteReflection(index) {
    if (!confirm('确定要删除这条感悟吗？')) return;
    
    reflectionData.splice(index, 1);
    saveReflectionData();
    renderReflectionData();
    updateTabCounts();
}

// ==================== 番茄钟 ====================
function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            completePomodoro();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;
    
    isTimerRunning = false;
    clearInterval(timerInterval);
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function completePomodoro() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    pomodoroData.count++;
    pomodoroData.focusTime += 25;
    
    alert('🎉 番茄钟完成！休息一下吧！');
    
    timerSeconds = 5 * 60; // 休息 5 分钟
    updateTimerDisplay();
    
    savePomodoroData();
    renderPomodoroStats();
    renderStats();
    updateTabCounts();
}

function renderPomodoroStats() {
    document.getElementById('pomodoroCount').textContent = pomodoroData.count;
    document.getElementById('focusTime').textContent = `${pomodoroData.focusTime} 分`;
}

// ==================== 数据统计 ====================
function renderStats() {
    const workCount = workData.tasks.length + workData.progress.length + workData.learning.length;
    
    // 计算今日数据
    const today = new Date().toDateString();
    const todayFitness = fitnessData.filter(item => 
        new Date(item.createdAt).toDateString() === today
    );
    const todayCalories = todayFitness.reduce((sum, item) => sum + item.calories, 0);
    
    const statsHtml = `
        <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6, #6366f1);">
            <div class="stat-card-title">工作记录</div>
            <div class="stat-card-value">${workCount}</div>
            <div class="stat-card-trend">今日累计</div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
            <div class="stat-card-title">运动次数</div>
            <div class="stat-card-value">${todayFitness.length}</div>
            <div class="stat-card-trend">今日累计</div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
            <div class="stat-card-title">消耗卡路里</div>
            <div class="stat-card-value">${todayCalories}</div>
            <div class="stat-card-trend">今日累计</div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
            <div class="stat-card-title">番茄钟</div>
            <div class="stat-card-value">${pomodoroData.count}</div>
            <div class="stat-card-trend">今日完成</div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
            <div class="stat-card-title">自媒体</div>
            <div class="stat-card-value">${mediaData.length}</div>
            <div class="stat-card-trend">累计记录</div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #ec4899, #db2777);">
            <div class="stat-card-title">今日感悟</div>
            <div class="stat-card-value">${reflectionData.length}</div>
            <div class="stat-card-trend">累计记录</div>
        </div>
    `;
    
    document.getElementById('statsGrid').innerHTML = statsHtml;
}

// ==================== 工具函数 ====================
function formatCurrentTime() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== 表达训练模块 ====================

// 加载新故事
async function loadNewStory() {
    try {
        showToast('正在加载故事...', 'info');
        const story = await storyAPI.getRandomStory();
        
        currentStory = story;
        currentRetelling = '';
        
        // 显示故事
        document.getElementById('storyTitle').textContent = story.title;
        document.getElementById('storyContent').textContent = story.content;
        document.getElementById('storyWordCount').textContent = story.content.length;
        document.getElementById('storySection').style.display = 'block';
        
        // 清空重述
        document.getElementById('retellingInput').value = '';
        document.getElementById('retellingWordCount').textContent = '0';
        
        // 隐藏对比区
        document.getElementById('comparisonSection').style.display = 'none';
        
        showToast('故事加载成功！开始阅读吧 📖', 'success');
    } catch (error) {
        console.error('加载故事失败:', error);
        showToast('加载故事失败，请稍后重试', 'error');
    }
}

// 切换故事显示/隐藏
function toggleStoryVisibility() {
    const storyContent = document.getElementById('storyContent');
    const toggleBtn = document.getElementById('toggleStoryBtn');
    
    if (storyContent.style.display === 'none') {
        storyContent.style.display = 'block';
        toggleBtn.textContent = '👁️ 隐藏故事';
    } else {
        storyContent.style.display = 'none';
        toggleBtn.textContent = '👁️ 显示故事';
    }
}

// 实时统计字数
document.addEventListener('DOMContentLoaded', function() {
    const retellingInput = document.getElementById('retellingInput');
    if (retellingInput) {
        retellingInput.addEventListener('input', function() {
            const wordCount = this.value.length;
            document.getElementById('retellingWordCount').textContent = wordCount;
            currentRetelling = this.value;
        });
    }
});

// 提交重述
function submitRetelling() {
    const retelling = document.getElementById('retellingInput').value.trim();
    
    if (!currentStory) {
        showToast('请先加载一个故事！', 'warning');
        return;
    }
    
    if (!retelling) {
        showToast('请先输入你的重述内容！', 'warning');
        return;
    }
    
    // 保存训练记录
    const record = {
        id: Date.now(),
        storyTitle: currentStory.title,
        originalContent: currentStory.content,
        retelling: retelling,
        timestamp: new Date().toISOString(),
        wordCount: retelling.length,
        originalWordCount: currentStory.content.length
    };
    
    expressionData.unshift(record);
    saveExpressionData();
    
    // 生成 AI 点评
    generateAIReview(currentStory.content, retelling);
    
    // 显示对比
    showComparison();
    
    // 更新统计
    updateExpressionCount();
    renderExpressionHistory();
    
    showToast('重述已保存！查看下方的对比和点评 ✨', 'success');
}

// 显示对比
function showComparison() {
    if (!currentStory) {
        showToast('请先加载一个故事！', 'warning');
        return;
    }
    
    const retelling = document.getElementById('retellingInput').value.trim();
    
    if (!retelling) {
        showToast('请先输入重述内容！', 'warning');
        return;
    }
    
    // 显示对比区域
    document.getElementById('comparisonOriginal').textContent = currentStory.content;
    document.getElementById('comparisonRetelling').textContent = retelling;
    document.getElementById('comparisonSection').style.display = 'block';
    
    // 滚动到对比区域
    document.getElementById('comparisonSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 生成 AI 点评
function generateAIReview(original, retelling) {
    // 简单的评分逻辑
    const originalLength = original.length;
    const retellingLength = retelling.length;
    const lengthRatio = retellingLength / originalLength;
    
    let review = '<div style="margin-bottom: 10px;"><strong>📊 表达分析：</strong></div>';
    
    // 字数对比
    review += `<div style="margin-bottom: 8px;">📝 <strong>字数：</strong>原文 ${originalLength} 字，重述 ${retellingLength} 字`;
    if (lengthRatio > 1.2) {
        review += '（表述较详细，注意精炼）';
    } else if (lengthRatio < 0.5) {
        review += '（表述较简略，可以更详细）';
    } else {
        review += '（字数适中 ✓）';
    }
    review += '</div>';
    
    // 完整性评估
    review += '<div style="margin-bottom: 8px;">✅ <strong>完整性：</strong>';
    if (lengthRatio > 0.6 && lengthRatio < 1.3) {
        review += '重述较为完整，基本涵盖了主要内容 ✓';
    } else if (lengthRatio < 0.6) {
        review += '重述相对简略，建议补充更多细节';
    } else {
        review += '内容充分，注意避免冗余表达';
    }
    review += '</div>';
    
    // 表达建议
    review += '<div style="margin-bottom: 8px;">💡 <strong>建议：</strong>';
    const suggestions = [
        '尝试用自己的语言组织，避免直接复述原文',
        '注意保留故事的关键情节和核心思想',
        '可以加入自己的理解和感悟',
        '练习使用连贯的逻辑串联各个要点'
    ];
    review += suggestions[Math.floor(Math.random() * suggestions.length)];
    review += '</div>';
    
    // 鼓励
    review += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #10b981;">';
    review += '🌟 <strong>继续保持！</strong>每一次练习都是进步的机会。坚持训练，你的表达能力会越来越好！';
    review += '</div>';
    
    document.getElementById('aiReview').innerHTML = review;
    document.getElementById('aiReviewSection').style.display = 'block';
}

// 清空重述
function clearRetelling() {
    if (confirm('确定要清空当前重述内容吗？')) {
        document.getElementById('retellingInput').value = '';
        document.getElementById('retellingWordCount').textContent = '0';
        currentRetelling = '';
        showToast('已清空重述内容', 'info');
    }
}

// 渲染训练记录
function renderExpressionHistory() {
    const container = document.getElementById('expressionHistory');
    
    if (expressionData.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📖</div><div>还没有训练记录，开始第一次训练吧！</div></div>';
        return;
    }
    
    container.innerHTML = expressionData.map(record => {
        const date = new Date(record.timestamp);
        const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-title">📚 ${record.storyTitle}</div>
                    <div class="record-details">
                        ${timeStr} · 原文 ${record.originalWordCount} 字 · 重述 ${record.wordCount} 字
                    </div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteExpressionRecord(${record.id})">删除</button>
            </div>
        `;
    }).join('');
}

// 删除训练记录
function deleteExpressionRecord(id) {
    if (confirm('确定要删除这条训练记录吗？')) {
        expressionData = expressionData.filter(item => item.id !== id);
        saveExpressionData();
        renderExpressionHistory();
        updateExpressionCount();
        showToast('已删除训练记录', 'success');
    }
}

// 更新表达训练计数
function updateExpressionCount() {
    const today = new Date().toDateString();
    const todayCount = expressionData.filter(item => {
        const itemDate = new Date(item.timestamp).toDateString();
        return itemDate === today;
    }).length;
    
    const countElem = document.getElementById('expression-count');
    if (countElem) {
        countElem.textContent = `${todayCount} 次`;
    }
}




// ==================== 数据备份/恢复功能（iPhone 专用）====================

// 导出所有数据
function exportAllData() {
    const allData = {
        version: '2.1',
        exportTime: new Date().toISOString(),
        workData: workData,
        fitnessData: fitnessData,
        mediaData: mediaData,
        reflectionData: reflectionData,
        pomodoroData: pomodoroData,
        expressionData: expressionData,
        checkinData: checkinData,
        growthData: growthData
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    
    // iOS Safari 备份方案：复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(dataStr).then(() => {
            alert('✅ 数据已复制到剪贴板！\n\n下一步：\n1. 打开「备忘录」App\n2. 新建备忘录\n3. 长按粘贴\n4. 标题命名：工作台备份 ' + new Date().toLocaleDateString());
        }).catch(() => {
            // 降级方案：手动复制
            showManualCopy(dataStr);
        });
    } else {
        // 不支持剪贴板 API，使用 prompt
        showManualCopy(dataStr);
    }
}

// 手动复制提示
function showManualCopy(dataStr) {
    const textarea = document.createElement('textarea');
    textarea.value = dataStr;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '100%';
    textarea.style.height = '200px';
    textarea.style.zIndex = '10000';
    textarea.style.fontSize = '12px';
    document.body.appendChild(textarea);
    textarea.select();
    
    alert('📋 请手动复制下面的数据：\n\n1. 点击「确定」\n2. 全选文本框内容\n3. 复制（长按 → 拷贝）\n4. 粘贴到备忘录保存');
    
    setTimeout(() => {
        document.body.removeChild(textarea);
    }, 60000); // 60秒后自动移除
}

// 导入数据
function importAllData() {
    const input = prompt('📋 请粘贴备份数据\n（从备忘录复制完整内容）：');
    if (!input) return;
    
    try {
        const importedData = JSON.parse(input);
        
        // 确认导入
        const confirmMsg = `确定要恢复备份吗？\n\n备份时间: ${new Date(importedData.exportTime).toLocaleString()}\n版本: ${importedData.version}\n\n⚠️ 当前数据将被覆盖！`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        // 恢复数据
        if (importedData.workData) {
            workData = importedData.workData;
            localStorage.setItem(STORAGE_KEYS.WORK, JSON.stringify(workData));
        }
        if (importedData.fitnessData) {
            fitnessData = importedData.fitnessData;
            localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(fitnessData));
        }
        if (importedData.mediaData) {
            mediaData = importedData.mediaData;
            localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(mediaData));
        }
        if (importedData.reflectionData) {
            reflectionData = importedData.reflectionData;
            localStorage.setItem(STORAGE_KEYS.REFLECTION, JSON.stringify(reflectionData));
        }
        if (importedData.pomodoroData) {
            pomodoroData = importedData.pomodoroData;
            localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(pomodoroData));
        }
        if (importedData.expressionData) {
            expressionData = importedData.expressionData;
            localStorage.setItem(STORAGE_KEYS.EXPRESSION, JSON.stringify(expressionData));
        }
        if (importedData.checkinData) {
            checkinData = importedData.checkinData;
            localStorage.setItem(STORAGE_KEYS.CHECKIN, JSON.stringify(checkinData));
        }
        if (importedData.growthData) {
            growthData = importedData.growthData;
            localStorage.setItem(STORAGE_KEYS.GROWTH, JSON.stringify(growthData));
        }
        
        alert('✅ 数据恢复成功！\n页面即将刷新...');
        
        // 刷新界面
        setTimeout(() => {
            location.reload();
        }, 500);
        
    } catch (error) {
        alert('❌ 数据格式错误！\n请确保粘贴的是完整的备份数据。\n\n错误信息: ' + error.message);
        console.error('导入错误:', error);
    }
}

// 显示备份说明
function showBackupTip() {
    alert(`📱 iPhone 数据备份指南

⚠️ 为什么要备份？
iOS Safari 会定期清理网页数据，可能导致你的打卡记录丢失。

📥 如何备份？（建议每周1次）
1. 点击「📥 备份数据」
2. 数据自动复制到剪贴板
3. 打开「备忘录」App
4. 新建备忘录，长按粘贴
5. 标题命名如：工作台备份 2026-07-30

📤 如何恢复？
1. 打开备忘录，找到备份
2. 全选复制备份数据
3. 回到工作台，点击「📤 恢复数据」
4. 粘贴数据，确认恢复

💡 重要提示：
• 打卡达到 7天、30天 等里程碑时记得备份
• 备忘录可以用 iCloud 同步，更安全
• 每次备份会覆盖旧备份，可以保留多个版本

🔧 如果数据丢失了：
只要有备份，随时可以完整恢复！`);
}
