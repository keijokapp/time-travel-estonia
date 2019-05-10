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
    const data = await fetch('RV0241.csv')
    const text = await data.text()
    const rows = text.split("\n")

    let count = 0

    for (var i = 1; i < rows.length - 1; i++) {
        const arr = rows[i].replace(/"/g, "").split(",")
        const location = arr[1]
        const sex = arr[3]
        const age = parseInt(arr[5]) || (arr[5] === "0" ? 0 : arr[5])
        const year = parseInt(arr[7])
        const count = parseInt(arr[8])

        if (!location.includes("COUNTY")) continue
        if (sex !== "Males and females") continue

        if (!populationData[year])
            populationData[year] = {}
        if (!populationData[year][location])
            populationData[year][location] = {}
        if (!populationData[year][location].ages)
            populationData[year][location].ages = {}

        if (age === "Total")
            populationData[year][location].population = count
        else
            populationData[year][location].ages[age] = count
    }

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
