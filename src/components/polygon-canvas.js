export class PolygonCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.canvas = null;
        this.ctx = null;
        this.points = [];
        this.firstPoint = null;
        this.secondPoint = null;
        this.isClockwise = true;
    }

    connectedCallback() {
        this.render();
        this.setupCanvas();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                }
            </style>
            <canvas id="canvas"></canvas>
        `;
    }

    setupCanvas() {
        this.canvas = this.shadowRoot.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    resizeCanvas() {
        const workspace = this.closest('.workspace');
        this.canvas.width = workspace.clientWidth;
        this.canvas.height = workspace.clientHeight;
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        this.dispatchEvent(new CustomEvent('canvas-click', {
            detail: { x, y },
            bubbles: true,
            composed: true
        }));
    }

    drawPoints() {
        this.ctx.fillStyle = '#fff4c3';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        
        this.points.forEach((point, index) => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 7.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'black';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(`p${index + 1}`, point.x, point.y - 10);
            
            this.ctx.fillStyle = '#fff4c3';
        });
    }

    drawPolygon() {
        if (this.points.length < 3) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        this.ctx.closePath();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    drawPath() {
        if (this.firstPoint === null || this.secondPoint === null) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[this.firstPoint].x, this.points[this.firstPoint].y);
        
        let current = this.firstPoint;
        let points = [];
        
        while (current !== this.secondPoint) {
            points.push(current);
            current = this.isClockwise ? 
                (current + 1) % this.points.length : 
                (current - 1 + this.points.length) % this.points.length;
        }
        points.push(this.secondPoint);
        
        for (let i = 0; i < points.length; i++) {
            this.ctx.lineTo(this.points[points[i]].x, this.points[points[i]].y);
        }
        
        this.ctx.strokeStyle = '#3399fd';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setPoints(points) {
        this.points = points;
        this.clear();
        this.drawPoints();
    }

    setPath(firstPoint, secondPoint, isClockwise) {
        this.firstPoint = firstPoint;
        this.secondPoint = secondPoint;
        this.isClockwise = isClockwise;
        this.clear();
        this.drawPoints();
        this.drawPolygon();
        this.drawPath();
    }
}

customElements.define('polygon-canvas', PolygonCanvas); 