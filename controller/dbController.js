var colors = require('colors');
var sqlite3 = require('sqlite3').verbose();

var logger = require('./logger.js');
var dbFile = require('./dbFile.js');

/*
  if(!exists) {
    db.run('CREATE TABLE Stuff (thing TEXT)');
  }
  
  var stmt = db.prepare('INSERT INTO Stuff VALUES (?)');
    
  //Insert random data
    var rnd;
    for (var i = 0; i < 10; i++) {
      rnd = Math.floor(Math.random() * 10000000);
      stmt.run('Thing #' + rnd);
    }
    
  stmt.finalize();
*/
var valHandler = function(val) {

  if (val === 'true') return true;
  if (val === 'false') return false;

  return val;
}

var dbLogger = function(data, str) {
  if (data['db'])
    logger.dbLog(data.reqId, ('[' + data.db.filename + ' ,' + data.db.mode + '] ').grey + str);
  else
    logger.dbLog(data.reqId, ('[' + data.dbFile + '] ').grey + str);
}

var connectDB = function(data) {
  return new Promise((resolve, reject) => {
    try {
      const _dbFile = (data['meta'] && data['meta']['dbFile']) || data['dbFile']

      logger.debug(data.reqId, 'connect Database file : ' + _dbFile);
      data.db = new sqlite3.Database(_dbFile);
      data.db.serialize(() => {
        dbLogger(data, 'open database...');
        resolve(data);
      });
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}
exports.connectDB = connectDB;

var closeDB = function(data) {
  return new Promise((resolve, reject) => {
    try {
      dbLogger(data, 'close Database....');
      data.db.close();
      setTimeout(() => resolve(data));
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}
exports.closeDB = closeDB;

var runSQL = function(data, sql, value) {
  return new Promise((resolve, reject) => {
    try {
      const _stamp = Date.now();

      let _pool = [];

      data['resault'] = [];

      dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + '][run] ').green + sql + ' ' + '[val]'.bgMagenta + ' ' + JSON.stringify(value));

      data.db.run(sql, value, (err, row) => {
        if (err) {
          dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + '] ').red + err);
          return reject(err)
        };
        if (_pool.length) {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + JSON.stringify(_pool));
          data['resault'] = _pool;
        } else {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + ' successful...');
        }

        resolve(data);
      });

    } catch (e) {
      dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + ']').red + e.stack || e);
      reject(e);
    }
  });
};
exports.runSQL = runSQL;

var allSQL = function(data, sql, value) {
  return new Promise((resolve, reject) => {
    try {
      const _stamp = Date.now();

      data['resault'] = [];

      dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + '][all] ').green + sql + ' ' + '[val]'.bgMagenta + ' ' + JSON.stringify(value));


      data.db.all(sql, value, function(err, row) {

        if (err) {
          dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + '] ').red + err);
          return reject(err)
        };
        if (row.length) {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + JSON.stringify(row));
          data['resault'] = row;
        } else {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + ' successful...');
        }

        resolve(data)
      });

    } catch (e) {
      dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + ']').red + e.stack || e);
      reject(e);
    }
  });
};
exports.allSQL = allSQL;

var getSQL = function(data, sql, value) {
  return new Promise((resolve, reject) => {
    try {
      const _stamp = Date.now();
      data['resault'] = [];

      dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + '][get] ').green + sql + ' ' + '[val]'.bgMagenta + ' ' + JSON.stringify(value));


      data.db.get(sql, value, function(err, row) {
        if (err) {
          dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + '] ').red + err);
          return reject(err)
        };

        if (row) {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + JSON.stringify([row]));
          data['resault'] = row;
        } else {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + ' successful...');
        }

        resolve(data)
      });

    } catch (e) {
      dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + ']').red + e.stack || e);
      reject(e);
    }
  });
};
exports.getSQL = getSQL;

var prepareSQL = function(data, sql, value) {
  return new Promise((resolve, reject) => {
    try {
      const _stamp = Date.now();

      dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + '][prepare] ').green + sql + ' ' + '[val]'.bgMagenta + ' ' + JSON.stringify(value));


      var stmt = data.db.prepare(sql, err => {
        if (err) {
          dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + '] ').red + err);
          return reject(err)
        };

        dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + ' successful...');
        resolve(data);
      });

      value.forEach(val => {
        stmt.run(val);
      });

      stmt.finalize();

    } catch (e) {
      dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + ']').red + e.stack || e);
      reject(e);
    }
  });
};
exports.prepareSQL = prepareSQL;

