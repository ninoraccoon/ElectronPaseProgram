"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings = require('electron-settings');
const fs = require('fs');
const path = require('path');
const sqlherper_1 = require("./sqlherper");
const navigation_1 = require("./navigation");
var $ = require("jquery");
class Helper {
    constructor() { }
    RenderDBCombo(rawDb, value = null) {
        var html = "";
        var selected = "";
        rawDb.recordset.forEach((element) => {
            if (value && value == element.name)
                selected = 'selected="selected"';
            else
                selected = '';
            html += `<option ${selected}>${element.name}</optinon>`;
        });
        return html;
    }
    RenderDBComboFull(rawDb, ccostElm, ccontElm) {
        //generadno ccost
        var optCCost = this.RenderDBCombo(rawDb, this.getCCostDb());
        var optCCont = this.RenderDBCombo(rawDb, this.getCContdb());
        ccostElm.html(optCCost);
        ccontElm.html(optCCont);
    }
    loadandRenderCombosDB(combo1, combo2, element = null) {
        var sqlHelp = new sqlherper_1.default();
        //cargamos las Bd
        sqlHelp.getDatabases(this.GetSqlConfig()).then((resut1) => {
            new Helper().RenderDBComboFull(resut1, combo1, combo2);
            //pasando pagina
            if (element) {
                navigation_1.Navigation.handleSectionTrigger(element);
                navigation_1.Navigation.manageSideLinks(2);
                navigation_1.Navigation.SetActiveStep(2);
            }
        }).catch(reason1 => { });
    }
    SetSqlConfig(config) {
        settings.set(Helper.sqlConfig, config);
    }
    GetSqlConfig() {
        return settings.get(Helper.sqlConfig);
    }
    setActualStep(step) {
        settings.set(Helper.actualstep, step);
    }
    getActualStep() {
        return settings.get(Helper.actualstep);
    }
    setCCostDb(step) {
        settings.set(Helper.CCostDb, step);
    }
    getCCostDb() {
        return settings.get(Helper.CCostDb);
    }
    setCContdb(step) {
        settings.set(Helper.CContdb, step);
    }
    getCContdb() {
        return settings.get(Helper.CContdb);
    }
    static ErrorMessage(title, text) {
        const dialog = this.remote.dialog;
        dialog.showErrorBox(title, text);
    }
    //Ejecucion redered tasks
    renderExutionProcessTask(index, status, endAllTask, error = null) {
        if (status) {
            $(`#task-${index} td div .progress-bar`).addClass('progress-bar-striped progress-bar-animated');
            $(`#task-${index} td div .progress-bar`).removeClass('bg-warning');
            $(`#task-${index} td div .progress-bar`).addClass('bg-info');
            $(`#task-${index} td div .progress-bar`).text('Ejec...');
            $('#ejectB').text('Ejecutando...');
            Helper.RenderBtonLoading($('#ejectB'), true, 'ejectB');
        }
        else {
            $(`#task-${index} td div .progress-bar`).removeClass('progress-bar-striped progress-bar-animated');
            $(`#task-${index} td div .progress-bar`).removeClass('bg-info');
            $(`#task-${index} td div .progress-bar`).text('');
            $(`#task-${index} td div .progress-bar`).addClass('bg-success');
            $(`#task-${index} td div .progress-bar`).text('Listo');
        }
        if (endAllTask) {
            Helper.RenderBtonLoading($('#ejectB'), false, 'ejectB');
            $('#ejectB').text('Siguiente');
        }
    }
    //resive un orden de script y los va ejecutando
    RunTaskExectuteFileScriptOnChange(claveName, task, isEndofAllTask, first = false) {
        var todoList = settings.get(claveName);
        var fullpath = path.join(__dirname, 'sqlStuff', todoList[0].sqlfile);
        var codtext = fs.readFileSync(fullpath).toString();
        console.log(codtext);
        if (first)
            this.renderExutionProcessTask(task, true, false);
        //configuracion
        var config = this.GetSqlConfig();
        config.database = todoList[0].db;
        codtext = this.procesingScriptFile(codtext);
        sqlherper_1.default.RunScript(config, codtext).then(result => {
            var todoList1 = settings.get(claveName);
            todoList1 = todoList1.slice(1);
            settings.set(claveName, todoList1);
            if (todoList1.length > 0) {
                this.RunTaskExectuteFileScriptOnChange(claveName, 1, true);
            }
            else {
                sqlherper_1.default.CloseAll();
                this.renderExutionProcessTask(task, false, isEndofAllTask);
                this.StarExecution(null, task + 1);
            }
        }).catch(reason => {
            console.log(reason);
            this.renderExutionProcessTask(task, false, isEndofAllTask, reason);
        });
    }
    static RenderBtonLoading(element, act, id = null) {
        if (act)
            element.html(element.html() + `<i id="${id + '-loading'}" class="fa fa-spinner fa-spin"></i>`);
        else
            $('#' + id + '-loading').remove();
    }
    StarExecution(todoList = null, taskorder = null) {
        //leyendo tareas
        if (todoList == null)
            var todoList = this.parseTodoList();
        if (taskorder == null)
            taskorder = 1;
        if (todoList) {
            var filtered = todoList.filter(value => {
                if (value.ordenTarea == taskorder)
                    return value;
            });
            if (filtered != null && filtered.length > 0) {
                if (todoList.filter(value => {
                    if (value.subOrden <= 0)
                        return value;
                }).length == filtered.length) {
                    //aca detectamos una tarea simultanea donde todas este con suborden negativo
                    filtered.forEach(valSim => {
                        settings.set('tarea' + (valSim.subOrden * -1 + todoList.length + taskorder).toString(), valSim);
                        this.RunTaskExectuteFileScriptOnChange((valSim.subOrden * -1 + todoList.length + taskorder).toString(), taskorder + (valSim.subOrden * -1), false, true);
                    });
                }
                else {
                    settings.set('tarea' + taskorder.toString(), filtered);
                    this.RunTaskExectuteFileScriptOnChange('tarea' + taskorder.toString(), taskorder, false, true);
                }
            }
            else {
                this.renderExutionProcessTask(taskorder - 1, false, true);
            }
        }
    }
    parseTodoList() {
        var todoArray = Array();
        var fullpath = path.join(__dirname, 'sqlStuff', 'todoList.xml');
        var xmlTodo = fs.readFileSync(fullpath, { encoding: 'utf-8' }).toString();
        var xml = $.parseXML(xmlTodo);
        var elemnts = $(xml).find('row');
        for (let index = 0; index < elemnts.length; index++) {
            const element = elemnts[index];
            var tarea = {
                db: $(element).find('db').text(),
                nombre: $(element).find('tname').text(),
                ordenTarea: $(element).find('orden').text(),
                subOrden: $(element).find('suborden').text(),
                sqlfile: $(element).find('sqlfile').text(),
            };
            todoArray.push(tarea);
        }
        return todoArray;
    }
    procesingScriptFile(codetext) {
        return codetext;
    }
}
Helper.actualstep = "activeStep";
Helper.sqlConfig = "sqlconf";
Helper.CCostDb = "ccostdb";
Helper.CContdb = "ccontDb";
Helper.remote = require('electron').remote;
exports.default = Helper;
//# sourceMappingURL=helper.js.map