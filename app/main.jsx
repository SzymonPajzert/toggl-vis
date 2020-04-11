import React from 'react';
import ReactDOM from 'react-dom';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

function getParameters() {
    const localParams = window.location.hash;
    const params = new URLSearchParams(localParams.replace("#", "?"));

    return {
        workspaceId: params.get('workspaceId'),
        apiToken: params.get('apiToken'),
    };
}

class Parameters extends React.Component {
    constructor(props) {
        super(props);
        this.setChange = this.setChange.bind(this);

        this.state = this.props.existingValues;
    }

    setChange(fieldName) {
        return (event) => {
            this.setState({ [fieldName]: event.target.value });
        }
    }

    render() {
        return <div>
            <TextField label="workspaceId" value={this.props.existingValues["workspaceId"]} onChange={this.setChange("workspaceId")} />
            <br />
            <TextField label="apiToken" value={this.props.existingValues["apiToken"]} onChange={this.setChange("apiToken")} type="password" />
            <br />
            <Button variant="contained" color="primary" onClick={() => this.props.onSubmit(this.state)}>Set parameters</Button>
        </div>
    }
}




class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            values: []
        };

        this.saveData = this.saveData.bind(this);
        this.digestData = this.digestData.bind(this);
        this.startDownloading = this.startDownloading.bind(this);
        this.getDataFromPage = this.getDataFromPage.bind(this);
    }

    // Appends data to existing values
    saveData(result) {
        this.setState((state) => {
            return {values: state.values.concat(result)};
        })
    }

    digestData(data) {
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

        this.saveData(result);
    }

    getDataFromPage(pageNumber) {
        let digestData = this.digestData;
        let callback = this.getDataFromPage;

        const workspaceId = this.state.parameters.workspaceId;
        const apiToken = this.state.parameters.apiToken;

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
                        setTimeout(callback, 1005, pageNumber + 1);
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

    startDownloading(parameters) {
        console.log("starting download");
        this.setState({ parameters: parameters }, () => {
            console.log(this.state);
            this.getDataFromPage(1);
        });
    }

    render() {
        return <div>
            <Parameters existingValues={getParameters()} onSubmit={this.startDownloading} />
            <div id="content"></div>
        </div>
    }
}


ReactDOM.render(<App />, document.getElementById("app"));