var eachSQL = function(data, sql, value) {
  return new Promise((resolve, reject) => {
    try {
      var _pool = [];
      var _stamp = Date.now();
      data['resault'] = [];
      dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + '][each] ').green + sql + ' ' + '[val]'.bgMagenta + ' ' + JSON.stringify(value));

      data.db.each(sql, (err, row) => {
        if (err) {
          dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + '] ').red + err);
          return reject(err)
        };
        _pool.push(row);
      }, () => {
        if (_pool.length) {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + JSON.stringify(_pool));
          data['resault'] = _pool;
        } else {
          dbLogger(data, '[SQL]'.bgMagenta + ('[' + _stamp + ']').green + ' successful...');
        }
        resolve(data);
      });

    } catch (e) {
      dbLogger(data, '[SQL]'.bgRed + ('[' + _stamp + ']').red + e.stack || e);
      reject(e);
    }

  });
};
exports.eachSQL = eachSQL;

exports.initialDatabase = function(data) {

  /***********************************************************
  Construction :
    user.db(SQLite)
        type  
            tid     //(timestamp) parent key
            type_label
            cashType  // cost val(-1), both cost and income val(0), income val(1)
            master    // bool
            showInMap // bool
            quickSelect // bool

        typeMap 
            tid     //(timestamp) parent key
            sub_tid   //(timestamp) sub key
            sequence  //int

        record
            rid     //(timestamp) parent key
            cashType  // cost val(-1), income val(1)
            cid     //currencies 
            value
            memo    
            date    //'yyyy-mm-dd' sort by date (ORDER BY 'date' DESC [ASC | DESC])

        recordTypeMap
            rid     //(timestamp) record id
            tid     //(timestamp)

        currencies
            cid     //(timestamp) parent key
            to_cid    //(timestamp) parent key (empty will be current main currencies)
            main    // bool 
            type    // TWD, USD, etc...
            memo
            rate
            date    //'yyyy-mm-dd' sort by date (ORDER BY 'date' DESC [ASC | DESC])
            quickSelect   
            --------------------------
            + the mian currencies
            + rate = 1;
            + 
            + (Standard)    for view can tempraly change rate
            --------------------------
  ***********************************************************/

  return new Promise(async(resolve, reject) => {
    try {
      dbLogger(data, 'initial Database table');

      await runSQL(data, 'CREATE TABLE IF NOT EXISTS type (tid BIGINT PRIMARY KEY NOT NULL, type_label TEXT, cashType INT, master bool, showInMap bool, quickSelect bool);');
      await runSQL(data, 'CREATE TABLE IF NOT EXISTS typeMap (tid BIGINT NOT NULL, sub_tid BIGINT NOT NULL, sequence INT)');
      await runSQL(data, 'CREATE TABLE IF NOT EXISTS record (rid BIGINT PRIMARY KEY NOT NULL,cashType INT, cid BIGINT, value FLOAT, memo TEXT, date TEXT)');
      await runSQL(data, 'CREATE TABLE IF NOT EXISTS recordTypeMap (rid BIGINT NOT NULL, tid BIGINT NOT NULL)');
      await runSQL(data, 'CREATE TABLE IF NOT EXISTS currencies (cid BIGINT PRIMARY KEY NOT NULL, to_cid BIGINT,main BOOL, type TEXT, memo TEXT, rate FLOAT, date TEXT, quickSelect bool)');

      resolve(data);

    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.checkDBisCorrect = function(data) {
  return new Promise(async(resolve, reject) => {

    try {
      var _sql = 'SELECT * FROM type, typeMap, record, recordTypeMap, currencies LIMIT 1';

      var _dbFile = data['meta']['dbFile'];

      logger.debug(data.reqId, 'Check Database ' + _dbFile + ' is correct or not...');

      await connectDB(data);

      data['resault'] = {};
      try {
        await getSQL(data, _sql, []);
        data['resault']['isCorrect'] = true;
        data['resault']['message'] = 'OK';
      } catch (e) {
        data['resault']['isCorrect'] = false;
        data['resault']['message'] = err;
      }

      await closeDB(data);

      resolve(data);

    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

//********************************************
// Currencies ********************************

exports.getCurrencies = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _sql = 'SELECT * FROM currencies ';

      var _param = [];
      var _val = {};

      if (data.cid) {
        _param.push('cid=$cid');
        _val.$cid = data.cid;
      }

      if (data.to_cid) {
        _param.push('to_cid=$to_cid');
        _val.$to_cid = data.to_cid;
      }

      if (_param.length)
        _sql += ' WHERE ' + _param.join(' AND ');

      _sql += ' ORDER BY date DESC';

      if (data.limit) {
        _sql += ' LIMIT $limit';
        _val.$limit = data.limit;
      }

      await allSQL(data, _sql, _val);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.setCurrencies = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _param = [];
      var _val = [];

      ['to_cid', 'main', 'type', 'memo', 'rate', 'date', 'quickSelect'].forEach(function(each) {
        if (data[each] !== undefined) {
          _param.push(each);
          _val.push(valHandler(data[each]));
        }
      });

      if (data.cid) {
        _val.push(data.cid);
        var _sql = 'UPDATE currencies SET ' + _param.map(function(e, n) {
          return e + ' = ? '
        }) + 'WHERE cid = ?;';
      } else {
        data.cid = Date.now();
        _param.unshift('cid');
        _val.unshift(data.cid);
        var _sql = 'INSERT INTO currencies (' + _param.join(',') + ') VALUES(' + _param.map(function() {
          return '?'
        }).join(',') + ');';
      }

      await prepareSQL(data, _sql, [_val]);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.updateMainCurrency = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _sql = 'UPDATE currencies SET to_cid = $to_cid, rate = $rate WHERE cid = $main_cid';
      await allSQL(data, _sql, { $to_cid: data.cid, $rate: data.to_cid_rate, $main_cid: data.main_cid });
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.delCurrencies = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _conditions = {
        $del_cid: data.del_cid
      };

      var _sql = 'DELETE FROM currencies WHERE  cid = $del_cid AND to_cid NOT NULL AND to_cid != \'\'';
      await allSQL(data, _sql, _conditions);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};


//********************************************
// Types *************************************

exports.getTypes = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _sql = 'SELECT * FROM type ';
      if (data.tid !== undefined)
        _sql += 'WHERE tid=$tid ';

      await allSQL(data, _sql, { $tid: data.tid });
      resolve(data);
    } catch (e) {
      logger.error(e);
      setTimeout(() => reject(e));
    }
  });
};

exports.setTypes = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _param = [];
      var _val = [];
      data['resault'] = [];

      ['type_label', 'cashType', 'master', 'showInMap', 'quickSelect'].forEach(each => {
        if (data[each] !== undefined) {
          _param.push(each);
          _val.push(valHandler(data[each]));
        }
      });

      if (data.tid) {
        _val.push(data.tid);
        var _sql = 'UPDATE type SET ' + _param.map((e, n) => {
          return e + ' = ? '
        }) + 'WHERE tid = ?;';
      } else {
        data.tid = Date.now();
        _param.unshift('tid');
        _val.unshift(data.tid);
        var _sql = 'INSERT INTO type (' + _param.join(',') + ') VALUES(' + _param.map(() => {
          return '?'
        }).join(',') + ');';
      }

      await prepareSQL(data, _sql, [_val]);
      data['resault'] = [{ tid: data.tid }];
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.delTypes = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _sql = 'DELETE FROM type WHERE tid = $del_tid';
      await allSQL(data, _sql, { $del_tid: data['meta']['del_tid'] });
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}

exports.getTypeMaps = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _sql = 'SELECT * FROM typeMap ';

      if (data.tid !== undefined)
        if (data.sub_tid !== undefined)
          _sql += 'WHERE tid=$tid AND sub_tid=$sub_tid ';
        else
          _sql += 'WHERE tid=$tid OR sub_tid=$tid ';

      _sql += 'ORDER BY sequence ASC';

      await allSQL(data, _sql, { $tid: data.tid, $sub_tid: data.sub_tid });
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.setTypeMaps = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _param = [];
      var _val = [];

      ['tid', 'sub_tid'].forEach(each => {
        if (data[each] !== undefined) {
          _param.push(each);
          _val.push(data[each]);
        }
      });

      var _sql = 'INSERT INTO typeMap (' + _param.join(',') + ') VALUES(' + _param.map(() => {
        return '?'
      }).join(',') + ');';

      await prepareSQL(data, _sql, [_val]);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.delTypeMaps = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      const _meta = data['meta'];
      var _conditions = {
        $del_tid: _meta['del_tid'],
        $del_sub_tid: _meta['del_sub_tid']
      };

      if (_conditions['$del_sub_tid'])
        var _sql = 'DELETE FROM typeMap WHERE tid = $del_tid AND sub_tid = $del_sub_tid';
      else
        var _sql = 'DELETE FROM typeMap WHERE tid = $del_tid OR sub_tid = $del_tid';

      await allSQL(data, _sql, _conditions);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}



//********************************************
// record ************************************
exports.getRecord = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _param = [];
      var _val = {};

      if (data.rid) {
        _param.push('rid=$rid');
        _val.$rid = data.rid;
      }

      if (data.cashType) {
        _param.push('cashType=$cashType');
        _val.$cashType = data.cashType;
      }

      if (data.cid) {
        _param.push('cid=$cid');
        _val.$cid = data.cid;
      }

      if (data.value_greater) {
        _param.push('value>=$value_greater');
        _val.$value_greater = data.value_greater;
      }

      if (data.value_less) {
        _param.push('value<=$value_less');
        _val.$value_less = data.value_less;
      }

      if (data.memo) {
        _param.push('memo LIKE $memo');
        _val.$memo = '%' + data.memo + '%';
      }

      if (data.start_date) {
        _param.push('date>=$start_date');
        _val.$start_date = data.start_date;
      }

      if (data.end_date) {
        _param.push('date<=$end_date');
        _val.$end_date = data.end_date;
      }

      if (data.rids_json) {
        try {
          var _rids = JSON.parse(data.rids_json);

          _rids && _rids.forEach(function(rid) {
            if (!/^\d{13}$/.test(rid)) throw 'invalid rid ' + rid;
          });
          _param.push('rid IN ($rids)');
          _val.$rids = _rids.join(',');

        } catch (e) { console.log(e) }
      }



      var _sql = 'SELECT record.*,  GROUP_CONCAT(rm.tid) AS tids FROM record LEFT OUTER JOIN recordTypeMap rm on rm.rid = record.rid ';
      if (_param.length)
        _sql += ' WHERE ' + _param.join(' AND ');
      _sql += ' GROUP BY record.rid';

      if (data.tids_json) {
        try {
          var _tidsArray = JSON.parse(data.tids_json);

          if (!_tidsArray || !_tidsArray.forEach)
            throw 'invalid _tidsArray ' + _tidsArray;

          //---check--- formate
          _tidsArray.forEach(tids => {
            if (!tids || !tids.forEach) throw 'invalid tids ' + tids;
            tids.forEach(tid => {
              if (tid !== '_EMPTY_' && !/^\d{13}$/.test(tid)) throw 'invalid tid ' + tid;
            });
          })

          var _conditions = [];

          _tidsArray.forEach(tids => {
            var _map = tids.map(tid => {
              if (tid === '_EMPTY_')
                return 'tids IS NULL';
              else
                return 'tids LIKE '%' + tid + '%'';
            });
            _conditions.push(' ( ' + _map.join(' OR ') + ' ) ');
          });



          //data.type_query_set  = (String) [∪ Union , ∩ intersection]
          var _sqlSet = ' AND '; // ∩ intersection
          if (data.type_query_set == 'union')
            _sqlSet = ' OR '; // ∪ Union
          _sql = 'SELECT * FROM ( ' + _sql + ' ) WHERE ' + _conditions.join(_sqlSet) + ' ';

        } catch (e) { console.log(e) }
      }

      if (data.orderBy && /^[_a-zA-Z]{3,15}$/.test(data.orderBy[0])) {
        _sql += ' ORDER BY ' + data.orderBy[0];
      } else {
        _sql += ' ORDER BY date';
      }

      if (data.orderBy && data.orderBy[1] == 'ASC')
        _sql += ' ASC';
      else
        _sql += ' DESC';
      if (data.limit) {
        _sql += ' LIMIT $limit';
        _val.$limit = data.limit;
      }

      await allSQL(data, _sql, _val);
      resolve(data);

    } catch (e) {
      logger.error(e);
      reject(e);
    }

  });
};

