const drawPyramid = (function() {

	const element = document.querySelector('#pyramid');
	const width = element.clientWidth;
	const height = element.clientHeight;
	const middleLine = width / 2;
	const maxAge = 85;
	const boxHeight = (height) / maxAge / 1.7;

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

//		draw.path('M4215.9,4627.6v-392.4h698.6c384.7,0,698.6-5.7,698.6-15.3c0-7.7-335-348.4-746.5-759.9l-744.6-744.6l-168.4,88c-313.9,162.7-595.3,231.6-943.6,229.7c-511.1-1.9-966.6-183.8-1337.9-534C893.1,1769.9,831.9,587,1528.6-234.1c185.7-218.2,472.8-423,754.1-537.9c409.6-166.5,905.3-185.7,1330.3-51.7c905.3,285.2,1487.2,1186.7,1368.6,2122.7c-30.6,245-95.7,451.7-212.5,677.6l-95.7,179.9l758,758l756.1,756.1v-713.9v-712h392.4h392.4v1387.7V5020H5594H4215.9V4627.6z M3325.9,2206.3c323.5-82.3,610.6-317.7,752.2-616.3c99.5-206.7,126.3-329.2,124.4-551.3C4196.8,307.6,3515.4-245.6,2797.6-102c-246.9,49.8-419.2,143.6-601,325.4c-250.7,250.8-354.1,495.7-354.1,836.5c0,472.8,239.3,857.5,664.2,1068C2747.8,2248.4,3050.3,2277.2,3325.9,2206.3z')
//			.scale(-10000, -10000).stroke('black');

//		draw.path('M6729.1,1536.4C5907.9,1421.6,5253.3,832,5054.3,32c-59.3-243.1-59.3-671.8,0-913c122.5-491.9,424.9-924.5,834.5-1190.6c189.5-124.4,306.3-178,534-248.8l166.5-51.7v-409.6v-409.6l-396.2-3.8l-398.1-5.7v-392.4v-392.4l398.1-5.7l396.2-3.8v-392.4V-4780h392.4h392.4v392.4v392.4h392.4h392.4v402v402h-392.4h-392.4v411.5c0,313.9,5.7,413.4,24.9,419.2c633.6,168.4,1075.7,513,1345.6,1048.9c275.6,547.4,281.4,1173.3,17.2,1732.2c-103.4,218.2-201,357.9-379,539.8c-176.1,178-323.5,283.3-551.3,394.3C7506.2,1511.5,7064,1584.3,6729.1,1536.4z M7249.7,728.7c53.6-9.6,168.4-53.6,256.5-95.7c300.5-143.6,539.8-438.3,624-771.4c36.4-145.5,36.4-428.8,0-574.2c-53.6-210.5-155-388.5-313.9-545.5c-241.2-239.3-503.4-350.3-834.5-350.3s-593.4,109.1-834.5,350.3c-245,243.1-348.4,488.1-348.4,823c-1.9,342.6,103.4,597.2,350.3,842.2C6447.7,707.6,6826.7,816.7,7249.7,728.7z')
//			.scale(-10000, -10000).stroke('black');

		draw.text('Male').font({size: 24}).move(middleLine - 50, 0);
		draw.text('Female').font({size: 24}).move(middleLine + 24, 0);

		let minCount = Infinity, maxCount = 0;

		for(const age in data) {
			if(age < 85) {
				if (data[age][0] < minCount) {
					minCount = data[age][0];
				}
				if (data[age][1] < minCount) {
					minCount = data[age][1];
				}
				if (data[age][0] > maxCount) {
					maxCount = data[age][0];
				}
				if (data[age][1] > maxCount) {
					maxCount = data[age][1];
				}
			}
		}

		const coefficient = middleLine / (maxCount - minCount);

		console.log(coefficient, data[0])
		function scale(count) {
			return (count - minCount) * coefficient;
		}

		for(const age in data) {
			if(age < 85) {
				drawBox(age, {men: scale(data[age][0]), women: scale(data[age][1])});
			}
		}
	}
})();
