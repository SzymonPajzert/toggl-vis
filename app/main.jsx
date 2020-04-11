import React from 'react';
import ReactDOM from 'react-dom';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
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

function convertTime(timeString) {
    const timeArray = timeString.split(":").map((a) => parseInt(a));
    return (timeArray[0] * 60 * 60 + timeArray[1] * 60 + timeArray[2]) / (60 * 60);
}

class Day extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let events = [];
        for (const [idx, event] of this.props.events.entries()) {
            const startTime = convertTime(event.startTime);
            const endTime = convertTime(event.endTime);
            const topSpace = this.props.height * startTime / 24;
            const height = this.props.height * (endTime - startTime) / 24;
            const color = this.props.colors[event.project] || this.props.colors["default"];

            events.push(<div key={idx} className="entry" style={{
                height: `${height}px`,
                top: `${topSpace}px`,
                backgroundColor: color
            }}>
                <p className="description">
                    {event.name}
                </p>
            </div>)
        }

        return <div className="day" style={{ width: `${this.props.height / 5}px` }}>
            <div className="day-description">
                <Typography gutterBottom>
                    {this.props.day}
                </Typography>
            </div>

            <div className="day-entries" style={{
                height: `${this.props.height}px`,
            }}>
                {events}
            </div>
        </div>;
    }
}

class ContentBox extends React.Component {
    render() {
        let items = [];
        let perDay = Object.entries(this.props.perDay);

        for (const [idx, entry] of perDay.entries()) {
            items.push(<Day key={idx} day={entry[0]} events={entry[1]} colors={this.props.colors} height={this.props.height} />);
        }

        return <div id="content">
            {items}
        </div>
    }
}


class ContinousSlider extends React.Component {
    constructor(props) {
        super(props)
        this.state = { value: this.getState().value };

        this.getState = this.getState.bind(this);
        this.tmpHandleChange = this.tmpHandleChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getState() {
        return this.props.state;
    }

    tmpHandleChange(event, value) {
        this.setState({value: value});
    }

    handleChange(event, value) {
        this.setState({value: value});
        this.props.setState({ value: value });
    };

    render() {
        return (
            <div style={{
                width: 200
            }}>
                <Typography id="continuous-slider" gutterBottom>
                    {this.props.label}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item>
                        {this.props.minValue}
                    </Grid>
                    <Grid item xs>
                        <Slider
                            min={this.props.minValue}
                            max={this.props.maxValue}
                            value={this.state.value}
                            step={50}
                            onChange={this.tmpHandleChange}
                            onChangeCommitted={this.handleChange}
                            aria-labelledby={this.props.label}
                            valueLabelDisplay="auto"
                        />
                    </Grid>
                    <Grid item>
                        {this.props.maxValue}
                    </Grid>
                </Grid>
            </div>
        );
    }
}


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            values: [],
            sliderState: { value: 400 },
        };

        this.saveData = this.saveData.bind(this);
        this.digestData = this.digestData.bind(this);
        this.startDownloading = this.startDownloading.bind(this);
        this.getDataFromPage = this.getDataFromPage.bind(this);

        this.getPerDay = this.getPerDay.bind(this);
        this.getColors = this.getColors.bind(this);
    }

    // Appends data to existing values
    saveData(result) {
        this.setState((state) => {
            return { values: state.values.concat(result) };
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
        this.setState({ parameters: parameters, values: [] }, () => {
            console.log(this.state);
            this.getDataFromPage(1);
        });
    }

    getPerDay() {
        let result = {};

        for (const entry of this.state.values) {
            let currentValue = result[entry["date"]] || [];
            currentValue.push(entry);
            result[entry["date"]] = currentValue;
        }

        return result;
    }

    getColors() {
        return {
            "Sleep": "black",
            "Relax": "green",
            "French": "blue",
            "Studies": "blue",
            "Piano": "blue",
            "Petri": "blue",
            "Organization": "yellow",
            "Reading": "orange",
            "Distractions": "#ff392e",
            "Vocabium": "purple",
            "Sport": "green",
            "Meeting": "yellow",
            "German": "blue",
            "default": "gray",
        }
    }

    render() {
        return <div>
            <Parameters existingValues={getParameters()} onSubmit={this.startDownloading} />
            <ContinousSlider
                label="Vertical size"
                minValue={100} maxValue={1000}
                state={this.state.sliderState}
                setState={(state) => {
                    this.setState({ sliderState: state })
                }} />
            <ContentBox perDay={this.getPerDay()} colors={this.getColors()} height={this.state.sliderState.value} />
        </div>
    }
}


ReactDOM.render(<App />, document.getElementById("app"));