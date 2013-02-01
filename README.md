# Vertica CLI

Minimal command-line client interface to Vertica.

```
$ node vertica -u username -h prod-verticadb01
Enter password:

vertica> select table_name from v_catalog.tables;
```

## Installation

Get the source:
```
$ git clone git://github.com/shutterstock/vertica-cli.git
```

Install dependencies:
```
$ cd vertica-cli
$ npm install
```

Run the client:
```
$ node vertica -u username -h prod-verticadb01
```
