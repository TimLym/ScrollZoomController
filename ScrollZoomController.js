// 滾動縮放效果控制器
class ScrollZoomController {
    constructor() {
        // 配置參數
        this.config = {
            minScale: 0.3,           // 最小縮放比例
            maxScale: 2,             // 最大縮放比例
            scrollSensitivity: 0.01, // 滾動敏感度
            switchThreshold: 1.8     // 切換閾值
        };
        
        // 狀態變量
        this.currentIndex = 0;       // 當前項目索引
        this.currentScale = 1;       // 當前縮放比例
        this.isScrolling = false;    // 滾動狀態標記
        this.scrollTimeout = null;   // 滾動超時處理
        
        // 獲取DOM元素
        this.container = document.querySelector('.visual-container');
        this.items = document.querySelectorAll('.item');
        this.totalItems = this.items.length;
        
        // 初始化
        this.init();
    }
    
    // 初始化方法
    init() {
        this.bindEvents();
        this.initializeItems();
        this.updateDisplay();
    }
    
    // 初始化項目顯示狀態
    initializeItems() {
        // 隱藏所有項目
        this.items.forEach((item, index) => {
            item.classList.remove('active');
            if (index === this.currentIndex) {
                item.classList.add('active');
            }
        });
    }
    
    // 綁定事件監聽器
    bindEvents() {
        // 滾輪事件監聽
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleScroll(e);
        });
        
        // 鍵盤事件監聽
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.handleKeyboard(e);
            }
        });
    }
    
    // 處理滾動事件
    handleScroll(e) {
        this.isScrolling = true;
        
        // 清除之前的超時
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // 計算滾動方向和量
        const delta = e.deltaY > 0 ? 1 : -1;
        const scrollAmount = delta * this.config.scrollSensitivity;
        
        // 更新縮放比例
        this.currentScale += scrollAmount;
        
        // 檢查是否需要切換項目
        this.checkItemSwitch();
        
        // 更新顯示
        this.updateDisplay();
        
        // 設置滾動結束的超時
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }
    
    // 處理鍵盤事件
    handleKeyboard(e) {
        if (e.key === 'ArrowUp') {
            this.switchToItem(this.currentIndex - 1);
        } else if (e.key === 'ArrowDown') {
            this.switchToItem(this.currentIndex + 1);
        }
    }
    
    // 檢查是否需要切換項目
    checkItemSwitch() {
        // 向下滾動，放大到閾值時切換到下一個
        if (this.currentScale >= this.config.switchThreshold) {
            this.switchToItem(this.currentIndex + 1);
        }
        // 向上滾動，縮小到閾值時切換到上一個
        else if (this.currentScale <= this.config.minScale) {
            this.switchToItem(this.currentIndex - 1);
        }
    }
    
    // 切換到指定項目
    switchToItem(newIndex) {
        // 邊界檢查
        if (newIndex < 0 || newIndex >= this.totalItems) {
            return;
        }
        
        // 隱藏當前項目
        this.items[this.currentIndex].classList.remove('active');
        
        // 更新索引
        this.currentIndex = newIndex;
        
        // 重置縮放比例
        this.currentScale = 1;
        
        // 顯示新的當前項目
        this.items[this.currentIndex].classList.add('active');
        
        // 更新顯示
        this.updateDisplay();
    }
    
    // 更新顯示
    updateDisplay() {
        // 限制縮放比例在配置範圍內
        this.currentScale = Math.max(
            this.config.minScale, 
            Math.min(this.config.maxScale, this.currentScale)
        );
        
        // 只更新當前活動項目的縮放
        const currentItem = this.items[this.currentIndex];
        if (currentItem) {
            currentItem.style.transform = `scale(${this.currentScale})`;
            
            // 更新透明度（可選的視覺效果）
            const opacity = this.calculateOpacity(this.currentScale);
            currentItem.style.opacity = opacity;
        }
    }
    
    // 計算透明度
    calculateOpacity(scale) {
        // 基於縮放比例計算透明度
        const minOpacity = 0.5;
        const maxOpacity = 1;
        
        // 線性插值
        const normalizedScale = (scale - this.config.minScale) / 
                               (this.config.maxScale - this.config.minScale);
        
        return minOpacity + (maxOpacity - minOpacity) * normalizedScale;
    }

    // 以下方法目前沒用到，如果需要在頁面跟使用者互動的話，可以用到的方法(否則目前已寫死5個在html)
    // 添加新項目的方法
    addItem(content) {
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.setAttribute('data-index', this.totalItems);
        
        const itemContent = document.createElement('div');
        itemContent.className = 'item-content';
        itemContent.textContent = content;
        
        newItem.appendChild(itemContent);
        document.querySelector('.zoom-wrapper').appendChild(newItem);
        
        // 更新項目列表
        this.items = document.querySelectorAll('.item');
        this.totalItems = this.items.length;
    }
    
    // 移除項目的方法
    removeItem(index) {
        if (index >= 0 && index < this.totalItems) {
            this.items[index].remove();
            this.items = document.querySelectorAll('.item');
            this.totalItems = this.items.length;
            
            // 調整當前索引
            if (this.currentIndex >= this.totalItems) {
                this.currentIndex = this.totalItems - 1;
            }
            
            // 重新初始化項目狀態
            this.initializeItems();
            this.updateDisplay();
        }
    }
}

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const zoomController = new ScrollZoomController();
    
    // 將控制器添加到全局作用域，便於調試和擴展
    window.zoomController = zoomController;
    
    // 示例：動態添加項目
    // zoomController.addItem('item6');
    
    // 示例：移除項目
    // zoomController.removeItem(4);
});