"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require('mssql');
class SQLHelper {
    CheckConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config) {
                try {
                    sql.close();
                    let pool = yield sql.connect(config);
                    let result1 = yield pool.request()
                        .query('select name from sys.databases');
                    sql.close();
                    return true;
                }
                catch (err) {
                    sql.close();
                    const remote = require('electron').remote;
                    const dialog = remote.dialog;
                    dialog.showErrorBox('Error conectando con SQL-Server', err.toString());
                    return false;
                }
            }
            return false;
        });
    }
    constructor() {
        ;
    }
    getDatabases(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config) {
                try {
                    sql.close();
                    let pool = yield sql.connect(config);
                    let result1 = yield pool.request()
                        .query('select name from sys.databases');
                    sql.close();
                    return result1;
                }
                catch (err) {
                    sql.close();
                    const remote = require('electron').remote;
                    const dialog = remote.dialog;
                    dialog.showErrorBox('Error conectando con SQL-Server', err.toString());
                    return null;
                }
            }
            return null;
        });
    }
    static RunScript(config, sqlScript) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config) {
                try {
                    let pool = yield sql.connect(config);
                    let result1 = yield pool.request()
                        .query(sqlScript);
                    sql.close();
                    return result1;
                }
                catch (err) {
                    sql.close();
                    throw err;
                }
            }
            return null;
        });
    }
    static batch(config, sqlScript, create, destroy) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config) {
                try {
                    if (create)
                        this.universalPool = yield sql.connect(config);
                    let result1 = yield this.universalPool.request()
                        .batch(sqlScript);
                    if (destroy)
                        sql.close();
                    return result1;
                }
                catch (err) {
                    sql.close();
                    throw err;
                }
            }
            return null;
        });
    }
    static CloseAll() {
        sql.close();
    }
}
exports.default = SQLHelper;
//# sourceMappingURL=sqlherper.js.map