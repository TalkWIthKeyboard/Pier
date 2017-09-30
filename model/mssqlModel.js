const sql = require('mssql');

let Environment = {
  depth: {
    type: sql.Int,
    options: {
      nullable: false,
    }
  },
  container: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
    }
  },
  name: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
      primary: true
    }
  },
  nameDisplay: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
    }
  },
  fileNameContains: {
    type: sql.VarChar(300),
    options: {
      nullable: true,
    }
  },
  fileNameContainsFilter: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  displayUI: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  hasBuildNumber: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  detailFromLogs: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  nameStatsMsSql: {
    type: sql.VarChar(300),
    options: {
      nullable: true,
    }
  },
  insertStatsMsSql: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  insertDocDb: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  insertSql: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  insertKusto: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  enable: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  justDuration: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  title: {
    type: sql.VarChar(300),
    options: {
      nullable: true
    }
  }
};

let Title = {
  name: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
      primary: true
    }
  },
  displayUI: {
    type: sql.Bit,
    options: {
      nullable: false,
    }
  },
  title: {
    type: sql.VarChar(300),
    options: {
      nullable: true,
    }
  }
};

let Test = {
  id: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
      primary: true
    }
  },
  testId: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  testClassName: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  testName: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  run: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  failed: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  testRunId: {
    type: sql.UniqueIdentifier,
    options: {
      nullable: false
    }
  },
  updateDate: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  attribute: {
    type: sql.VarChar('MAX'),
    options: {
      nullable: true
    }
  },
  totalFail: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  totalRetry: {
    type: sql.Int,
    options: {
      nullable: false
    }
  }
};

let TestRun = {
  id: {
    type: sql.UniqueIdentifier,
    options: {
      nullable: false,
      primary: true
    }
  },
  name: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  deployment: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  buildInfo: {
    type: sql.VarChar('MAX'),
    options: {
      nullable: true
    }
  },
  dateStart: {
    type: sql.DateTime,
    options: {
      nullable: false
    }
  },
  dateFinish: {
    type: sql.DateTime,
    options: {
      nullable: false
    }
  },
  fileFullName: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  totalTestCount: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  team: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  icmProcessed: {
    type: sql.Bit,
    options: {
      nullable: false
    }
  },
  totalSuccessSummary: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  totalFlakySummary: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  totalFailSummary: {
    type: sql.Int,
    options: {
      nullable: false
    }
  },
  filePath: {
    type: sql.VarChar(300),
    options: {
      nullable: true
    }
  },
  env: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  }
};

let TestDetail = {
  computerName: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  duration: {
    type: sql.VarChar(300),
    options: {
      nullable: true
    }
  },
  endTime: {
    type: sql.DateTime,
    options: {
      nullable: false
    }
  },
  startTime: {
    type: sql.DateTime,
    options: {
      nullable: false
    }
  },
  outcome: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  },
  errorInfo: {
    type: sql.VarChar('MAX'),
    options: {
      nullable: false
    }
  },
  originalDuration: {
    type: sql.Int,
    options: {
      nullable: true
    }
  },
  testId: {
    type: sql.VarChar(300),
    options: {
      nullable: false
    }
  }
};

let TestInfoNew = {
  Id: {
    type: sql.UniqueIdentifier,
    options: {
      nullable: false,
      primary: true
    }
  },
  DateUpdate: {
    type: sql.DateTime,
    options: {
      nullable: false
    }
  },
  ClasseName: {
    type: sql.VarChar('MAX'),
    options: {
      nullable: false
    }
  },
  Name: {
    type: sql.VarChar('MAX'),
    options: {
      nullable: false
    }
  },
  Owner: {
    type: sql.VarChar(50),
    options: {
      nullable: false
    }
  }
};

// todo
// let TestRuns = {
//   Id: {
//     type: sql.UniqueIdentifier,
//     options: {
//       nullable: false,
//       primary: true,
//     }
//   },
//   Env: {
//     type: sql.VarChar(50),
//     options: {
//       nullable: false,
//       primary: true,
//     }
//   },
//   EnvName: {
//     type: sql.VarChar(50),
//     options: {
//       nullable: true,
//     }
//   },
//   DateStart: {
//     type: sql.DateTime,
//     options: {
//       nullable: false,
//     }
//   },
//   DateFinish: {
//     type: sql.DateTime,
//     options: {
//       nullable: false,
//     }
//   },
//   Duration: {
//     type: sql.Int,
//     options: {
//       nullable: false,
//     }
//   },
//   TotalTestCount: {
//     type: sql.Int,
//     options: {
//       nullable: false,
//     }
//   },
//   TotalSuccessSummary: {
//     type: sql.Int,
//     options: {
//       nullable: false,
//     }
//   },
//   TotalFlakySummary: {
//     type: sql.Int,
//     options: {
//       nullable: false,
//     }
//   },
//   TotalFailSummary: {
//     type: sql.Int,
//     options: {
//       nullable: false,
//     }
//   },
//   FileFullName: {
//     type: sql.VarChar(300),
//     options: {
//       nullable: false,
//       primary: true,
//     }
//   },
// };

let TestStatsNew = {
  id: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
    }
  },
  testInfoId: {
    type: sql.UniqueIdentifier,
    options: {
      nullable: false,
    }
  },
  SubEnv: {
    type: sql.VarChar(300),
    options: {
      nullable: false,
    }
  },
  Env: {
    type: sql.VarChar(50),
    options: {
      nullable: false,
    }
  },
  Date: {
    type: sql.DateTime,
    options: {
      nullable: false,
    }
  },
  Duration: {
    type: sql.Int,
    options: {
      nullable: false,
    }
  },
  Passed: {
    type: sql.Int,
    options: {
      nullable: false,
    }
  },
  Retries: {
    type: sql.Int,
    options: {
      nullable: false,
    }
  },
  PassDuration: {
    type: sql.Int,
    options: {
      nullable: false,
    }
  },
  RetryDuration: {
    type: sql.Int,
    options: {
      nullable: false,
    }
  },
};

module.exports = {
  Environment: Environment,
  Title: Title,
  Test: Test,
  TestRun: TestRun,
  TestDetail: TestDetail,
  TestInfoNew: TestInfoNew,
  TestStatsNew: TestStatsNew,
};