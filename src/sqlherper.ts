const sql = require('mssql');

    export default interface SQlConfig{
        user: string,
        password: string,
        server: string,
        database: string,
        options: {
            instanceName : string;
         },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
    export default class SQLHelper{  
             
        private static universalPool:any;
        public async CheckConnection(config:SQlConfig){
            if(config){               
                try {                
                    sql.close();
                    let pool = await sql.connect(config)
                    let result1 = await pool.request()                        
                        .query('select name from sys.databases') 
                    sql.close();
                        return true;
                } catch (err) {
                    sql.close();
                    const remote = require('electron').remote;
                    const dialog = remote.dialog;
                    dialog.showErrorBox('Error conectando con SQL-Server', err.toString());               
                    return false;
                }
            }
            return false;
        }
        constructor(){
            ;
        }

        public async getDatabases(config:SQlConfig){
            if(config){               
                try {                
                    sql.close();
                    let pool = await sql.connect(config)
                    let result1 = await pool.request()                        
                        .query('select name from sys.databases') 
                    sql.close();
                    return result1;
                } catch (err) {
                    sql.close();
                    const remote = require('electron').remote;
                    const dialog = remote.dialog;
                    dialog.showErrorBox('Error conectando con SQL-Server', err.toString());               
                    return null;
                }
            }
            return null;
        }
        public static async RunScript(config:SQlConfig,sqlScript:string){
            if(config){               
                try {                
                   
                    let pool = await sql.connect(config)
                    let result1 = await pool.request()                        
                        .query(sqlScript) 
                    sql.close();
                    return result1;
                } catch (err) {
                    sql.close();                   
                    throw  err;  
                }
            }
            return null;
        }
        public static async batch(config:SQlConfig,sqlScript:string, create:boolean, destroy:boolean){
            if(config){               
                try {                
                    if(create)
                        this.universalPool = await sql.connect(config)
                    let result1 = await this.universalPool.request()                        
                        .batch(sqlScript) 
                        if(destroy)
                            sql.close();
                    return result1;
                } catch (err) {
                    sql.close();                   
                    throw  err;  
                }
            }
            return null;
        }
        public static CloseAll(){
            sql.close();
        }
    }
