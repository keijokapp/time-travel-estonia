const populationData = {
    /**
    2019: {
        Tallinn: {
           "14": 123123123
        }
    }
     */
};

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
        let avgSum = 0;
        let avgSqrSum = 0;
        let productSum = 0;
        let yearSum = 0
        let yearCount = 0;

        for(let year =  firstYear; year <= lastYear; year++) {
            const avg = populationData[year][location].averageAge;
            if(!isNaN(avg)) {
                avgSum += avg;
                avgSqrSum += avg * avg;
                productSum += year * avg;
                yearSum += year;
                yearCount++;
            }
        }

        console.log('avgSum %d, avgSqrSum %d, productSum %d, yearSum %d, yearCount %d', avgSum, avgSqrSum, productSum, yearSum, yearCount)

        let avgAvg = avgSum / yearCount;
        let yearAvg = yearSum / yearCount;

        const ssxx = avgSum - yearCount * avgAvg * avgAvg;
        const ssxy = productSum - yearCount * yearAvg * avgAvg;

        const b = ssxy / ssxx;
        const a = yearAvg - b * avgAvg;

        regressionCoefficients[location] = { a, b };
    }

    for(let year = lastYear + 1; year < lastYear + 4; year++) {
        populationData[year] = {};
        for (const location of locations) {
            populationData[year][location] = {
                averageAge: regressionCoefficients[location].a * year + regressionCoefficients[location].b
            };
        }
    }

    console.log(populationData, firstYear, lastYear);

    applyYearData(populationData[lastYear])

})()

function applyYearData(year) {
    for (var i = 0; i < JSMaps.maps.estonia.paths.length; i++) {
        const location = JSMaps.maps.estonia.paths[i].name
        const avg = year[location].averageAge
        const green = Math.abs(((avg - 38) * 255 / 8) - 255)
        console.log(location, green)
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
