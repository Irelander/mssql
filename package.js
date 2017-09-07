Package.describe({
  name: "irelander:mssql",
  summary: "mssql wrapper: non-reactive SQL Server package fork from emgee:mssql",
  version: "1.0.0",
  git: "https://github.com/Irelander/mssql.git",
  documentation: "README.md"
});

Npm.depends({ "mssql" : "3.3.0" });

Package.onUse(function(api) {
  api.versionsFrom("1.5.2");
  api.use(['underscore','ecmascript'], 'server');
  api.addFiles("mssql.js", "server");
  api.export("Sql", "server");

  api.mainModule('mssql.js');
});