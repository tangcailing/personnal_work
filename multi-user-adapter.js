// ========================================
// 多用户管理适配层
// 在主工作台加载前运行此脚本
// ========================================

const CURRENT_USER_KEY = 'workspace_current_user';
const USERS_KEY = 'workspace_users';

class MultiUserAdapter {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 检查是否有当前用户
        const userId = localStorage.getItem(CURRENT_USER_KEY);
        
        if (!userId) {
            // 未登录，跳转到登录页
            window.location.href = 'login.html';
            return;
        }

        // 加载用户信息
        this.currentUser = this.getUserById(userId);
        
        if (!this.currentUser) {
            // 用户不存在，跳转到登录页
            localStorage.removeItem(CURRENT_USER_KEY);
            window.location.href = 'login.html';
            return;
        }

        // 渲染用户信息栏
        this.renderUserBar();
    }

    getUserById(userId) {
        const usersData = localStorage.getItem(USERS_KEY);
        if (!usersData) return null;
        
        const users = JSON.parse(usersData);
        return users.find(u => u.id === userId);
    }

    renderUserBar() {
        // 创建用户信息栏
        const userBar = document.createElement('div');
        userBar.className = 'user-bar';
        userBar.innerHTML = `
            <div class="user-info-left">
                <span class="user-avatar">${this.currentUser.avatar}</span>
                <span class="user-name">${this.currentUser.username}</span>
                <span class="user-tag">v3.0 多用户版</span>
            </div>
            <div class="user-actions">
                <button class="user-btn" onclick="multiUserAdapter.switchUser()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    切换用户
                </button>
                <button class="user-btn logout" onclick="multiUserAdapter.logout()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    登出
                </button>
            </div>
        `;

        // 插入到 body 开头
        document.body.insertBefore(userBar, document.body.firstChild);

        // 添加样式
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .user-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 56px;
                background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,245,255,0.95) 100%);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid var(--border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 24px;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }

            .user-info-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .user-avatar {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #9b87f5 0%, #b8a9f7 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .user-name {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-primary);
            }

            .user-tag {
                font-size: 12px;
                color: var(--text-tertiary);
                padding: 2px 8px;
                background: var(--primary-alpha-10);
                border-radius: 4px;
            }

            .user-actions {
                display: flex;
                gap: 8px;
            }

            .user-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: transparent;
                border: 1px solid var(--border);
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.2s;
            }

            .user-btn:hover {
                border-color: var(--primary);
                color: var(--primary);
                background: var(--primary-alpha-10);
            }

            .user-btn.logout:hover {
                border-color: #ef4444;
                color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }

            .user-btn svg {
                flex-shrink: 0;
            }

            /* 调整主容器为用户栏让出空间 */
            .app-container {
                margin-top: 56px !important;
            }

            .sidebar {
                top: 56px !important;
                height: calc(100vh - 56px) !important;
            }

            .main-content {
                margin-top: 56px;
            }

            /* AI助手侧边栏也需要调整 */
            .ai-sidebar {
                top: 56px !important;
                height: calc(100vh - 56px) !important;
            }

            /* 快速操作按钮也需要调整 */
            .quick-actions {
                bottom: 24px;
            }

            @media (max-width: 768px) {
                .user-bar {
                    padding: 0 16px;
                }

                .user-tag {
                    display: none;
                }

                .user-btn span {
                    display: none;
                }

                .user-btn {
                    padding: 8px 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 数据隔离：获取当前用户的 localStorage key
    getUserStorageKey(key) {
        return `user_${this.currentUser.id}_${key}`;
    }

    // 切换用户
    switchUser() {
        if (confirm('切换用户将返回登录页面，当前未保存的内容将丢失。确定要切换吗？')) {
            window.location.href = 'login.html';
        }
    }

    // 登出
    logout() {
        if (confirm('确定要登出吗？当前未保存的内容将丢失。')) {
            localStorage.removeItem(CURRENT_USER_KEY);
            window.location.href = 'login.html';
        }
    }

    // 获取当前用户的 API Key
    getApiKey() {
        return this.currentUser.apiKey || '';
    }

    // 更新 API Key
    updateApiKey(newKey) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find(u => u.id === this.currentUser.id);
        if (user) {
            user.apiKey = newKey;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            this.currentUser.apiKey = newKey;
        }
    }
}

// 全局实例
let multiUserAdapter;

// 页面加载时立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        multiUserAdapter = new MultiUserAdapter();
    });
} else {
    multiUserAdapter = new MultiUserAdapter();
}

// ========================================
// 替换原生 localStorage 为用户隔离版本
// ========================================

// 保存原生方法
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalGetItem = localStorage.getItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);

// 不需要隔离的 key（用户系统本身的数据）
const SYSTEM_KEYS = [CURRENT_USER_KEY, USERS_KEY];

// 重写 setItem
localStorage.setItem = function(key, value) {
    if (SYSTEM_KEYS.includes(key) || !multiUserAdapter) {
        originalSetItem(key, value);
    } else {
        const userKey = multiUserAdapter.getUserStorageKey(key);
        originalSetItem(userKey, value);
    }
};

// 重写 getItem
localStorage.getItem = function(key) {
    if (SYSTEM_KEYS.includes(key) || !multiUserAdapter) {
        return originalGetItem(key);
    } else {
        const userKey = multiUserAdapter.getUserStorageKey(key);
        return originalGetItem(userKey);
    }
};

// 重写 removeItem
localStorage.removeItem = function(key) {
    if (SYSTEM_KEYS.includes(key) || !multiUserAdapter) {
        originalRemoveItem(key);
    } else {
        const userKey = multiUserAdapter.getUserStorageKey(key);
        originalRemoveItem(userKey);
    }
};

console.log('✅ 多用户适配层已加载');
