// 全局变量
const app = {
  // 数据存储
  data: {
    user: {
      height: 170,
      initialWeight: 70,
      targetWeight: 60,
      age: 25,
      gender: 'male',
      dailyCaloriesTarget: 2000,
      weeklyWeightLossTarget: 0.5
    },
    weights: [
      { date: '2023-07-15', value: 68.5, notes: '' },
      { date: '2023-07-16', value: 68.2, notes: '' },
      { date: '2023-07-17', value: 68.0, notes: '' },
      { date: '2023-07-18', value: 67.8, notes: '' },
      { date: '2023-07-19', value: 67.5, notes: '' },
      { date: '2023-07-20', value: 67.2, notes: '' },
      { date: '2023-07-21', value: 67.0, notes: '' }
    ],
    foodRecords: [
      { 
        id: 'f1', 
        date: '2023-07-21', 
        time: 'breakfast', 
        name: '全麦面包', 
        calories: 250, 
        notes: '2片', 
        image: null, 
        voiceNote: null,
        timestamp: '2023-07-21T08:00:00'
      },
      { 
        id: 'f2', 
        date: '2023-07-21', 
        time: 'lunch', 
        name: '沙拉', 
        calories: 400, 
        notes: '包含鸡胸肉', 
        image: null, 
        voiceNote: null,
        timestamp: '2023-07-21T12:30:00'
      },
      { 
        id: 'f3', 
        date: '2023-07-21', 
        time: 'dinner', 
        name: '烤鱼', 
        calories: 500, 
        notes: '配蔬菜', 
        image: null, 
        voiceNote: null,
        timestamp: '2023-07-21T19:00:00'
      }
    ],
    exerciseRecords: [
      { 
        id: 'e1', 
        date: '2023-07-21', 
        type: 'running', 
        duration: 30, 
        calories: 300, 
        notes: '慢跑', 
        image: null, 
        voiceNote: null,
        timestamp: '2023-07-21T07:00:00'
      },
      { 
        id: 'e2', 
        date: '2023-07-21', 
        type: 'gym', 
        duration: 60, 
        calories: 500, 
        notes: '力量训练', 
        image: null, 
        voiceNote: null,
        timestamp: '2023-07-21T18:00:00'
      }
    ],
    drafts: {
      food: null,
      exercise: null
    }
  },
  
  // 图表实例
  charts: {
    weightTrend: null,
    weight: null,
    calories: null
  },
  
  // 当前状态
  currentPage: 'home-page',
  currentFilter: 'week',
  recordingActive: false,
  recordingTimer: null,
  recordingSeconds: 0,
  
  // 初始化应用
  init() {
    this.loadData();
    this.setupEventListeners();
    this.renderHomePage();
    this.renderRecordsPage();
    this.renderStatsPage();
    this.setupSettingsForm();
  },
  
  // 从本地存储加载数据
  loadData() {
    const savedData = localStorage.getItem('fitnessTrackerData');
    if (savedData) {
      this.data = JSON.parse(savedData);
    }
  },
  
  // 保存数据到本地存储
  saveData() {
    localStorage.setItem('fitnessTrackerData', JSON.stringify(this.data));
  },
  
  // 设置事件监听器
  setupEventListeners() {
    // 页面导航
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.getAttribute('href').substring(1);
        this.navigateTo(pageId);
      });
    });
    
    // 快捷操作按钮
    document.getElementById('add-food-btn').addEventListener('click', () => {
      this.openModal('food-modal');
    });
    
    document.getElementById('add-exercise-btn').addEventListener('click', () => {
      this.openModal('exercise-modal');
    });
    
    document.getElementById('add-weight-btn').addEventListener('click', () => {
      this.openModal('weight-modal');
      // 设置默认日期为今天
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('weight-date').value = today;
    });
    
    // 模态框关闭按钮
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });
    
    // 点击模态框背景关闭
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    });
    
    // 记录标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
    
    // 时间筛选
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const period = btn.getAttribute('data-period');
        this.setFilter(period);
      });
    });
    
    // 表单提交
    document.getElementById('food-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFoodRecord();
    });
    
    document.getElementById('exercise-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveExerciseRecord();
    });
    
    document.getElementById('weight-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveWeightRecord();
    });
    
    document.getElementById('personal-info-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePersonalInfo();
    });
    
    document.getElementById('goals-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveGoals();
    });
    
    // 图片上传预览
    document.getElementById('food-image').addEventListener('change', (e) => {
      this.previewImage(e.target, 'food');
    });
    
    document.getElementById('exercise-image').addEventListener('change', (e) => {
      this.previewImage(e.target, 'exercise');
    });
    
    // 移除图片
    document.querySelectorAll('.remove-image').forEach(btn => {
      btn.addEventListener('click', () => {
        const preview = btn.closest('.image-preview');
        preview.classList.add('hidden');
        preview.previousElementSibling.classList.remove('hidden');
        preview.previousElementSibling.nextElementSibling.value = '';
      });
    });
    
    // 卡路里识别
    document.getElementById('recognize-calories').addEventListener('click', () => {
      this.recognizeCalories();
    });
    
    // 卡路里计算
    document.getElementById('calculate-calories').addEventListener('click', () => {
      this.calculateExerciseCalories();
    });
    
    // 语音录制
    document.getElementById('voice-record-btn').addEventListener('click', () => {
      this.toggleRecording('food');
    });
    
    document.getElementById('exercise-voice-record-btn').addEventListener('click', () => {
      this.toggleRecording('exercise');
    });
    
    // 保存草稿
    document.querySelectorAll('.save-draft').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = btn.closest('form');
        if (form.id === 'food-form') {
          this.saveDraft('food');
        } else if (form.id === 'exercise-form') {
          this.saveDraft('exercise');
        }
      });
    });
    
    // 数据管理
    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.exportData();
    });
    
    document.getElementById('clear-data-btn').addEventListener('click', () => {
      this.clearData();
    });
    
    // 下拉刷新
    let touchStartY = 0;
    let touchEndY = 0;
    const refreshThreshold = 100;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchmove', (e) => {
      touchEndY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchend', () => {
      const currentPage = document.querySelector('.page.active');
      const scrollTop = currentPage.scrollTop || document.documentElement.scrollTop;
      
      if (scrollTop === 0 && touchEndY - touchStartY > refreshThreshold) {
        this.refreshData();
      }
    }, false);
  },
  
  // 页面导航
  navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`.nav-item[href="#${pageId}"]`).classList.add('active');
    
    this.currentPage = pageId;
    
    // 根据页面更新内容
    if (pageId === 'home-page') {
      this.renderHomePage();
    } else if (pageId === 'records-page') {
      this.renderRecordsPage();
    } else if (pageId === 'stats-page') {
      this.renderStatsPage();
    } else if (pageId === 'settings-page') {
      this.setupSettingsForm();
    }
  },
  
  // 打开模态框
  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    
    // 加载草稿
    if (modalId === 'food-modal' && this.data.drafts.food) {
      this.loadDraft('food');
    } else if (modalId === 'exercise-modal' && this.data.drafts.exercise) {
      this.loadDraft('exercise');
    }
  },
  
  // 关闭模态框
  closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
    
    // 重置表单
    document.querySelectorAll('.record-form').forEach(form => {
      form.reset();
    });
    
    // 重置图片预览
    document.querySelectorAll('.image-preview').forEach(preview => {
      preview.classList.add('hidden');
    });
    
    document.querySelectorAll('.upload-placeholder').forEach(placeholder => {
      placeholder.classList.remove('hidden');
    });
    
    // 停止录音
    if (this.recordingActive) {
      this.stopRecording();
    }
  },
  
  // 切换标签
  switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
  },
  
  // 设置筛选
  setFilter(period) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelector(`.filter-btn[data-period="${period}"]`).classList.add('active');
    
    this.currentFilter = period;
    this.renderStatsPage();
  },
  
  // 渲染首页
  renderHomePage() {
    // 更新日期
    const today = new Date();
    const dateString = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    document.querySelector('.weight-card .date').textContent = dateString;
    
    // 更新体重
    const latestWeight = this.getLatestWeight();
    if (latestWeight) {
      document.querySelector('.current-weight').textContent = latestWeight.value.toFixed(1);
      
      // 计算体重变化
      const previousWeight = this.getPreviousWeight(latestWeight.date);
      if (previousWeight) {
        const change = latestWeight.value - previousWeight.value;
        const changeElement = document.querySelector('.change-value');
        changeElement.textContent = (change > 0 ? '+' : '') + change.toFixed(1);
        changeElement.style.color = change > 0 ? 'var(--error-color)' : 'var(--success-color)';
      }
    }
    
    // 更新卡路里摄入
    const todayCalories = this.getTodayCalories();
    document.querySelector('.food-icon + .stat-content .current-value').textContent = todayCalories;
    
    const caloriesProgress = (todayCalories / this.data.user.dailyCaloriesTarget) * 100;
    document.querySelector('.food-icon + .stat-content .progress').style.width = `${Math.min(caloriesProgress, 100)}%`;
    
    document.querySelector('.food-icon + .stat-content .stat-detail span').textContent = 
      `目标: ${this.data.user.dailyCaloriesTarget} kcal`;
    
    // 更新运动消耗
    const todayExerciseCalories = this.getTodayExerciseCalories();
    document.querySelector('.exercise-icon + .stat-content .current-value').textContent = todayExerciseCalories;
    
    const exerciseProgress = (todayExerciseCalories / 500) * 100; // 假设目标为500卡路里
    document.querySelector('.exercise-icon + .stat-content .progress').style.width = `${Math.min(exerciseProgress, 100)}%`;
    
    document.querySelector('.exercise-icon + .stat-content .stat-detail span').textContent = 
      `目标: 500 kcal`;
    
    // 渲染今日记录
    this.renderTodayRecords();
    
    // 渲染体重趋势小图表
    this.renderWeightTrendChart();
  },
  
  // 渲染今日记录
  renderTodayRecords() {
    const container = document.getElementById('today-records');
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecords = [
      ...this.data.foodRecords.filter(record => record.date === today),
      ...this.data.exerciseRecords.filter(record => record.date === today)
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (todayRecords.length === 0) {
      container.innerHTML = '<div class="text-center p-4 text-gray-500">今日暂无记录</div>';
      return;
    }
    
    container.innerHTML = todayRecords.map(record => {
      const isFood = record.id.startsWith('f');
      const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const icon = isFood ? 'utensils' : 'running';
      const iconColor = isFood ? 'var(--primary-color)' : 'var(--secondary-color)';
      const title = isFood ? record.name : this.getExerciseTypeName(record.type);
      const details = isFood ? `${this.getMealTimeName(record.time)} · ${record.calories} kcal` : 
        `${record.duration}分钟 · ${record.calories} kcal`;
      
      return `
        <div class="record-item" data-id="${record.id}">
          <div class="record-icon" style="background-color: ${iconColor}">
            <i class="fas fa-${icon}"></i>
          </div>
          <div class="record-content">
            <div class="record-title">${title}</div>
            <div class="record-details">${details}</div>
          </div>
          <div class="record-time">${time}</div>
        </div>
      `;
    }).join('');
    
    // 添加滑动删除功能
    this.setupSwipeToDelete();
  },
  
  // 渲染体重趋势小图表
  renderWeightTrendChart() {
    const ctx = document.getElementById('weight-trend-chart').getContext('2d');
    const weights = this.data.weights.slice(-7); // 最近7天
    
    if (this.charts.weightTrend) {
      this.charts.weightTrend.destroy();
    }
    
    this.charts.weightTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weights.map(w => new Date(w.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
        datasets: [{
          data: weights.map(w => w.value),
          borderColor: 'var(--primary-color)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    });
  },
  
  // 渲染记录页
  renderRecordsPage() {
    this.renderFoodRecords();
    this.renderExerciseRecords();
  },
  
  // 渲染饮食记录
  renderFoodRecords() {
    const container = document.getElementById('food-records');
    
    if (this.data.foodRecords.length === 0) {
      container.innerHTML = '<div class="text-center p-4 text-gray-500">暂无饮食记录</div>';
      return;
    }
    
    // 按日期分组
    const groupedRecords = this.groupRecordsByDate(this.data.foodRecords);
    
    container.innerHTML = Object.entries(groupedRecords).map(([date, records]) => {
      const dateFormatted = new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
      
      return `
        <div class="record-group">
          <div class="record-date">${dateFormatted}</div>
          ${records.map(record => `
            <div class="record-item" data-id="${record.id}">
              <div class="record-icon" style="background-color: var(--primary-color)">
                <i class="fas fa-utensils"></i>
              </div>
              <div class="record-content">
                <div class="record-title">${record.name}</div>
                <div class="record-details">
                  ${this.getMealTimeName(record.time)} · ${record.calories} kcal
                  ${record.notes ? `· ${record.notes}` : ''}
                </div>
              </div>
              <div class="record-time">
                ${new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div class="record-actions">
                <button class="record-action-btn edit-btn" data-id="${record.id}" data-type="food">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="record-action-btn delete-btn" data-id="${record.id}" data-type="food">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
    
    // 添加编辑和删除事件
    this.setupRecordActions();
  },
  
  // 渲染运动记录
  renderExerciseRecords() {
    const container = document.getElementById('exercise-records');
    
    if (this.data.exerciseRecords.length === 0) {
      container.innerHTML = '<div class="text-center p-4 text-gray-500">暂无运动记录</div>';
      return;
    }
    
    // 按日期分组
    const groupedRecords = this.groupRecordsByDate(this.data.exerciseRecords);
    
    container.innerHTML = Object.entries(groupedRecords).map(([date, records]) => {
      const dateFormatted = new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
      
      return `
        <div class="record-group">
          <div class="record-date">${dateFormatted}</div>
          ${records.map(record => `
            <div class="record-item" data-id="${record.id}">
              <div class="record-icon" style="background-color: var(--secondary-color)">
                <i class="fas fa-${this.getExerciseIcon(record.type)}"></i>
              </div>
              <div class="record-content">
                <div class="record-title">${this.getExerciseTypeName(record.type)}</div>
                <div class="record-details">
                  ${record.duration}分钟 · ${record.calories} kcal
                  ${record.notes ? `· ${record.notes}` : ''}
                </div>
              </div>
              <div class="record-time">
                ${new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div class="record-actions">
                <button class="record-action-btn edit-btn" data-id="${record.id}" data-type="exercise">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="record-action-btn delete-btn" data-id="${record.id}" data-type="exercise">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
    
    // 添加编辑和删除事件
    this.setupRecordActions();
  },
  
  // 设置记录操作
  setupRecordActions() {
    // 编辑按钮
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        this.editRecord(id, type);
      });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        this.deleteRecord(id, type);
      });
    });
  },
  
  // 设置滑动删除
  setupSwipeToDelete() {
    let startX, moveX, currentItem;
    
    document.querySelectorAll('.record-item').forEach(item => {
      item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentItem = item;
      });
      
      item.addEventListener('touchmove', (e) => {
        if (!currentItem) return;
        
        moveX = e.touches[0].clientX;
        const diff = moveX - startX;
        
        if (diff < 0) {
          currentItem.style.transform = `translateX(${Math.max(diff, -120)}px)`;
          currentItem.classList.add('swiping');
        } else if (currentItem.classList.contains('swiping')) {
          currentItem.style.transform = `translateX(${Math.min(diff, 0)}px)`;
        }
      });
      
      item.addEventListener('touchend', () => {
        if (!currentItem) return;
        
        const diff = moveX - startX;
        
        if (diff < -60) {
          currentItem.style.transform = 'translateX(-120px)';
        } else {
          currentItem.style.transform = 'translateX(0)';
          currentItem.classList.remove('swiping');
        }
        
        currentItem = null;
      });
    });
  },
  
  // 渲染统计页
  renderStatsPage() {
    this.renderWeightChart();
    this.renderCaloriesChart();
    this.updateSummaryData();
  },
  
  // 渲染体重图表
  renderWeightChart() {
    const ctx = document.getElementById('weight-chart').getContext('2d');
    const weights = this.getFilteredWeights();
    
    if (this.charts.weight) {
      this.charts.weight.destroy();
    }
    
    this.charts.weight = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weights.map(w => new Date(w.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: '体重 (kg)',
          data: weights.map(w => w.value),
          borderColor: 'var(--primary-color)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'var(--primary-color)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `体重: ${context.parsed.y} kg`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + ' kg';
              }
            }
          }
        }
      }
    });
  },
  
  // 渲染卡路里图表
  renderCaloriesChart() {
    const ctx = document.getElementById('calories-chart').getContext('2d');
    const data = this.getFilteredCaloriesData();
    
    if (this.charts.calories) {
      this.charts.calories.destroy();
    }
    
    this.charts.calories = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '摄入卡路里',
            data: data.intake,
            backgroundColor: 'var(--primary-color)',
            borderRadius: 4
          },
          {
            label: '目标卡路里',
            data: data.target,
            backgroundColor: 'rgba(33, 150, 243, 0.3)',
            borderRadius: 4,
            type: 'line',
            borderColor: 'var(--secondary-color)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + ' kcal';
              }
            }
          }
        }
      }
    });
  },
  
  // 更新汇总数据
  updateSummaryData() {
    const { startDate, endDate } = this.getFilterDateRange();
    
    // 计算总摄入卡路里
    const totalIntake = this.data.foodRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .reduce((sum, record) => sum + record.calories, 0);
    
    // 计算总消耗卡路里
    const totalBurned = this.data.exerciseRecords
      .filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .reduce((sum, record) => sum + record.calories, 0);
    
    // 计算记录次数
    const foodRecordCount = this.data.foodRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    }).length;
    
    const exerciseRecordCount = this.data.exerciseRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    }).length;
    
    // 更新DOM
    document.querySelectorAll('.summary-value')[0].textContent = totalIntake.toLocaleString();
    document.querySelectorAll('.summary-value')[1].textContent = totalBurned.toLocaleString();
    document.querySelectorAll('.summary-value')[2].textContent = foodRecordCount;
    document.querySelectorAll('.summary-value')[3].textContent = exerciseRecordCount;
  },
  
  // 设置设置表单
  setupSettingsForm() {
    // 个人信息表单
    document.getElementById('height').value = this.data.user.height;
    document.getElementById('initial-weight').value = this.data.user.initialWeight;
    document.getElementById('target-weight').value = this.data.user.targetWeight;
    document.getElementById('age').value = this.data.user.age;
    document.getElementById('gender').value = this.data.user.gender;
    
    // 目标设置表单
    document.getElementById('daily-calories').value = this.data.user.dailyCaloriesTarget;
    document.getElementById('weekly-weight-loss').value = this.data.user.weeklyWeightLossTarget;
  },
  
  // 保存个人信息
  savePersonalInfo() {
    this.data.user.height = parseInt(document.getElementById('height').value);
    this.data.user.initialWeight = parseFloat(document.getElementById('initial-weight').value);
    this.data.user.targetWeight = parseFloat(document.getElementById('target-weight').value);
    this.data.user.age = parseInt(document.getElementById('age').value);
    this.data.user.gender = document.getElementById('gender').value;
    
    this.saveData();
    this.showToast('个人信息已保存');
  },
  
  // 保存目标设置
  saveGoals() {
    this.data.user.dailyCaloriesTarget = parseInt(document.getElementById('daily-calories').value);
    this.data.user.weeklyWeightLossTarget = parseFloat(document.getElementById('weekly-weight-loss').value);
    
    this.saveData();
    this.renderHomePage(); // 更新首页目标显示
    this.showToast('目标设置已保存');
  },
  
  // 保存饮食记录
  saveFoodRecord() {
    const form = document.getElementById('food-form');
    const id = 'f' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    const record = {
      id: id,
      date: today,
      time: form.elements.foodTime.value,
      name: form.elements.foodName.value,
      calories: parseInt(form.elements.foodCalories.value) || 0,
      notes: form.elements.foodNotes.value,
      image: this.getImageDataUrl('food'),
      voiceNote: null, // 实际应用中这里会保存语音文件
      timestamp: now
    };
    
    this.data.foodRecords.push(record);
    this.saveData();
    
    // 清除草稿
    this.data.drafts.food = null;
    
    this.closeModal();
    this.renderHomePage();
    this.renderRecordsPage();
    this.renderStatsPage();
    this.showToast('饮食记录已保存');
  },
  
  // 保存运动记录
  saveExerciseRecord() {
    const form = document.getElementById('exercise-form');
    const id = 'e' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    const record = {
      id: id,
      date: today,
      type: form.elements.exerciseType.value,
      duration: parseInt(form.elements.exerciseDuration.value) || 0,
      calories: parseInt(form.elements.exerciseCalories.value) || 0,
      notes: form.elements.exerciseNotes.value,
      image: this.getImageDataUrl('exercise'),
      voiceNote: null, // 实际应用中这里会保存语音文件
      timestamp: now
    };
    
    this.data.exerciseRecords.push(record);
    this.saveData();
    
    // 清除草稿
    this.data.drafts.exercise = null;
    
    this.closeModal();
    this.renderHomePage();
    this.renderRecordsPage();
    this.renderStatsPage();
    this.showToast('运动记录已保存');
  },
  
  // 保存体重记录
  saveWeightRecord() {
    const form = document.getElementById('weight-form');
    const date = form.elements.weightDate.value;
    const value = parseFloat(form.elements.weightValue.value);
    const notes = form.elements.weightNotes.value;
    
    // 检查是否已存在该日期的记录
    const existingIndex = this.data.weights.findIndex(w => w.date === date);
    
    if (existingIndex >= 0) {
      // 更新现有记录
      this.data.weights[existingIndex].value = value;
      this.data.weights[existingIndex].notes = notes;
    } else {
      // 添加新记录
      this.data.weights.push({
        date: date,
        value: value,
        notes: notes
      });
      
      // 按日期排序
      this.data.weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    this.saveData();
    this.closeModal();
    this.renderHomePage();
    this.renderStatsPage();
    this.showToast('体重记录已保存');
  },
  
  // 编辑记录
  editRecord(id, type) {
    let record;
    
    if (type === 'food') {
      record = this.data.foodRecords.find(r => r.id === id);
      if (!record) return;
      
      // 填充表单
      document.getElementById('food-name').value = record.name;
      document.getElementById('food-calories').value = record.calories;
      document.getElementById('food-time').value = record.time;
      document.getElementById('food-notes').value = record.notes || '';
      
      // 显示图片预览
      if (record.image) {
        const preview = document.querySelector('#food-modal .image-preview');
        const placeholder = document.querySelector('#food-modal .upload-placeholder');
        const img = preview.querySelector('img');
        
        img.src = record.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
      
      // 打开模态框
      this.openModal('food-modal');
      
      // 删除原记录
      this.data.foodRecords = this.data.foodRecords.filter(r => r.id !== id);
    } else if (type === 'exercise') {
      record = this.data.exerciseRecords.find(r => r.id === id);
      if (!record) return;
      
      // 填充表单
      document.getElementById('exercise-type').value = record.type;
      document.getElementById('exercise-duration').value = record.duration;
      document.getElementById('exercise-calories').value = record.calories;
      document.getElementById('exercise-notes').value = record.notes || '';
      
      // 显示图片预览
      if (record.image) {
        const preview = document.querySelector('#exercise-modal .image-preview');
        const placeholder = document.querySelector('#exercise-modal .upload-placeholder');
        const img = preview.querySelector('img');
        
        img.src = record.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
      
      // 打开模态框
      this.openModal('exercise-modal');
      
      // 删除原记录
      this.data.exerciseRecords = this.data.exerciseRecords.filter(r => r.id !== id);
    }
    
    this.saveData();
    this.renderRecordsPage();
  },
  
  // 删除记录
  deleteRecord(id, type) {
    if (confirm('确定要删除这条记录吗？')) {
      if (type === 'food') {
        this.data.foodRecords = this.data.foodRecords.filter(r => r.id !== id);
      } else if (type === 'exercise') {
        this.data.exerciseRecords = this.data.exerciseRecords.filter(r => r.id !== id);
      }
      
      this.saveData();
      this.renderHomePage();
      this.renderRecordsPage();
      this.renderStatsPage();
      this.showToast('记录已删除');
    }
  },
  
  // 预览图片
  previewImage(input, type) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const preview = document.querySelector(`#${type}-modal .image-preview`);
        const placeholder = document.querySelector(`#${type}-modal .upload-placeholder`);
        const img = preview.querySelector('img');
        
        img.src = e.target.result;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  },
  
  // 获取图片数据URL
  getImageDataUrl(type) {
    const preview = document.querySelector(`#${type}-modal .image-preview img`);
    return preview && preview.src ? preview.src : null;
  },
  
  // 识别卡路里（模拟）
  recognizeCalories() {
    const foodName = document.getElementById('food-name').value;
    if (!foodName) {
      this.showToast('请先输入食物名称', 'warning');
      return;
    }
    
    // 模拟识别过程
    this.showToast('正在识别卡路里...', 'info');
    
    setTimeout(() => {
      // 模拟识别结果
      const estimatedCalories = this.estimateCalories(foodName);
      document.getElementById('food-calories').value = estimatedCalories;
      this.showToast('卡路里识别完成');
    }, 1500);
  },
  
  // 估算卡路里（模拟）
  estimateCalories(foodName) {
    // 简单的食物卡路里数据库
    const calorieDatabase = {
      '苹果': 52,
      '香蕉': 89,
      '全麦面包': 250,
      '米饭': 130,
      '沙拉': 400,
      '鸡胸肉': 165,
      '烤鱼': 500,
      '汉堡': 250,
      '披萨': 285,
      '牛奶': 42,
      '鸡蛋': 78,
      '燕麦': 389,
      '酸奶': 59,
      '橙子': 47,
      '胡萝卜': 41
    };
    
    // 查找食物名称中的关键词
    for (const [food, calories] of Object.entries(calorieDatabase)) {
      if (foodName.includes(food)) {
        return calories;
      }
    }
    
    // 如果没有匹配，返回一个随机值
    return Math.floor(Math.random() * 300) + 100;
  },
  
  // 计算运动卡路里（模拟）
  calculateExerciseCalories() {
    const type = document.getElementById('exercise-type').value;
    const duration = parseInt(document.getElementById('exercise-duration').value);
    
    if (!duration || duration <= 0) {
      this.showToast('请输入有效的运动时长', 'warning');
      return;
    }
    
    // 不同运动类型的卡路里消耗率（每小时）
    const calorieRates = {
      'running': 600,
      'walking': 300,
      'cycling': 400,
      'swimming': 500,
      'gym': 450,
      'other': 350
    };
    
    const rate = calorieRates[type] || 350;
    const calories = Math.round((rate / 60) * duration);
    
    document.getElementById('exercise-calories').value = calories;
    this.showToast('卡路里计算完成');
  },
  
  // 切换录音
  toggleRecording(type) {
    if (this.recordingActive) {
      this.stopRecording();
    } else {
      this.startRecording(type);
    }
  },
  
  // 开始录音
  startRecording(type) {
    this.recordingActive = true;
    this.recordingSeconds = 0;
    
    const btn = document.getElementById(`${type}-voice-record-btn`);
    const indicator = document.querySelector(`#${type}-modal .recording-indicator`);
    
    btn.innerHTML = '<i class="fas fa-stop"></i><span>停止录音</span>';
    indicator.classList.remove('hidden');
    
    // 更新录音时间
    this.recordingTimer = setInterval(() => {
      this.recordingSeconds++;
      const minutes = Math.floor(this.recordingSeconds / 60);
      const seconds = this.recordingSeconds % 60;
      document.querySelector(`#${type}-modal .recording-time`).textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
    // 模拟录音开始
    this.showToast('录音已开始');
  },
  
  // 停止录音
  stopRecording() {
    if (!this.recordingActive) return;
    
    this.recordingActive = false;
    clearInterval(this.recordingTimer);
    
    // 重置录音按钮
    document.querySelectorAll('#voice-record-btn, #exercise-voice-record-btn').forEach(btn => {
      btn.innerHTML = '<i class="fas fa-microphone"></i><span>开始录音</span>';
    });
    
    // 隐藏录音指示器
    document.querySelectorAll('.recording-indicator').forEach(indicator => {
      indicator.classList.add('hidden');
    });
    
    this.showToast('录音已停止');
  },
  
  // 保存草稿
  saveDraft(type) {
    let draft = {};
    const form = document.getElementById(`${type}-form`);
    
    if (type === 'food') {
      draft = {
        name: form.elements.foodName.value,
        calories: form.elements.foodCalories.value,
        time: form.elements.foodTime.value,
        notes: form.elements.foodNotes.value,
        image: this.getImageDataUrl('food')
      };
      this.data.drafts.food = draft;
    } else if (type === 'exercise') {
      draft = {
        type: form.elements.exerciseType.value,
        duration: form.elements.exerciseDuration.value,
        calories: form.elements.exerciseCalories.value,
        notes: form.elements.exerciseNotes.value,
        image: this.getImageDataUrl('exercise')
      };
      this.data.drafts.exercise = draft;
    }
    
    this.saveData();
    this.showToast('草稿已保存');
  },
  
  // 加载草稿
  loadDraft(type) {
    const draft = this.data.drafts[type];
    if (!draft) return;
    
    const form = document.getElementById(`${type}-form`);
    
    if (type === 'food') {
      form.elements.foodName.value = draft.name || '';
      form.elements.foodCalories.value = draft.calories || '';
      form.elements.foodTime.value = draft.time || 'breakfast';
      form.elements.foodNotes.value = draft.notes || '';
      
      // 显示图片预览
      if (draft.image) {
        const preview = document.querySelector('#food-modal .image-preview');
        const placeholder = document.querySelector('#food-modal .upload-placeholder');
        const img = preview.querySelector('img');
        
        img.src = draft.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
    } else if (type === 'exercise') {
      form.elements.exerciseType.value = draft.type || 'running';
      form.elements.exerciseDuration.value = draft.duration || '';
      form.elements.exerciseCalories.value = draft.calories || '';
      form.elements.exerciseNotes.value = draft.notes || '';
      
      // 显示图片预览
      if (draft.image) {
        const preview = document.querySelector('#exercise-modal .image-preview');
        const placeholder = document.querySelector('#exercise-modal .upload-placeholder');
        const img = preview.querySelector('img');
        
        img.src = draft.image;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
    }
  },
  
  // 导出数据
  exportData() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `fitness-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showToast('数据已导出');
  },
  
  // 清除数据
  clearData() {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem('fitnessTrackerData');
      this.data = {
        user: {
          height: 170,
          initialWeight: 70,
          targetWeight: 60,
          age: 25,
          gender: 'male',
          dailyCaloriesTarget: 2000,
          weeklyWeightLossTarget: 0.5
        },
        weights: [],
        foodRecords: [],
        exerciseRecords: [],
        drafts: {
          food: null,
          exercise: null
        }
      };
      
      this.renderHomePage();
      this.renderRecordsPage();
      this.renderStatsPage();
      this.setupSettingsForm();
      this.showToast('所有数据已清除', 'warning');
    }
  },
  
  // 刷新数据
  refreshData() {
    this.renderHomePage();
    this.renderRecordsPage();
    this.renderStatsPage();
    this.showToast('数据已刷新');
  },
  
  // 显示提示
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageElement = document.getElementById('toast-message');
    
    messageElement.textContent = message;
    toast.className = 'toast'; // 重置类名
    
    if (type !== 'success') {
      toast.classList.add(type);
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  },
  
  // 获取最新体重
  getLatestWeight() {
    if (this.data.weights.length === 0) return null;
    
    return this.data.weights.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
  },
  
  // 获取前一天的体重
  getPreviousWeight(date) {
    const weightsBeforeDate = this.data.weights.filter(w => new Date(w.date) < new Date(date));
    
    if (weightsBeforeDate.length === 0) return null;
    
    return weightsBeforeDate.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
  },
  
  // 获取今日卡路里摄入
  getTodayCalories() {
    const today = new Date().toISOString().split('T')[0];
    
    return this.data.foodRecords
      .filter(record => record.date === today)
      .reduce((sum, record) => sum + record.calories, 0);
  },
  
  // 获取今日运动消耗
  getTodayExerciseCalories() {
    const today = new Date().toISOString().split('T')[0];
    
    return this.data.exerciseRecords
      .filter(record => record.date === today)
      .reduce((sum, record) => sum + record.calories, 0);
  },
  
  // 按日期分组记录
  groupRecordsByDate(records) {
    return records.reduce((groups, record) => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      
      // 按时间排序
      groups[date].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return groups;
    }, {});
  },
  
  // 获取筛选后的体重数据
  getFilteredWeights() {
    const { startDate, endDate } = this.getFilterDateRange();
    
    return this.data.weights.filter(weight => {
      const date = new Date(weight.date);
      return date >= startDate && date <= endDate;
    });
  },
  
  // 获取筛选后的卡路里数据
  getFilteredCaloriesData() {
    const { startDate, endDate } = this.getFilterDateRange();
    const data = {
      labels: [],
      intake: [],
      target: []
    };
    
    // 根据筛选周期生成日期标签
    if (this.currentFilter === 'week') {
      // 生成最近7天的日期
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('zh-CN', { weekday: 'short' });
        
        data.labels.push(label);
        data.intake.push(this.getDailyCalories(dateStr));
        data.target.push(this.data.user.dailyCaloriesTarget);
      }
    } else if (this.currentFilter === 'month') {
      // 生成最近4周的日期
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        
        const label = `第${4-i}周`;
        const weekCalories = this.getWeeklyCalories(date, weekEnd);
        
        data.labels.push(label);
        data.intake.push(weekCalories);
        data.target.push(this.data.user.dailyCaloriesTarget * 7);
      }
    } else if (this.currentFilter === 'year') {
      // 生成最近6个月的日期
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthEnd = new Date(date);
        monthEnd.setMonth(date.getMonth() + 1);
        monthEnd.setDate(0);
        
        const label = date.toLocaleDateString('zh-CN', { month: 'short' });
        const monthCalories = this.getMonthlyCalories(date, monthEnd);
        
        data.labels.push(label);
        data.intake.push(monthCalories);
        data.target.push(this.data.user.dailyCaloriesTarget * (monthEnd.getDate()));
      }
    }
    
    return data;
  },
  
  // 获取筛选日期范围
  getFilterDateRange() {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    
    if (this.currentFilter === 'week') {
      startDate.setDate(startDate.getDate() - 6);
    } else if (this.currentFilter === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (this.currentFilter === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
  },
  
  // 获取每日卡路里摄入
  getDailyCalories(date) {
    return this.data.foodRecords
      .filter(record => record.date === date)
      .reduce((sum, record) => sum + record.calories, 0);
  },
  
  // 获取每周卡路里摄入
  getWeeklyCalories(startDate, endDate) {
    return this.data.foodRecords
      .filter(record => {
        const date = new Date(record.date);
        return date >= startDate && date <= endDate;
      })
      .reduce((sum, record) => sum + record.calories, 0);
  },
  
  // 获取每月卡路里摄入
  getMonthlyCalories(startDate, endDate) {
    return this.data.foodRecords
      .filter(record => {
        const date = new Date(record.date);
        return date >= startDate && date <= endDate;
      })
      .reduce((sum, record) => sum + record.calories, 0);
  },
  
  // 获取餐时名称
  getMealTimeName(time) {
    const mealTimes = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '加餐'
    };
    
    return mealTimes[time] || time;
  },
  
  // 获取运动类型名称
  getExerciseTypeName(type) {
    const exerciseTypes = {
      'running': '跑步',
      'walking': '步行',
      'cycling': '骑行',
      'swimming': '游泳',
      'gym': '健身',
      'other': '其他'
    };
    
    return exerciseTypes[type] || type;
  },
  
  // 获取运动图标
  getExerciseIcon(type) {
    const exerciseIcons = {
      'running': 'running',
      'walking': 'walking',
      'cycling': 'bicycle',
      'swimming': 'swimmer',
      'gym': 'dumbbell',
      'other': 'activity'
    };
    
    return exerciseIcons[type] || 'activity';
  }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});