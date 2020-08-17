const getPoints = (minLength, maxLength) => {
    const points = [];

    // Кол-во значений
    const pointsNumber = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    // Для изменения знака значения
    const sign = () => (Math.random() >= 0.5 ? 1 : -1);

    // Диапазон значений от -200 до 200
    for (let i = pointsNumber; i >= 1; i -= 1) {
        points.push(Math.floor((Math.random() * 200) * sign()));
    }
    console.log(points);
    return points;
};

export default getPoints;
