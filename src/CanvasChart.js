class CanvasChart {
    constructor(canvas, options) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        // массивы исходных значений и расчитанных координат предыдущей и текущей отрисовки
        this.rawData = null;
        this.currentPoints = null;
        this.lastPoints = null;

        // массивы координат одинакового размера для анимации и время старта анимации
        this.animation = {
            from: null,
            to: null,
            current: null,
            requestFrameId: null,
            startTime: 0,
        };

        // опции отрисовки по умолчанию
        this.options = {
            padding: 0,
            pointSize: 4,
            animationDuration: 300,
            lineColor: '#490554',
            pointFillColor: '#ffffff',
            pointStrokeColor: '#490554',
            lineWidth: 1,
            pointLineWidth: 3,
            ...options,
        };
        this.setSize();
        this.tick = this.tick.bind(this);
        window.addEventListener('resize', this.setSize.bind(this));
    }

    draw(data) {
        this.currentPoints = CanvasChart.getCoords(
            data,
            this.canvas.clientWidth,
            this.canvas.clientHeight,
            this.options.padding,
        );
        this.rawData = data;
        if (this.lastPoints) {
            if (this.animation.current) {
                cancelAnimationFrame(this.animation.requestFrameId);
                this.lastPoints = this.animation.current;
            }
            this.animate();
        } else {
            this.lastPoints = this.currentPoints;
            this.render(this.currentPoints);
        }
    }

    static getCoords(data, width, height, padding) {
        const range = this.getRange(data);

        // Значение шага по обеим осям
        const oneStepX = (width - (padding * 2)) / (data.length - 1);
        const oneStepY = (height - (padding * 2)) / Math.abs(range.max - range.min);

        // Для смещения начала диапазона к 0
        const offset = range.min < 0 ? Math.abs(range.min) : -range.min;

        // Вычисление координат каждой точки
        return data.map((value, i) => ({
            x: padding + oneStepX * i,
            y: height - padding - ((value + offset) * oneStepY),
        }));
    }

    // Определяет диапазон значений в исходном массиве
    static getRange(data) {
        return data.reduce((acc, curr) => ({
            min: curr < acc.min ? curr : acc.min,
            max: curr > acc.max ? curr : acc.max,
        }), {
            min: Infinity,
            max: -Infinity,
        });
    }

    render(points) {
        this.drawLines(points)
            .drawPoints(points);
    }

    animate() {
        this.alignSegments();
        this.animation.startTime = performance.now();
        this.animation.requestFrameId = requestAnimationFrame(this.tick);
    }

    // Выполняется для каждого кадра анимации перехода, анимация линейная
    tick(time) {
        const timeFraction = (time - this.animation.startTime) / this.options.animationDuration;
        this.animation.current = this.animation.to.map((point, i) => ({
            x: this.animation.from[i].x + (point.x - this.animation.from[i].x) * timeFraction,
            y: this.animation.from[i].y + (point.y - this.animation.from[i].y) * timeFraction,
        }));
        this.render(this.animation.current);
        if (timeFraction < 1) {
            this.animation.requestFrameId = requestAnimationFrame(this.tick);
        } else {
            this.lastPoints = this.currentPoints;
            this.animation.current = null;

            // По завершении анимации делаем еще одну отрисовку без лишних точек
            this.render(this.currentPoints);
        }
    }

    setSize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        if (this.rawData) {
            this.draw(this.rawData);
        }
    }

    // Уравниваем количество точек для плавного перехода графиков один в другой
    alignSegments() {
        this.animation.from = this.lastPoints;
        this.animation.to = this.currentPoints;
        if (this.animation.from.length === this.animation.to.length) {
            return;
        }
        const small = this.animation.from.length > this.animation.to.length ? 'to' : 'from';
        const big = this.animation.from.length > this.animation.to.length ? 'from' : 'to';
        const ratio = this.animation[small].length / this.animation[big].length;

        // Заполняем меньший массив, равномерно дублируя точки
        this.animation[small] = this.animation[big].map((point, i) => this.animation[small][Math.floor(i * ratio)]);
    }

    drawLines(points) {
        // Настройка контекста для отрисовки линий
        this.ctx.lineWidth = this.options.lineWidth;
        this.ctx.strokeStyle = this.options.lineColor;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= points.length - 1; i += 1) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.stroke();
        this.ctx.closePath();
        return this;
    }

    drawPoints(points) {
        // Настройка контекста для отрисовки точек
        this.ctx.lineWidth = this.options.pointLineWidth;
        this.ctx.strokeStyle = this.options.lineColor;
        this.ctx.fillStyle = this.options.pointFillColor;

        this.ctx.beginPath();
        points.forEach((point) => {
            this.ctx.moveTo(point.x + this.options.pointSize, point.y);
            this.ctx.arc(point.x, point.y, this.options.pointSize, 0, Math.PI * 2, true);
        });
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();
        return this;
    }
}
export default CanvasChart;
