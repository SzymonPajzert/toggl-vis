

console.log("getting data");

var downloadedData = new Array();

function saveData(result) {
    downloadedData.push(...result);
}

function digestData(data) {
    var result = new Array();

    for (const elt of data) {
        const startDate = elt.start.split("T")[0];
        const startTime = elt.start.split("T")[1].split("+")[0];
        const endDate = elt.end.split("T")[0];
        const endTime = elt.end.split("T")[1].split("+")[0];

        if (startDate !== endDate) {
            result.push({
                name: elt["description"],
                startTime: "00:00:00",
                endTime: endTime,
                date: endDate,
                project: elt["project"]
            });
            result.push({
                name: elt["description"],
                startTime: startTime,
                endTime: "24:00:00",
                date: startDate,
                project: elt["project"]
            });
        }

        result.push({
            name: elt["description"],
            startTime: startTime,
            endTime: endTime,
            date: startDate,
            project: elt["project"]
        });
    }

    saveData(result);
    generateElements(result);
}

function getDataFromPage(pageNumber) {
    $.ajax
    ({
        type: "GET",
        url: "https://toggl.com/reports/api/v2/details",
        dataType: 'json',
        async: false,
        data: {
            user_agent: "szymonpajzert@gmail.com",
            workspace_id: workspaceId,
            since: "2019-08-01",
            page: pageNumber,
            order_desc: "on"
        },
        success: function (result) {
            digestData(result.data);
            if (result.data.length > 0) {
                console.log("Getting more data")
                setTimeout(getDataFromPage, 1005, pageNumber + 1);
            }
        },
        always: function () {
            console.log("Sent");
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(apiToken + ":" + 'api_token'));
        }
    });
}