exports.setRecord = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _param = [];
      var _val = [];

      ['cashType', 'cid', 'value', 'memo', 'date'].forEach(each => {
        if (data[each] !== undefined) {
          _param.push(each);
          _val.push(valHandler(data[each]));
        }
      });

      if (data.rid) {
        _val.push(data.rid);
        var _sql = 'UPDATE record SET ' + _param.map((e, n) => {
          return e + ' = ? '
        }) + 'WHERE rid = ?;';
      } else {
        data.rid = Date.now();
        _param.unshift('rid');
        _val.unshift(data.rid);
        var _sql = 'INSERT INTO record (' + _param.join(',') + ') VALUES(' + _param.map(() => {
          return '?'
        }).join(',') + ');';
      }

      await prepareSQL(data, _sql, [_val]);
      data['resault'] = [{ rid: data.rid }];
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

exports.delRecord = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _conditions = [];
      data.del_rid && _conditions.push('( rid=' + data.del_rid + ' )');

      if (_conditions.length) {
        var _sql = 'DELETE FROM record WHERE ' + _conditions.join(' OR ');
        await allSQL(data, _sql);
      }
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}


exports.getRecordTypeMap = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _sql = 'SELECT * FROM recordTypeMap ';
      var _conditions = [];

      data.rids && data.rids.forEach(function(rid) {
        (rid = parseInt(rid)) && _conditions.push('rid=' + rid);
      });

      data.tids && data.tids.forEach(function(tid) {
        (tid = parseInt(tid)) && _conditions.push('tid=' + tid);
      });

      data.rid && (data.rid = parseInt(data.rid)) && _conditions.push('rid=' + data.rid);
      data.tid && (data.tid = parseInt(data.tid)) && _conditions.push('tid=' + data.tid);

      if (_conditions.length)
        _sql += 'WHERE ' + _conditions.join(' OR ');

      if (data.limit) {
        _sql += ' LIMIT ' + data.limit;
      }

      await allSQL(data, _sql);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

