dateEltMap = new Map();

function convertTime(timeString) {
    const timeArray = timeString.split(":").map((a) => parseInt(a));
    return (timeArray[0] * 60 * 60 + timeArray[1] * 60 + timeArray[2]) / (60 * 60);
}

function getUniqueDates(data) {
    const result = new Set();
    for (const elt of data) {
        result.add(elt["date"]);
    }
    return result;
}

const dayHeight = 700;

function createDateElement(date) {
    const contentDiv = document.getElementById("content");

    if ($(`div[data-date="${date}"`).length == 0) {
        const dateElt = document.createElement("div");
        dateElt.setAttribute("data-date", date);
        dateElt.setAttribute("class", "day");
        dateElt.setAttribute("style", `height: ${dayHeight}px`);
        contentDiv.append(dateElt);
        dateEltMap.set(date, dateElt);
    }
}

function getColor(project) {
    switch (project) {
        case "Sleep": return "black";
        case "Relax": return "green";
        case "French": return "blue";
        case "Studies": return "blue";
        case "Piano": return "blue";
        case "Petri": return "blue";
        case "Organization": return "yellow";
        case "Reading": return "orange";
        case "Distractions": return "#ff392e";
        case "Vocabium": return "purple";
        case "Sport": return "green";
        case "Meeting": return "yellow";
        default: {
            return "gray";
        }
    }
}

function generateElements(results) {
    const uniqueDates = getUniqueDates(results);
    for (const date of uniqueDates) {
        createDateElement(date);
    }

    for (const entry of results) {
        const startTime = convertTime(entry.startTime);
        const endTime = convertTime(entry.endTime);

        const dateElt = dateEltMap.get(entry.date);

        let element = document.createElement("div");
        element.setAttribute("class", "entry");
        const height = dayHeight * (endTime - startTime) / 24;
        const topSpace = dayHeight * (startTime) / 24;
        const color = getColor(entry.project);
        let description = document.createElement("p");
        description.setAttribute("class", "description");
        description.innerHTML = entry["name"];
        element.append(description);
        element.setAttribute("style", `height: ${height}px; top: ${topSpace}px; background-color: ${color}`)
        dateElt.append(element);
    }
}

