from flask import Flask, render_template
import json
import sys
import os

data_file = sys.argv[1]
config_file = "./config.json"


def read_config():
    # read and verify configuration file
    # TODO: verify it

    with open(config_file) as config_raw:
        config = json.load(config_raw)

        assert("fields" in config)
        assert("colors" in config)
        assert("default_color" in config)

        return config

def get_column_orderings(header, field_names):
    # Extract location of each field from header names
    header_split = header.split(",")
    locations = dict()
    print(header_split)
    header_split[0] = header_split[0].lstrip('\ufeff')

    for field, field_name in field_names.items():
        locations[field] = header_split.index(field_name)
    
    print(locations)
    return locations

def entry_split_by_day(entry):
    # TODO: split entry by day and return list
    if entry["start_date"] == entry["end_date"]:
        entry_copy = dict(entry)
        entry_copy["date"] = entry_copy["start_date"]
        del entry_copy["start_date"]
        del entry_copy["end_date"]
        return [entry_copy]
    else:
        first_entry = dict(entry)
        first_entry["date"] = first_entry["start_date"]
        del first_entry["start_date"]
        del first_entry["end_date"]
        first_entry["end_time"] = "24:00:00"

        second_entry = dict(entry)
        second_entry["date"] = second_entry["end_date"]
        del second_entry["start_date"]
        del second_entry["end_date"]
        second_entry["start_time"] = "00:00:00"

        return [first_entry, second_entry]


def enhance_data(config, max_size):
    # Defines in which column is the header - verification
    # returns updated config with colors
    # lists projects with undefined colors
    # TODO: Might generate colors here already
    with open(data_file) as data_raw:
        header = data_raw.readline()
        columns_numbered = get_column_orderings(header, config["fields"])
        config["fields_numbered"] = columns_numbered
        project_field = columns_numbered["project"]

        missing_colors = set()
        data = list()

        for line in data_raw:
            fields = line.split(",")
            project = fields[project_field]

            entry = dict()
            for column, number in columns_numbered.items():
                entry[column] = fields[number]

            if project in config["colors"]:
                color = config["colors"][project]
            else:
                color = config["default_color"]
                missing_colors.add(project)

            entry["color"] = color

            entries = entry_split_by_day(entry)
            data.extend(entries)
            
            if max_size is not None and len(data) > max_size:
                break

        if len(missing_colors) > 0:
            print("There are missing colors", missing_colors)

    return data, config

app = Flask(__name__)



@app.route("/get/<int:n>")
def get_internal(n=None):
    config = read_config()
    data, config = enhance_data(config, n)
    return json.dumps({
        "response": "ok",
        "config": config,
        "data": data
    }), 200, {'ContentType': 'application/json'}

@app.route("/get")
def get_default():
    return get_internal(None)

@app.route("/get/<int:n>")
def get(n):
    return get_internal(n)

@app.route("/")
def main_page():
    return render_template("index.html")


if __name__ == "__main__":
    if not os.path.exists(config_file):
        print("no config file")
        exit(1)

    if not os.path.exists(data_file):
        print("no data file")
        exit(1)

    app.run("0.0.0.0", 8080, debug=True)