var addRecordTypeMap = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _val = [];
      var _rid = parseInt(data.rid);

      data.tids_add && data.tids_add.length && data.tids_add.forEach(tid => {
        var _tid = parseInt(tid);
        _tid && _val.push({
          $rid: _rid,
          $tid: _tid
        })
      });

      if (_val.length) {
        var _sql = 'INSERT INTO recordTypeMap ( rid , tid ) VALUES( $rid , $tid );';
        await prepareSQL(data, _sql, _val);
      }

      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}

var delRecordTypeMap = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      var _conditions = [];
      data.tids_del && data.tids_del.length && data.tids_del.forEach(i => {
        _conditions.push('( rid=' + data.rid + ' AND tid=' + i + ' )');
      });

      data.del_tid && _conditions.push('( tid=' + data.del_tid + ' )');
      data.del_rid && _conditions.push('( rid=' + data.del_rid + ' )');

      if (_conditions.length) {
        var _sql = 'DELETE FROM recordTypeMap WHERE ' + _conditions.join(' OR ');
        await allSQL(data, _sql);
      }
      resolve(data);

    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
}
exports.delRecordTypeMap = delRecordTypeMap;

exports.setRecordTypeMap = function(data) {
  return new Promise(async(resolve, reject) => {
    try {
      await addRecordTypeMap(data);
      await delRecordTypeMap(data);
      resolve(data);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};


//********************************************
// User *************************************

exports.getUser = async function(data) {
  try {
    let _meta = data.meta;
    let _sql = 'SELECT * FROM user';
    let _conditions = [];
    _meta.uid !== undefined && _conditions.push('uid=$uid');
    _meta.acc !== undefined && _conditions.push('account=$acc');

    if (_conditions.length) {
      _sql += ' WHERE ' + _conditions.join(' OR ');
    }
    const _data = await allSQL(data, _sql, { $uid: _meta.uid, $acc: _meta.acc });
    return data;
  } catch (e) {
    logger.error(e);
  }
};

exports.setUser = async function(data) {
  try {
    var _param = [];
    var _val = [];
    let _meta = data.meta;

    ['token', 'name', 'permission', 'status', 'mail', 'last_login_info', 'keep_login_info', 'breakpoint'].forEach(function(each) {
      if (_meta[each] !== undefined) {
        _param.push(each);
        _val.push(valHandler(_meta[each]));
      }
    });

    if (_meta.uid) {
      _val.push(_meta.uid);
      var _sql = 'UPDATE user SET ' + _param.map(function(e, n) {
        return e + ' = ? '
      }) + 'WHERE uid = ?;';
    } else {
      _meta.uid = Date.now();
      _param.unshift('uid');
      _val.unshift(_meta.uid);
      var _sql = 'INSERT INTO user (' + _param.join(',') + ') VALUES(' + _param.map(function() {
        return '?'
      }).join(',') + ');';
    }

    await prepareSQL(data, _sql, [_val]);
    data['resault'] = [{ uid: _meta.uid }];
    return data;
  } catch (e) {
    logger.error(e);
  }
};
