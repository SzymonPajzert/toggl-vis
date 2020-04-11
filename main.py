from flask import Flask, render_template, send_from_directory
import json
import sys
import os

app = Flask(__name__, template_folder=os.path.abspath("./"))

@app.route("/")
def main_page():
    return render_template("index.html")


@app.route('/css/<path:path>')
def get_css(path):
    return send_from_directory('./css', path, cache_timeout=-1)


@app.route('/js/<path:path>')
def get_js(path):
    return send_from_directory('./js', path, cache_timeout=-1)


if __name__ == "__main__":
    app.run("0.0.0.0", 8080, debug=True)
