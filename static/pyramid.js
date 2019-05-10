const drawPyramid = (function() {

	const element = document.querySelector('#pyramid');
	const width = element.clientWidth;
	const height = element.clientHeight;
	const middleLine = width / 2;
	const maxAge = 85;
	const boxHeight = height / maxAge / 1.7;

	const draw = SVG('pyramid');

	function drawBox(age, {men, women}) {
		const boxPosition = height - (age * boxHeight) - Number(age) * 2;
		draw.rect(men, boxHeight).fill('#6c7183').move(middleLine - men, boxPosition);
		draw.rect(women, boxHeight).fill('#f9926a').move(middleLine + 24, boxPosition);
		if (age % 10 === 0)
			draw.text(age).move(middleLine + 4, boxPosition);
	}

	return function(data) {
		draw.clear();

		for(const age in data) {
			if(age < 85) {
				drawBox(age, {men: data[age][0], women: data[age][1]});
			}
		}
	}
})();
