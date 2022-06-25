window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
if(!window.indexedDB) { window.alert("Your browser doesn't support a stable version of IndexedDB.") }

window.db = {

    con: null,

    open: (name,version) => {
        return new Promise((resolve,reject) => {
          var request = window.indexedDB.open(name,version);
          request.onerror = function(event) {
            console.log("error: ");
          };
          request.onsuccess = async function(event) {
            db.con = request.result;
            var tables = db.con.objectStoreNames;
            //console.log("db.open()", db.con,tables);
            resolve(tables);
          };
          request.onupgradeneeded = function(event) {
            console.log('onupgradeneeded', name);
            if(db.schema) {
                var keys = Object.keys(db.schema);
                var values = Object.values(db.schema);
                if(keys.length > 0) {

                  var k = 0; do {

                    var key = keys[k];
                    var value = values[k];
                    var keyPath = value.keyPath;

                    if(keyPath) {
                    var objectStore = event.target.result.createObjectStore(key, {keyPath});
                    console.log(37,{key,keyPath});
                    }

                    var indices = value.indices;
                    var i = 0; do {
                      var index = Object.keys(indices)[i]; console.log(42,{index},index.split(","));
                      var indice = index.split(",")[0];
                      var option = Object.values(indices)[i];
                      //console.log('indice', i, {index,indice,option},index.split(","));
                      objectStore.createIndex(index, indice, option);
                    i++; } while(i < Object.keys(indices).length);

                  k++; } while(k < keys.length);
                  //console.log({keyPath});
                  //objectStore.add(db.json.app[0]);

                }
            }
          };
        });
    },

    query: (tables,method) => {
        return db.con.transaction(tables,method);
    },

    create: {
      database: (name,version) => {
        return new Promise((resolve,reject) => {
          var request = window.indexedDB.open(name,version);
          request.onerror = function(event) {
            console.log("error: ");
          };
          request.onsuccess = async function(event) {
            db.con = request.result;
            var tables = db.con.objectStoreNames;
            console.log("success: ", db.con,tables);
            resolve(tables);
          };
          request.onupgradeneeded = function(event) {
            console.log('onupgradeneeded', db.schema.app);
            var keys = db.schema["app"];
            if(keys.length > 0) {
              var k = 0; do {
                var key = keys[k];
                console.log({key});
                if(k === 0) { var keyPath = key; }
                k++; } while(k < keys.length);
              console.log({keyPath});

              var objectStore = event.target.result.createObjectStore("app", {keyPath});
              objectStore.add(db.json.app[0]);
            }
          };
        });
      },
      row: function(table,json) {
        console.log('db.create.row',{},{table,json});
        return new Promise((resolve,reject) => {
            var request = db.query([table],"readwrite").objectStore(table).add(json);
            request.onsuccess = function (event) {
                resolve(event);
            };
            request.onerror = function (event) {
                reject(event);
            }
        });
      }
    },

    read: {
        databases: async() => {
            return await indexedDB.databases();
        },
        table: (table,key,where) => {
            //console.log('key',{table,key,where});
            return new Promise((resolve,reject) => {
               var returnData = [], cursorRequest;
               if(key) {
                var keys = Object.keys(key);
                var index = keys[0];
                var values = Object.values(key);
                var value = Object.values(key)[0];
                var k = keys.join(',');
                var v = values; //console.log(118,{table,k,values},{k,v});
                //alert(table + " : " + " { " + index + " : " + value + " } ");
                //alert(table + " : " + " { " + k + " : " + v + " } ");

                cursorRequest = db.con.transaction(table).objectStore(table).index(k).openCursor(IDBKeyRange.only(is.mobile() && v.length === 1 ? v[0] : v));
                //cursorRequest = db.con.transaction(table).objectStore(table).index(index).openCursor(IDBKeyRange.only(values);
               } else {
                cursorRequest = db.con.transaction([table], "readwrite").objectStore(table).openCursor(IDBKeyRange.lowerBound(0));
               }
               cursorRequest.onerror = window.indexedDB.onerror;
               cursorRequest.onsuccess = function(e) {
                  var cursor = e.target.result;
                  if(!!cursor == false) {
                    //console.log(131,{table,where,returnData});
                    resolve(returnData); return
                  }
                  var value = cursor.value;
                  if(where) {
                    var key = Object.keys(where)[0];
                    var vals = Object.values(where);
                    var val = vals[key];
                    var hasKey = value.hasOwnProperty(key);
                    var hasVal = value[key].includes(vals);                    
                    var exists = hasKey && hasVal;
                    if(exists) {
                      //alert(JSON.stringify(value));
                      returnData.push(value);
                    }
                  } else {
                    returnData.push(cursor.value);
                  }
                  cursor.continue();
               };
            });
        },
        row: (table,keys) => {
          return new Promise(async(resolve,reject) => {
              var transaction = db.con.transaction(table, 'readonly');
              var objectStore = transaction.objectStore(table);
              var index = Object.keys(keys)[0];
              var myIndex = objectStore.index(index);
              var value = Object.values(keys)[0];
              var getRequest = myIndex.get(value);
              //console.log({table,keys,index,value});
              getRequest.onsuccess = function() {
                resolve(getRequest.result);
              }
          });
        },
        store: (table,keys,range) => {
          return new Promise(async(resolve,reject) => {
            var store = db.con.transaction(table).objectStore(table);
            var index = store.index(Object.keys(keys)[0]);
            var value = Object.values(keys)[0]; console.log(value);
            var request = range ? index.openCursor(IDBKeyRange.only(value)) : index.get(IDBKeyRange.only(value));
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target);
          });
        }
    },

    update: {
      row: function(table,data) {
        return new Promise(async(resolve,reject) => {
            var k = Object.keys(data)[0];
            var v = Object.values(data)[0];
            var key = {};
            key[k] = v;
            var json = await db.read.row(table,key);
            json = json ? json : {};
            var i = 0; do {
              var key = Object.keys(data)[i];
              var value = Object.values(data)[i];
              //console.log('kv',{key,value},json);
              json[key] = value;
            i++; } while(i < Object.keys(data).length);
            var update = db.query([table],"readwrite").objectStore(table).put(json);
            update.onsuccess = function (event) { resolve(event); };
            update.onerror = function (event) { reject(event); }
        });
      }
    },

    delete: {
      row: (table,key) => {
        console.log(Object.keys(key), Object.values(key));
        return new Promise((resolve,reject) => {
            var transaction = db.con.transaction([table], "readwrite");
            var store = transaction.objectStore(table);
            var tagIndex = store.index(Object.keys(key));
            var remove = tagIndex.openKeyCursor(IDBKeyRange.only(Object.values(key))); //opens all records bearing the selected tag number
            remove.onsuccess = (e) => { console.log({remove});
                var cursor = remove.result;
                if(cursor) {
                    store.delete(cursor.primaryKey);
                    resolve("Deletion completed");
                    cursor.continue;
                }
            }
            remove.onerror = function(e) { console.log({e}); reject("Deletion attempt NG"); }
        });
      }
    }

};

function process(logic) {

    function calculate(a) {
        while (a.length > 2) {
            a.splice(0, 3, op[a[1]](a[0], a[2]));
        }
        return a[0];
    }

    var op = {
            '&&': function (a, b) { return a && b; },
            '||': function (a, b) { return a || b; }
        },
        array = [[]],
        level = 0;

    logic.forEach(function (a) {
        if (a === '(') {
            ++level;
            array[level] = [];
            return;
        }
        if (a === ')') {
            --level;
            array[level].push(calculate(array[level + 1]));
            return;
        }
        array[level].push(a);
    });
    return calculate(array[0]);
}
