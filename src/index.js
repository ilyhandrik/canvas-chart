import './scss/style.scss';
import CanvasChart from './CanvasChart';
import getPoints from './points';

const canvas = document.getElementById('canvas');
const options = { padding: 50 };

const canvasChart = new CanvasChart(canvas, options);

canvas.addEventListener('click', () => {
    canvasChart.draw(getPoints(2, 10));
});
