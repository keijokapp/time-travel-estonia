const drawPyramid = (function() {

	const element = document.querySelector('#pyramid');
	const width = element.clientWidth;
	const height = element.clientHeight;
	const middleLine = width / 2;
	const maxAge = 85;
	const boxHeight = height / maxAge;

	const draw = SVG('pyramid');

	function drawBox(age, {men, women}) {
		const boxPosition = age * boxHeight;
		draw.rect(men, boxHeight).fill('#517aff').move(middleLine - men, boxPosition);
		draw.rect(women, boxHeight).fill('#ee42f4').move(middleLine, boxPosition);
		draw.text('koer').move(middleLine + women, boxPosition);
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
