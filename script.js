const pagesPerDay = [64, 15, 48, 72, 20, 55, 38];
const HIGH_PACE = 50;
const LAZY_LIMIT = 20;
const GOOD_AVERAGE = 40;

function findMax(numbers) {
    let max = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    return max;
}

function filterArray(numbers, condition) {
    const result = [];
    for (const number of numbers) {
        if (condition(number)) {
            result.push(number);
        }
    }
    return result;
}

function sumArray(numbers) {
    let sum = 0;
    for (const number of numbers) {
        sum += number;
    }
    return sum;
}

let userName = prompt("Как вас зовут?", "");
if (userName === null || userName.trim() === "") {
    userName = "Гость";
} else {
    userName = userName.trim();
}

alert(`Здравствуйте, ${userName}! Добро пожаловать в дневник книжного червя.`);
console.log(`Пользователь: ${userName}`);
console.log("Прочитано страниц по дням:", pagesPerDay);

const totalPages = sumArray(pagesPerDay);
const maxPages = findMax(pagesPerDay);
const highPaceDays = filterArray(pagesPerDay, (pages) => pages > HIGH_PACE);
const averagePages = totalPages / pagesPerDay.length;

let lazyDaysCount = 0;
for (let i = 0; i < pagesPerDay.length; i++) {
    if (pagesPerDay[i] <= LAZY_LIMIT) {
        lazyDaysCount++;
        console.log(`День ${i + 1}: ${pagesPerDay[i]} стр. — «ленивый» день`);
    }
}
const lazyShare = lazyDaysCount / pagesPerDay.length;

console.log(`Максимум за день: ${maxPages} стр.`);
console.log(`Дни с высоким темпом (> ${HIGH_PACE} стр.):`, highPaceDays);
console.log(`Количество «ленивых» дней (≤ ${LAZY_LIMIT} стр.): ${lazyDaysCount}`);
console.log(`Доля «ленивых» дней: ${(lazyShare * 100).toFixed(1)}%`);
console.log(`Среднее за день: ${averagePages.toFixed(1)} стр.`);

if (averagePages > GOOD_AVERAGE) {
    console.log("Отличный темп чтения!");
}

alert(`Всего прочитано ${totalPages} страниц, в ${highPaceDays.length} днях темп был высоким`);
