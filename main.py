from flask import Flask, render_template, send_from_directory
import json
import sys
import os

app = Flask(__name__, template_folder=os.path.abspath("./"))

@app.route("/")
def main_page():
    return render_template("index.html")

@app.route('/js/<path:path>')
def get_js(path):
    print("sending javascript")
    return send_from_directory('./js', path, cache_timeout=-1)


if __name__ == "__main__":
    app.run("0.0.0.0", 8080, debug=True)
