let Meteor = Package.meteor.Meteor;

let sql = require('mssql');

export const Sql = {};

Sql.driver = sql;

if (! Meteor.settings.database ||
  ! Meteor.settings.database.user ||
  ! Meteor.settings.database.password) {
  console.error('mssql: Database unconfigured');
} else {
  Sql.connection = new Sql.driver.Connection(Meteor.settings.database, function (err) {
    if (err) console.log("Can't connect to database");
  });
}


Sql.new = Meteor.wrapAsync(newConnection);

function newConnection (info){
  let newSql = {};

  if (! info ||
    ! info.user ||
    ! info.password) {
    console.error('database infomation invaild!');
  } else {
    newSql.connection = new Sql.driver.Connection(info, function (err) {
      if (err) console.log("Can't connect to database!");
      else console.log('connect success!');
    });
  }

  newSql.q = Meteor.wrapAsync(sqlQuery);

  function sqlQuery (query, inputs, cb) {
    try {
      if (typeof inputs === 'function') {
        cb = inputs;
        inputs = null;
      }

      var request = new sql.Request(newSql.connection);
      if (inputs) {
        if (_.isArray(inputs)) {
          _.each(inputs, function (e) {
            if (e.type) request.input(e.name, e.type, e.value);
            else        request.input(e.name, e.value);
          });
        }
        else if (_.isObject(inputs)) {
          _.each(inputs, function (e, k) {
            request.input(k, e);
          });
        }
      }

      request.query(query, cb);
    }
    catch (e) {
      return cb(e);
    }
  }



  newSql.ps = Meteor.wrapAsync(prepareStatement);

  function prepareStatement (opts, cb) {
    opts = opts || {};
    opts.inputs = opts.inputs || {};

    var request = new sql.PreparedStatement(newSql.connection);

    _.each(opts.inputs, function (v, k) {
      request.input(k, v);
    });

    request.prepare(opts.query, function (err, res) {
      if (err) return cb(err);

      var preparedStatement = Meteor.wrapAsync(request.execute, request);
      preparedStatement.unprepare = request.unprepare;

      return cb(null, preparedStatement);
    });
  }



  newSql.sp = Meteor.wrapAsync(storedProcedure);

  function storedProcedure (opts, cb) {
    opts = opts || {};
    opts.inputs = opts.inputs || {};
    opts.outputs = opts.outputs || {};

    var request = new sql.Request(newSql.connection);

    _.each(opts.inputs, function (i) {
      request.input(i.name, i.type, i.value);
    });

    _.each(opts.outputs, function (type, name) {
      request.output(name, type);
    });

    request.execute(opts.sp, function(err, recordsets, returnValue) {
      return cb(err, recordsets, returnValue)
    });
  }

  return newSql;
}



Sql.q = Meteor.wrapAsync(sqlQuery);

function sqlQuery (query, inputs, cb) {
  try {
    if (typeof inputs === 'function') {
      cb = inputs;
      inputs = null;
    }

    var request = new sql.Request(Sql.connection);
    if (inputs) {
      if (_.isArray(inputs)) {
        _.each(inputs, function (e) {
          if (e.type) request.input(e.name, e.type, e.value);
          else        request.input(e.name, e.value);
        });
      }
      else if (_.isObject(inputs)) {
        _.each(inputs, function (e, k) {
          request.input(k, e);
        });
      }
    }

    request.query(query, cb);
  }
  catch (e) {
    return cb(e);
  }
}



Sql.ps = Meteor.wrapAsync(prepareStatement);

function prepareStatement (opts, cb) {
  opts = opts || {};
  opts.inputs = opts.inputs || {};

  var request = new sql.PreparedStatement(Sql.connection);

  _.each(opts.inputs, function (v, k) {
    request.input(k, v);
  });

  request.prepare(opts.query, function (err, res) {
    if (err) return cb(err);

    var preparedStatement = Meteor.wrapAsync(request.execute, request);
    preparedStatement.unprepare = request.unprepare;

    return cb(null, preparedStatement);
  });
}



Sql.sp = Meteor.wrapAsync(storedProcedure);

function storedProcedure (opts, cb) {
  opts = opts || {};
  opts.inputs = opts.inputs || {};
  opts.outputs = opts.outputs || {};

  var request = new sql.Request(Sql.connection);

  _.each(opts.inputs, function (i) {
    request.input(i.name, i.type, i.value);
  });

  _.each(opts.outputs, function (type, name) {
    request.output(name, type);
  });

  request.execute(opts.sp, function(err, recordsets, returnValue) {
    return cb(err, recordsets, returnValue)
  });
}