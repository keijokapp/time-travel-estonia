const populationData = { };


function findLineByLeastSquares(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (let v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    return [ m, b ];
}


(async () => {

    let firstYear = Infinity;
    let lastYear = 0;
    const locations = new Set;

    await new Promise((resolve, reject) => {
        Papa.parse('RV0241.csv', {
            download: true,
            header: true,
            worker: true,
            step({data, errors, meta}) {
                for(const entry of data) {
                    if(!entry['DIM2']) {
                        continue;
                    }

                    const location = entry['Administrative unit or type of settlement'];
                    const sex = entry['Sex'];
                    const age = parseInt(entry['Age']);
                    const year = Number(entry['TIME']);
                    const count = Number(entry['Value']);

                    if (!location.includes("COUNTY")) return;

                    if(year > lastYear) {
                        lastYear = year;
                    }
                    if(year < firstYear) {
                        firstYear = year;
                    }
                    locations.add(location);

                    if (!populationData[year])
                        populationData[year] = {}
                    if (!populationData[year][location])
                        populationData[year][location] = {}
                    if (!populationData[year][location].ages)
                        populationData[year][location].ages = {}
                    if (!populationData[year].pyramid)
                        populationData[year].pyramid = {}
                    if (!populationData[year].pyramid[age])
                        populationData[year].pyramid[age] = [0, 0]


                    if (sex !== "Males and females") {
                        if (sex === "Males")
                            populationData[year].pyramid[age][0] = count
                        if (sex === "Females")
                            populationData[year].pyramid[age][1] = count
                        return;
                    }

                    if (data['Age'] === "Total")
                        populationData[year][location].population = count
                    else if (!isNaN(age))
                        populationData[year][location].ages[age] = count

                }
            },
            complete() {
                resolve();
            }
        })
    });

    for (const year in populationData) {
        for (const location in populationData[year]) {
            if (location === 'pyramid') continue;
            const ages = populationData[year][location].ages
            let sumMult = 0
            let sumPopulation = 0
            for (const [age, pop] of Object.entries(ages)) {
                sumMult += age * pop
                sumPopulation += pop
            }
            const avg = sumMult / sumPopulation
            delete populationData[year][location].ages
            populationData[year][location].averageAge = avg
        }
    }

    const regressionCoefficients = {};

    for(const location of locations) {
        const xValues = [];
        const yValues = [];
        for(let year =  firstYear; year <= lastYear; year++) {
            xValues.push(year);
            yValues.push(populationData[year][location].averageAge);
        }
        const result = findLineByLeastSquares(xValues, yValues);
        console.log('result', result)
        regressionCoefficients[location] = { a: result[0], b: result[1] };
    }

    for(let age = 0; age < 85; age++) {
        const xValues = [];
        const y1Values = [];
        const y2Values = [];
        for(let year =  firstYear; year <= lastYear; year++) {
            xValues.push(year);
            y1Values.push(populationData[year].pyramid[age][0]);
            y2Values.push(populationData[year].pyramid[age][1]);
        }
        const result1 = findLineByLeastSquares(xValues, y1Values);
        const result2 = findLineByLeastSquares(xValues, y2Values);
        regressionCoefficients[age] = [
            { a: result1[0], b: result1[1] },
            { a: result2[0], b: result2[1] }
        ];
    }

    for(let year = lastYear + 1; year <= 2030; year++) {
        populationData[year] = { pyramid: {} };
        for (const location of locations) {
            const averageAge = regressionCoefficients[location].a * year + regressionCoefficients[location].b;
            populationData[year][location] = {
                averageAge: averageAge >= 0 ? (averageAge <= 86 ? averageAge : 86) : 0
            };
        }
        for(let age = 0; age < 85; age++) {
            populationData[year].pyramid[age] = [
                regressionCoefficients[age][0].a * year + regressionCoefficients[age][0].b,
                regressionCoefficients[age][1].a * year + regressionCoefficients[age][1].b
            ]
        }
    }

    document.querySelector('#time-slider').setAttribute('max', 2030);

    applyYearData(populationData[lastYear])

})()

function applyYearData(year) {
    for (var i = 0; i < JSMaps.maps.estonia.paths.length; i++) {
        const location = JSMaps.maps.estonia.paths[i].name
        const avg = year[location].averageAge
        const green = 255 - (Math.max(Math.min(avg, 44), 38) - 38) * 255 / 8;
        JSMaps.maps.estonia.paths[i].color = `rgb(0,${green}, 0)`
    }

    drawPyramid(year.pyramid);
    /*
    for (const location of Object.keys(year)) {
        const avg = year[location].averageAge
        const green = (avg - 38) * 255 / 8
        JSMaps.maps.estonia.paths[0].color = "#ff0000"
    }
    */

    $('#estonia-map').empty()
    $('.jsmaps-select.mobile').remove()
    $('#estonia-map').JSMaps({
        map: 'estonia'
    });
}

$('#time-slider').on('input', e => {
    const year = e.target.value
    applyYearData(populationData[year])
})


$(function () {

    // on page load, set the text of the label based the value of the range
    $('#time-label').text($('#time-slider').val());

    // setup an event handler to set the text when the range value is dragged (see event for input) or changed (see event for change)
    $('#time-slider').on('input change', function () {
        $('#time-label').text($(this).val());
    });

});

let playerId
$('#play').on('click', e => {
    if (playerId) {
        clearInterval(playerId)
        playerId = null
    } else {
        playerId = setInterval(() => {
            const now = Number($('#time-slider').val())
            const max = Number(document.querySelector('#time-slider').getAttribute('max'))
            let next = now + 1
            if (next >= max)
                next = Number(document.querySelector('#time-slider').getAttribute('min'))
            document.querySelector('#time-slider').value = next
            $('#time-slider').trigger('input')
        }, 500)
    }
})