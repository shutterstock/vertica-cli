var util = require('util');
var readline = require('readline');
var Vertica = require('vertica');
var pw = require('pw');
var Table = require('cli-table');
var optimist = require('optimist');

var options = optimist
	.usage('vertica -u user -h host -p port')
	.options('u', { demand: true, alias: 'user' })
	.options('h', { demand: true, alias: 'host' })
	.options('p', { demand: false, alias: 'port' })
	.options('d', { demand: false, alias: 'database' })
	.options('v', { demand: false, alias: 'verbose' })
	.argv;

process.stdout.write("Enter password: ");

var Client = function(options) {

	this.initialize = function(options) {

		this.options = {};

		['user', 'host', 'database', 'verbose', 'port'].forEach(function(option) {
			this.options[option] = options[option];
		}.bind(this));
	},

	this.connect = function(callback) {

		pw('', function(password) {

			this.connection = Vertica.connect({
				host: this.options.host,
				port: this.options.port,
				user: this.options.user,
				password: password,
				database: this.options.database

			}, function(err) {

				if (err) {
					console.log("ERROR: " + err);
					process.exit();

				} else {
					callback();
				}
			});

		}.bind(this));
	},

	this.repl = function() {

		this._readline();
		this._reset();

		this.line.on('line', function(input) {

			if (input.match(/^(exit|quit)$/)) {
				console.log("bye");
				process.exit();

			} else if (input.match(/^\s*$/) && !this.buffer.length && !this.queryPending) {
				this.line.prompt();

			} else {

				this.buffer += input + " ";
				this.buffer.replace(/[\s\n]+/gm, ' ');

				if (this.buffer.match(/;\s*$/m)) {

					this.queryPending = true;
					this.queryStartTime = new Date().getTime();

					this.connection.query(this.buffer, function(err, results) {

						var time = new Date().getTime() - this.queryStartTime;

						if (this.options.verbose) {
							if (err) console.log(err);
							if (results) console.log(results);
						}

						this._display({
							error: err,
							results: results,
							time: time
						});

						this._reset();
						this.queryPending = false;

					}.bind(this));

					this.buffer = '';
				}
			}

		}.bind(this));

		this.line.on("close", function() {
			console.log("\nbye");
			process.exit();
		});
	},

	this.run = function() {
		this.connect(function() { this.repl() }.bind(this));
	}

	this._readline = function() {

		this.line = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.line.setPrompt(this._prompt());
	},

	this._display = function(args) {

		var error = args.error;
		var results = args.results;
		var time = args.time;

		if (error) {
			console.log(error.message);

		} else {
			var head = results.fields.map(function(field) { return field.name });

			var table = new Table({
				head: head,
				style: { 
					compact: true,
					'padding-left': 1,
					'padding-right': 1,
				}
			});

			results.rows.forEach(function(row) {
				table.push(row.map(function(c) { return c == undefined ? '' : c.toString() }));
			});

			console.log(table.toString());
			console.log("%d seconds\n", (time / 1000).toFixed(2));
		}
	},

	this._reset = function() {
		this.buffer = '';
		this.line.prompt();
	},

	this._prompt = function() {
		return (new Date().getTime() > 1364788800000 && new Date().getTime() < 1364875200000) ?
			new Buffer("QzpcPg==", 'base64').toString('ascii') : 'vertica> ';
	}

	this.initialize(options);
};

var client = new Client(options);
client.run();

