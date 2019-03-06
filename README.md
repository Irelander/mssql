# `irelander:mssql` for Meteor

Carefully extended emgee:mssql package. This package is meant to replace original emgee:mssql, emgee:mssql should be removed to avoid interference and unexpected behavior.

## Change Log
 - 06/03/2019
 	- add enable SP OUTPUT parameters, and will return outputs param after sp execute! <a href="#output"> see the document!</a>

 - 02/02/2019
	- resolves issues that previously had a connection asynchronously from ``Sql.new`` function


## Update API

### `Sql.new` - Get New Sql connection

##### Params :

```javascript
    let newConnectInfomation = {
      "server"   : "192.168.1.2",
      "database" : "database",
      "user"     : "username",
      "password" : "password",
      "port"     : 1044, //[default=1433]
      "options"  : {
        //...same the setting option parameters
      }
    };

    let otherMssql = Sql.new(newConnectInfomation);
```

```javascript

    Sql.q("select * from table");         // ----- result from 192.168.1.1
    otherMssql.q("select * from table");  // ----- result from 192.168.1.2
    
```

**I needed multiple connection mssql, but emgee:mssql package not anymore update even a lot of users request about multi connection. so I fork this repository and updating.**
**Thank you for emgee ! I hopefully this useful! **

## `mssql` for Meteor

A wrapper for the [mssql](https://github.com/patriksimek/node-mssql) node
library. Provides non-reactive queries against a Microsoft SQL Server. The
wrapper provides three `Meteor.wrapAsync` functions, although but the `mssql`
library is exported as `Sql.driver` server-side, so any feature in the `mssql`
library can be called.

The API is available as `Sql` and is available server-side only. Wrap in a
method to deliver results to the client.

## Settings

Database connection settings are pulled from `Meteor.settings`, using the
following keys:

```json
    {
      "database": {
        "server"   : "192.168.1.1",
        "database" : "database",
        "user"     : "username",
        "password" : "password",
        "options"  : {
          "useUTC"     : false,
          "appName"    : "MeteorApp"
        }
      }
    }
```

*Note with Azure MSSQL DBAAS*
Azure requires an encrypted connection, so under `options` you will need to add `"encrypt":true` for it to work.

## API

### `Sql.driver` — `mssql` npm module

### `Sql.connection` — Current database connection

### `Sql.q` — Query

This allows a query to directly be run against the database. Supports parameterization.

##### Params:
```javascript
(query : String, inputs : [ { name : 'param1', type : Sql.driver.TYPE, value : 'My Value' }, ... ], optionalCallback)
or
(query : String, inputs : { myParam1 : 'My Value', paramNumba2 : 'This val', ... }, optionalCallback)
```

```javascript
    // Sync-style
    try {
      var res = Sql.q(query);
    } catch (e) {
    }

    // Sync-style with inputs
    try {
      var res = Sql.q(query, [
        { name : 'param1', type : Sql.driver.NVarChar, value : 'My Value' },
        { name : 'param2', type : Sql.driver.NVarChar, value : 'My Value' },
        { name : 'param3', type : Sql.driver.NVarChar, value : 'My Value' },
      ]);
    } catch (e) {
    }

    // Async-style
    Sql.q(query, function (err, res) {

    });

    // Async-style with inputs
    Sql.q(query, { name : 'param1', type : Sql.driver.NVarChar, value : 'My Value' }, function (err, res) {

    });
```


### `Sql.ps` - Prepared Statement

##### Params:
```javascript
({ query : String, inputs : { param1 : Sql.driver.TYPE, ..., paramN : Sql.driver.TYPE } }, optionalCallback)
```

The use of a prepared statement allows the database to cache the query plan. While it is slower for a single query, over multiple calls it will be faster. Prepared statements require parameterization and type assignment. See https://github.com/patriksimek/node-mssql#data-types for the types.

Calling `Sql.ps` prepares a SQL query. Meaning, it will return a function that will execute the
prepared statement. The returned function has a method named `unprepare()` that will unprepare the statement and free the connection.

#### Example:

```javascript
    var opts = {
      query : "select * from table where name = @firstname",
      inputs : {
        firstname : Sql.driver.NVarChar
      }
    }

    // Sync-style
    try {
      var query = Sql.ps(opts);
    } catch (e) {
      ...
    }

    var result  = query({ firstname : "Bob" });
    var result2 = query({ firstname : "John" });

    query.unprepare();
```


### `Sql.sp` - Stored Procedure
<div id="output"></div>
##### Params:
```javascript
({ sp : String, inputs : [ { name : String, type : Sql.driver.TYPE, value : val }, ... ], outputs : [ { name : String, type : Sql.driver.TYPE }, ... ], optionalCallback)
```

```javascript
    var opts = {
      sp : "SP_name",
      inputs : [ {
        name  : "param1",
        type  : Sql.driver.Int,
        value : 42
        }, ...
      ],
      outputs : [ {
        name  : "param1",
        type  : Sql.driver.Int
        }, ...
      ]
    }

    // Sync-style
    try {
      var res = Sql.sp(opts);
    } catch (e) {
    }

    // Async-style
    Sql.sp(opts, function (err, res) {

    });
    
    // if use outputs
	# response have outputs field
	Sql.sp(opts, function(err, res){
	
		console.log(res.outputs) ---> { param1 : value, .... }
	
	});
    
```
