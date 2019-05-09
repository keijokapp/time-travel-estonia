(async () => {
    const data = await fetch('RV0241.csv')
    const text = await data.text()
    const rows = text.split("\n")
    const restructured = {
        /**
        2019: {
            Tallinn: {
               "14": 123123123
            }
        }
         */
    }
    let count = 0

    for (var i = 1; i < rows.length -1; i++) {
        const arr = rows[i].replace(/"/g, "").split(",")
        const location = arr[1]
        const sex = arr[3]
        const age = parseInt(arr[5]) || (arr[5] === "0" ? 0 : arr[5])
        const year = parseInt(arr[7])
        const count = parseInt(arr[8])

        if (!location.includes("COUNTY")) continue
        if (sex !== "Males and females") continue
        
        if (!restructured[year])
            restructured[year] = {}
        if (!restructured[year][location])
            restructured[year][location] = {}
        if (!restructured[year][location].ages)
            restructured[year][location].ages = {}

        if (age === "Total")
            restructured[year][location].population = count
        else
            restructured[year][location].ages[age] = count
    }

    for (const year of Object.keys(restructured)) {
        for (const location of Object.keys(restructured[year])) {
            const ages = restructured[year][location].ages
            let sumMult = 0
            let sumPopulation = 0
            for (const [age, pop] of Object.entries(ages)) {
                sumMult += age * pop
                sumPopulation += pop
            }
            const avg = sumMult / sumPopulation
            delete restructured[year][location].ages
            restructured[year][location].averageAge = avg
        }
    }

    console.log(restructured)
    
})()