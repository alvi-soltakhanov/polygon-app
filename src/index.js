import './styles.css';
import './components/polygon-canvas.js';
import './components/polygon-panel.js';

class PolygonApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.points = [];
        this.firstPoint = null;
        this.secondPoint = null;
        this.isClockwise = true;
        this.isDrawingMode = false;
        this.isFirstPointMode = false;
        this.isSecondPointMode = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.loadFromLocalStorage();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100vh;
                    background-color: #4d4d4d;
                }
                .workspace {
                    width: 1000px;
                    height: 600px;
                    border: 1px solid #ccc;
                    position: relative;
                    background-color: #999999;
                    display: flex;
                }
                polygon-panel {
                    height: 600px;
                }
            </style>
            <div class="workspace">
                <polygon-canvas></polygon-canvas>
            </div>
            <polygon-panel></polygon-panel>
        `;
    }

    setupEventListeners() {
        const canvas = this.shadowRoot.querySelector('polygon-canvas');
        const panel = this.shadowRoot.querySelector('polygon-panel');

        canvas.addEventListener('canvas-click', (e) => {
            const { x, y } = e.detail;
            if (this.isFirstPointMode) {
                this.selectFirstPoint(x, y);
            } else if (this.isSecondPointMode) {
                this.selectSecondPoint(x, y);
            } else if (this.isDrawingMode) {
                this.addPoint(x, y);
            }
        });

        panel.addEventListener('create-points', () => this.startPointCreation());
        panel.addEventListener('draw-polygon', () => this.drawPolygon());
        panel.addEventListener('select-first-point', () => this.startFirstPointSelection());
        panel.addEventListener('select-second-point', () => this.startSecondPointSelection());
        panel.addEventListener('toggle-direction', () => this.toggleDirection());
        panel.addEventListener('clear', () => this.clear());
    }

    addPoint(x, y) {
        if (this.points.length >= 15) return;
        
        const isNearExistingPoint = this.points.some(point => {
            const dist = Math.sqrt(
                Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
            );
            return dist < 30;
        });

        if (isNearExistingPoint) {
            alert('Нельзя создавать точки слишком близко друг к другу');
            return;
        }
        
        this.points.push({ x, y });
        this.updatePointCount();
        this.saveToLocalStorage();
        
        const canvas = this.shadowRoot.querySelector('polygon-canvas');
        canvas.setPoints(this.points);
    }

    updatePointCount() {
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updatePointCount(this.points.length);
    }

    startPointCreation() {
        this.isDrawingMode = true;
        this.points = [];
        this.firstPoint = null;
        this.secondPoint = null;
        this.isClockwise = true;
        this.updatePointCount();
        
        const canvas = this.shadowRoot.querySelector('polygon-canvas');
        canvas.clear();
        
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.clear();
    }

    drawPolygon() {
        this.isDrawingMode = false;
        const canvas = this.shadowRoot.querySelector('polygon-canvas');
        canvas.setPoints(this.points);
        canvas.drawPolygon();
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.setTotalPoints(this.points.length);
        panel.enablePointSelection();
    }

    startFirstPointSelection() {
        this.isFirstPointMode = true;
        this.isSecondPointMode = false;
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updateFirstPointInfo(null);
    }

    startSecondPointSelection() {
        this.isFirstPointMode = false;
        this.isSecondPointMode = true;
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updateSecondPointInfo(null);
    }

    selectFirstPoint(x, y) {
        const newPoint = this.findNearestPoint(x, y);
        if (newPoint === -1) {
            alert('Выберите точку ближе к существующим точкам');
            return;
        }
        
        this.firstPoint = newPoint;
        this.isFirstPointMode = false;
        this.updatePath();
        
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updateFirstPointInfo(this.firstPoint);
        
        if (this.secondPoint !== null && this.firstPoint !== this.secondPoint) {
            panel.enableDirectionToggle();
        }
    }

    selectSecondPoint(x, y) {
        const newPoint = this.findNearestPoint(x, y);
        if (newPoint === -1) {
            alert('Выберите точку ближе к существующим точкам');
            return;
        }
        
        if (newPoint === this.firstPoint) {
            alert('Выберите другую точку');
            return;
        }
        
        this.secondPoint = newPoint;
        this.isSecondPointMode = false;
        this.updatePath();
        
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updateSecondPointInfo(this.secondPoint);
        
        if (this.firstPoint !== null) {
            panel.enableDirectionToggle();
        }
    }

    findNearestPoint(x, y) {
        let minDist = Infinity;
        let nearestIndex = -1;

        this.points.forEach((point, index) => {
            const dist = Math.sqrt(
                Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
            );
            if (dist < minDist && dist < 30) {
                minDist = dist;
                nearestIndex = index;
            }
        });

        return nearestIndex;
    }

    toggleDirection() {
        this.isClockwise = !this.isClockwise;
        this.updatePath();
        
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updateDirectionButton(this.isClockwise);
    }

    updatePath() {
        if (this.firstPoint === null || this.secondPoint === null) return;

        const canvas = this.shadowRoot.querySelector('polygon-canvas');
        canvas.setPath(this.firstPoint, this.secondPoint, this.isClockwise);
        
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.updatePathInfo(this.firstPoint, this.secondPoint, this.isClockwise);
    }

    clear() {
        this.points = [];
        this.firstPoint = null;
        this.secondPoint = null;
        this.isClockwise = true;
        this.isDrawingMode = false;
        this.isFirstPointMode = false;
        this.isSecondPointMode = false;
        
        const canvas = this.shadowRoot.querySelector('polygon-canvas');
        canvas.clear();
        
        const panel = this.shadowRoot.querySelector('polygon-panel');
        panel.clear();
        panel.updatePointCount(0);
        
        localStorage.removeItem('polygonData');
    }

    saveToLocalStorage() {
        const data = {
            points: this.points,
            firstPoint: this.firstPoint,
            secondPoint: this.secondPoint,
            isClockwise: this.isClockwise
        };
        localStorage.setItem('polygonData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('polygonData');
        if (data) {
            const parsed = JSON.parse(data);
            this.points = parsed.points;
            this.firstPoint = parsed.firstPoint;
            this.secondPoint = parsed.secondPoint;
            this.isClockwise = parsed.isClockwise;
            
            this.updatePointCount();
            this.drawPolygon();
            this.updatePath();
        }
    }
}

customElements.define('polygon-app', PolygonApp); 