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
                    if (sex !== "Males and females") return;

                    if (!populationData[year])
                        populationData[year] = {}
                    if (!populationData[year][location])
                        populationData[year][location] = {}
                    if (!populationData[year][location].ages)
                        populationData[year][location].ages = {}

                    if (data['Age'] === "Total")
                        populationData[year][location].population = count
                    else if(!isNaN(age))
                        populationData[year][location].ages[age] = count
                }
            },
            complete() {
                resolve();
            }
        })
    });

    for (const year of Object.keys(populationData)) {
        for (const location of Object.keys(populationData[year])) {
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

    console.log(populationData)
    applyYearData(populationData[2017])

})()

function applyYearData(year) {
    for (var i = 0; i < JSMaps.maps.estonia.paths.length; i++) {
        const location = JSMaps.maps.estonia.paths[i].name
        const avg = year[location].averageAge
        const green = Math.abs(((avg - 38) * 255 / 8) - 255)
        console.log(location, green)
        JSMaps.maps.estonia.paths[i].color = `rgb(0,${green}, 0)`
    }
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
