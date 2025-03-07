export class PolygonPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    width: 300px;
                    padding: 20px;
                    background-color: #4d4d4d;
                    border-left: 1px solid #ddd;
                }
                button {
                    margin: 5px 0;
                    padding: 10px;
                    background-color: #999999;
                    color: white;
                    border: 1px solid black;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
                #clear {
                    background-color: #999999;
                }
                #pointCount {
                    color: red;
                    text-align: right;
                    font-size: 10px;
                }
                #pointCount.ready {
                    color: green;
                }
                .section-title {
                    color: white;
                    margin: 15px 0 5px 0;
                    font-weight: bold;
                    text-align: center;
                    font-size: 16px;
                }
                .point-selection {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .point-selection button {
                    width: 70%;
                }
                .point-selection .selected-point {
                    width: 30%;
                    padding: 10px;
                    background-color: #4d4d4d;
                    color: white;
                    border-radius: 4px;
                    text-align: center;
                }
                .info {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #4d4d4d;
                    color: white;
                    border-radius: 4px;
                }
            </style>
            <div class="section-title">Create Polygon</div>
            <button id="createPoints">Create points</button>
            <div id="pointCount">Created 0 points</div>
            <button id="drawPolygon">Draw polygon</button>
            <div class="section-title">Create Path</div>
            <div class="point-selection">
                <button id="selectFirstPoint">First point</button>
                <div class="selected-point" id="firstPoint">-</div>
            </div>
            <div class="point-selection">
                <button id="selectSecondPoint">Second point</button>
                <div class="selected-point" id="secondPoint">-</div>
            </div>
            <button id="toggleDirection">Clockwise</button>
            <button id="clear">Clear</button>
            <div class="info">
                <div>Path: <span id="pathInfo">-</span></div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.getElementById('createPoints').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('create-points'));
        });

        this.shadowRoot.getElementById('drawPolygon').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('draw-polygon'));
        });

        this.shadowRoot.getElementById('selectFirstPoint').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('select-first-point'));
        });

        this.shadowRoot.getElementById('selectSecondPoint').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('select-second-point'));
        });

        this.shadowRoot.getElementById('toggleDirection').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toggle-direction'));
        });

        this.shadowRoot.getElementById('clear').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('clear'));
        });
    }

    updatePointCount(count) {
        const pointCountElement = this.shadowRoot.getElementById('pointCount');
        pointCountElement.textContent = `Created ${count} points`;
        pointCountElement.classList.toggle('ready', count >= 3);
        this.shadowRoot.getElementById('drawPolygon').disabled = count < 3;
    }

    updateFirstPointInfo(point) {
        this.shadowRoot.getElementById('firstPoint').textContent = point !== null ? `p${point + 1}` : '-';
    }

    updateSecondPointInfo(point) {
        this.shadowRoot.getElementById('secondPoint').textContent = point !== null ? `p${point + 1}` : '-';
    }

    updatePathInfo(firstPoint, secondPoint, isClockwise) {
        const pathInfo = this.shadowRoot.getElementById('pathInfo');
        
        if (firstPoint === null || secondPoint === null) {
            pathInfo.textContent = '-';
            return;
        }

        const points = [];
        let current = firstPoint;
        while (current !== secondPoint) {
            points.push(`p${current + 1}`);
            current = isClockwise ? 
                (current + 1) % this.totalPoints : 
                (current - 1 + this.totalPoints) % this.totalPoints;
        }
        points.push(`p${secondPoint + 1}`);
        
        pathInfo.textContent = points.join(' → ');
    }

    enablePointSelection() {
        this.shadowRoot.getElementById('selectFirstPoint').disabled = false;
        this.shadowRoot.getElementById('selectSecondPoint').disabled = false;
    }

    enableDirectionToggle() {
        this.shadowRoot.getElementById('toggleDirection').disabled = false;
    }

    updateDirectionButton(isClockwise) {
        this.shadowRoot.getElementById('toggleDirection').textContent = isClockwise ? 'Clockwise' : 'Counterclockwise';
    }

    clear() {
        this.shadowRoot.getElementById('createPoints').disabled = false;
        this.shadowRoot.getElementById('drawPolygon').disabled = true;
        this.shadowRoot.getElementById('selectFirstPoint').disabled = true;
        this.shadowRoot.getElementById('selectSecondPoint').disabled = true;
        this.shadowRoot.getElementById('toggleDirection').disabled = true;
        this.shadowRoot.getElementById('toggleDirection').textContent = 'Clockwise';
        
        this.shadowRoot.getElementById('firstPoint').textContent = '-';
        this.shadowRoot.getElementById('secondPoint').textContent = '-';
        this.shadowRoot.getElementById('pathInfo').textContent = '-';
    }

    setTotalPoints(count) {
        this.totalPoints = count;
    }
}

customElements.define('polygon-panel', PolygonPanel); 