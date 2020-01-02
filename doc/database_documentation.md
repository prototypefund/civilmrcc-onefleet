Database and Synchonization
===========================

The main part of the database handling is organised in the file src/utils/dbWrapper.js which is contains the function expression for dbWrapper, containing the databases object into which each database is pushed during initialization.


# Initialization
The initialization happens in the initDB() function. The function checks if a database with the name $db_name is defined already in {}databases, if that is not the case it defines two databases, a local pouch instance and a remote pouch instance, skipping the initial setup:

```
this.databases[db_name] = {
    local: new PouchDB(db_name, {skip_setup:false}),
    remote: new PouchDB(this.getDBURL()+config.db_prefix+db_name+'?include_docs=true&descending=true', {skip_setup:false}),   //initialize remote db, using prefix
}
```

... because thats what happens in the next step:

```
this.databases[db_name].local.replicate.from(this.databases[db_name].remote).on('complete', function (r,a,n) {
```

Afterwards the listening function for possible changes is initialised:
```
self.databases[db_name].remote.sync(db_name, {
   live: true,
   retry: true
}).on('change', function (change) {
  console.log('data ch change', change);


  //each database can contain multiple onchange listeners, defined by index n
  for(let n in self.databases[db_name].onChange){
    if(typeof(self.databases[db_name].onChange[n]) == 'function'){
      self.databases[db_name].onChange[n]();
   }
  }
})
```

(Written August 2019)


