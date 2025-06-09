class RubiksCube {
    constructor() {
        this.cube = document.getElementById('cube');
        this.moveCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.rotationX = -30;
        this.rotationY = 45;
        
        // 魔方状态 - 6个面，每个面9个小方块
        this.faces = {
            front: Array(9).fill('red'),
            back: Array(9).fill('orange'),
            top: Array(9).fill('white'),
            bottom: Array(9).fill('yellow'),
            left: Array(9).fill('green'),
            right: Array(9).fill('blue')
        };
        
        this.init();
    }
    
    init() {
        this.createCube();
        this.setupEventListeners();
        this.updateDisplay();
        this.startTimer();
        this.updateCubeRotation();
    }
    
    createCube() {
        this.cube.innerHTML = '';
        
        // 创建27个小方块 (3x3x3)
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if (x === 0 && y === 0 && z === 0) continue; // 跳过中心块
                    
                    const cubelet = document.createElement('div');
                    cubelet.className = 'cube-face';
                    
                    // 设置位置
                    const size = 66.67;
                    cubelet.style.width = size + 'px';
                    cubelet.style.height = size + 'px';
                    cubelet.style.transform = `translate3d(${x * size}px, ${y * size}px, ${z * size}px)`;
                    
                    // 根据位置确定颜色
                    this.setCubeletColors(cubelet, x, y, z);
                    
                    this.cube.appendChild(cubelet);
                }
            }
        }
    }
    
    setCubeletColors(cubelet, x, y, z) {
        const colors = [];
        
        // 前面 (z = 1)
        if (z === 1) colors.push('red');
        // 后面 (z = -1)
        if (z === -1) colors.push('orange');
        // 上面 (y = -1)
        if (y === -1) colors.push('white');
        // 下面 (y = 1)
        if (y === 1) colors.push('yellow');
        // 左面 (x = -1)
        if (x === -1) colors.push('green');
        // 右面 (x = 1)
        if (x === 1) colors.push('blue');
        
        // 设置主要颜色（第一个颜色）
        if (colors.length > 0) {
            cubelet.className = `cube-face face-${colors[0]}`;
            cubelet.textContent = colors[0].charAt(0).toUpperCase();
        }
    }
    
    setupEventListeners() {
        // 鼠标事件
        this.cube.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // 键盘事件
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // 按钮事件
        document.getElementById('scramble-btn').addEventListener('click', this.scramble.bind(this));
        document.getElementById('reset-btn').addEventListener('click', this.reset.bind(this));
        document.getElementById('solve-btn').addEventListener('click', this.solve.bind(this));
        
        // 触摸事件（移动端支持）
        this.cube.addEventListener('touchstart', this.onTouchStart.bind(this));
        document.addEventListener('touchmove', this.onTouchMove.bind(this));
        document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        e.preventDefault();
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.rotationY += deltaX * 0.5;
        this.rotationX -= deltaY * 0.5;
        
        this.updateCubeRotation();
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        e.preventDefault();
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }
    }
    
    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        const deltaY = e.touches[0].clientY - this.lastMouseY;
        
        this.rotationY += deltaX * 0.5;
        this.rotationX -= deltaY * 0.5;
        
        this.updateCubeRotation();
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        e.preventDefault();
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    updateCubeRotation() {
        this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;
    }
    
    onKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // 防止在输入框中触发
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (key) {
            case 'r': this.rotateFace('right', 1); break;
            case 'l': this.rotateFace('left', 1); break;
            case 'u': this.rotateFace('top', 1); break;
            case 'd': this.rotateFace('bottom', 1); break;
            case 'f': this.rotateFace('front', 1); break;
            case 'b': this.rotateFace('back', 1); break;
            case "'": // 逆时针旋转
                const lastKey = this.lastKey;
                if (lastKey) {
                    this.rotateFace(lastKey, -1);
                }
                break;
        }
        
        this.lastKey = key;
    }
    
    rotateFace(face, direction) {
        // 旋转指定面
        this.rotateFaceArray(this.faces[face], direction);
        
        // 更新相邻面的边
        this.updateAdjacentFaces(face, direction);
        
        // 重新创建魔方显示
        this.createCube();
        this.updateCubeRotation();
        
        // 更新统计
        this.moveCount++;
        this.updateDisplay();
        
        // 检查是否完成
        if (this.isSolved()) {
            this.showSuccessMessage();
        }
    }
    
    rotateFaceArray(faceArray, direction) {
        // 3x3矩阵旋转
        const matrix = [
            [faceArray[0], faceArray[1], faceArray[2]],
            [faceArray[3], faceArray[4], faceArray[5]],
            [faceArray[6], faceArray[7], faceArray[8]]
        ];
        
        if (direction === 1) { // 顺时针
            const rotated = [
                [matrix[2][0], matrix[1][0], matrix[0][0]],
                [matrix[2][1], matrix[1][1], matrix[0][1]],
                [matrix[2][2], matrix[1][2], matrix[0][2]]
            ];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    faceArray[i * 3 + j] = rotated[i][j];
                }
            }
        } else { // 逆时针
            const rotated = [
                [matrix[0][2], matrix[1][2], matrix[2][2]],
                [matrix[0][1], matrix[1][1], matrix[2][1]],
                [matrix[0][0], matrix[1][0], matrix[2][0]]
            ];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    faceArray[i * 3 + j] = rotated[i][j];
                }
            }
        }
    }
    
    updateAdjacentFaces(face, direction) {
        // 这里实现更复杂的边块更新逻辑
        // 为了演示，我们简化处理
        const adjacentUpdates = {
            'front': {
                'top': [6, 7, 8],
                'bottom': [0, 1, 2],
                'left': [2, 5, 8],
                'right': [0, 3, 6]
            },
            'back': {
                'top': [0, 1, 2],
                'bottom': [6, 7, 8],
                'left': [0, 3, 6],
                'right': [2, 5, 8]
            },
            'top': {
                'front': [0, 1, 2],
                'back': [0, 1, 2],
                'left': [0, 1, 2],
                'right': [0, 1, 2]
            },
            'bottom': {
                'front': [6, 7, 8],
                'back': [6, 7, 8],
                'left': [6, 7, 8],
                'right': [6, 7, 8]
            },
            'left': {
                'front': [0, 3, 6],
                'back': [2, 5, 8],
                'top': [0, 3, 6],
                'bottom': [0, 3, 6]
            },
            'right': {
                'front': [2, 5, 8],
                'back': [0, 3, 6],
                'top': [2, 5, 8],
                'bottom': [2, 5, 8]
            }
        };
        
        // 实际实现中需要更复杂的边块交换逻辑
        // 这里为了演示简化处理
    }
    
    scramble() {
        const moves = ['r', 'l', 'u', 'd', 'f', 'b'];
        const directions = [1, -1];
        
        // 添加动画效果
        this.cube.classList.add('rotating');
        
        for (let i = 0; i < 20; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            const direction = directions[Math.floor(Math.random() * directions.length)];
            
            setTimeout(() => {
                this.rotateFace(move, direction);
                if (i === 19) {
                    this.cube.classList.remove('rotating');
                }
            }, i * 100);
        }
        
        this.moveCount = 0;
        this.updateDisplay();
    }
    
    reset() {
        this.faces = {
            front: Array(9).fill('red'),
            back: Array(9).fill('orange'),
            top: Array(9).fill('white'),
            bottom: Array(9).fill('yellow'),
            left: Array(9).fill('green'),
            right: Array(9).fill('blue')
        };
        
        this.createCube();
        this.rotationX = -30;
        this.rotationY = 45;
        this.updateCubeRotation();
        
        this.moveCount = 0;
        this.updateDisplay();
    }
    
    solve() {
        // 简化的自动还原 - 实际需要复杂的还原算法
        this.reset();
        this.showSuccessMessage();
    }
    
    isSolved() {
        // 检查所有面是否都是同色
        for (const face in this.faces) {
            const color = this.faces[face][0];
            for (let i = 1; i < 9; i++) {
                if (this.faces[face][i] !== color) {
                    return false;
                }
            }
        }
        return true;
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        document.getElementById('move-count').textContent = this.moveCount;
        
        const status = this.isSolved() ? '已完成' : '进行中';
        document.getElementById('status').textContent = status;
        
        if (this.isSolved()) {
            document.getElementById('status').style.color = '#4caf50';
        } else {
            document.getElementById('status').style.color = '#667eea';
        }
    }
    
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = '🎉 恭喜！魔方还原完成！';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new RubiksCube();
});

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 按钮点击效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // 添加键盘提示
    const keyHints = {
        'R': '右面顺时针',
        'L': '左面顺时针', 
        'U': '上面顺时针',
        'D': '下面顺时针',
        'F': '前面顺时针',
        'B': '后面顺时针',
        "'": '逆时针旋转'
    };
    
    // 显示当前按键提示
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (keyHints[key]) {
            showKeyHint(keyHints[key]);
        }
    });
    
    // 添加魔方悬停效果
    const cubeFaces = document.querySelectorAll('.cube-face');
    cubeFaces.forEach(face => {
        face.addEventListener('mouseenter', function() {
            this.style.transform += ' scale(1.1)';
        });
        
        face.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace(' scale(1.1)', '');
        });
    });
});

function showKeyHint(hint) {
    // 创建临时提示
    const hintElement = document.createElement('div');
    hintElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    hintElement.textContent = hint;
    
    document.body.appendChild(hintElement);
    
    setTimeout(() => {
        hintElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (hintElement.parentNode) {
                document.body.removeChild(hintElement);
            }
        }, 300);
    }, 1000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .cube-face {
        transition: transform 0.2s ease;
    }
    
    .cube-face:hover {
        z-index: 10;
    }
`;
document.head.appendChild(style); 