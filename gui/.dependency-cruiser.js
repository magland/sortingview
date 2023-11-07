/** @type {import('dependency-cruiser').IConfiguration} */

var fontsize = "20";
var fontcolor = "black";

module.exports = {
  forbidden: [
    {
      name: 'no-between-library-innards',
      from: { path: "^src/libraries/([^/]+)/.+" },
      to: {
        path: "^src/libraries/([^/]+)/.+",
        pathNot: ["^src/libraries/([^/]+)/index.ts", "^src/libraries/$1/.+"]
      }
    },
    {
      name: 'no-library-innards',
      from: {
        path: "^src/.+",
        pathNot: "^src/libraries/.+"
      },
      to: {
        path: "^src/libraries/([^/]+)/.+",
        pathNot: ["^src/libraries/([^/]+)/index.ts"]
      }
    },
    {
      name: 'no-library-external-dependencies',
      from: {
        path: "^src/libraries/.+"
      },
      to: {
        path: "^src/.+",
        pathNot: ["^src/libraries/.+"]
      }
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
        'module: add it to your package.json. In all other cases you likely already know what to do.',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true
      }
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a config file), " +
        "add an exception for it in your dependency-cruiser configuration. By default " +
        "this rule does not scrutinize dot-files (e.g. .eslintrc.js), TypeScript declaration " +
        "files (.d.ts), tsconfig.json and some of the babel and webpack configs.",
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$',                            // TypeScript declaration files
          '(^|/)tsconfig\\.json$',                 // TypeScript config
          '(^|/)(babel|webpack)\\.config\\.(js|cjs|mjs|ts|json)$' // other configs
        ]
      },
      to: {},
    }
  ],
  options: {

    /* conditions specifying which files not to follow further when encountered:
       - path: a regular expression to match
       - dependencyTypes: see https://github.com/sverweij/dependency-cruiser/blob/master/doc/rules-reference.md#dependencytypes-and-dependencytypesnot
       for a complete list
    */
    doNotFollow: {
      path: 'node_modules'
    },
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    reporterOptions: {
      dot: {
        theme: {
          // don't use default theme
          replace: false,
          // vertical orientation TD or LR
          graph: {
            rankdir: "LR",
            splines: "ortho", // true or ortho (ortho takes a while for large jobs)
            fontsize: "14",
            ordering: "" // see https://github.com/sverweij/dependency-cruiser/issues/659#issuecomment-1241100514
          },
          modules: [
            {
              criteria: {source: "^src/libraries/view-"},
              attributes: {fillcolor: 'lightblue', fontcolor, color: 'gray', fontsize}
            },
            {
              criteria: {source: "^src/libraries/context-"},
              attributes: {fillcolor: 'pink', fontcolor, color: 'gray', fontsize}
            },
            {
              criteria: {source: "^src/libraries/util-"},
              attributes: {fillcolor: 'lightgreen', fontcolor, color: 'gray', fontsize}
            },
            {
              criteria: {source: "^src/libraries/component-"},
              attributes: {fillcolor: 'thistle', fontcolor, color: 'gray', fontsize}
            },
            {
              criteria: {source: "^src/libraries"},
              attributes: {fillcolor: 'lightgray', fontcolor, color: 'gray', fontsize}
            }
          ]
        },
      },
    },
  }
};
