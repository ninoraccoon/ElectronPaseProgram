const settings = require('electron-settings');
const fs = require('fs')
const path = require('path')
import SQLHelper from './sqlherper'
import SQlConfig from './sqlherper'
import Tarea from './tarea'
import {Navigation} from './navigation'

var $ = require("jquery");

export default class Helper{
    public static  actualstep = "activeStep";
    public static  sqlConfig = "sqlconf";
    public static  CCostDb = "ccostdb";
    public static  CContdb = "ccontDb";
    public static remote = require('electron').remote;
    constructor(){}

    public RenderDBCombo(rawDb:any, value:string=null):string{
        var html = "";
        var selected = "";

        rawDb.recordset.forEach((element:any) => {
            if(value && value == element.name)
                selected = 'selected="selected"'
            else
                selected = '';
            html+= `<option ${selected}>${element.name}</optinon>`;
        });
        return html;
    }
    public RenderDBComboFull(rawDb:any, ccostElm:any, ccontElm:any){
        //generadno ccost
        var optCCost = this.RenderDBCombo(rawDb,this.getCCostDb());
        var optCCont = this.RenderDBCombo(rawDb,this.getCContdb());
        ccostElm.html(optCCost);
        ccontElm.html(optCCont);

    }
    public loadandRenderCombosDB(combo1:any, combo2:any, element:Element=null){
        var sqlHelp = new SQLHelper();
        //cargamos las Bd
        sqlHelp.getDatabases(this.GetSqlConfig()).then((resut1)=>{
        new Helper().RenderDBComboFull(resut1,combo1, combo2);
        //pasando pagina
        if(element){
            Navigation.handleSectionTrigger(element);
            Navigation.manageSideLinks(2);
            Navigation.SetActiveStep(2);
        }
        }).catch(reason1=>{});    
    }
    
    public SetSqlConfig(config:SQlConfig){
        settings.set(Helper.sqlConfig,config);
    }
    public GetSqlConfig():SQlConfig{
        return settings.get(Helper.sqlConfig);
    }
    public setActualStep(step:any){
        settings.set(Helper.actualstep,step);
    }
    public getActualStep(){
        return settings.get(Helper.actualstep);
    }
    public setCCostDb(step:any){
        settings.set(Helper.CCostDb,step);
    }
    public getCCostDb(){
        return settings.get(Helper.CCostDb);
    }
    public setCContdb(step:any){
        settings.set(Helper.CContdb,step);
    }
    public getCContdb(){
        return settings.get(Helper.CContdb);
    }
    public static ErrorMessage(title:string, text:string){       
        const dialog = this.remote.dialog;
        dialog.showErrorBox(title, text); 
    }
    //Ejecucion redered tasks
    public renderExutionProcessTask(index:number, status:boolean, endAllTask: boolean, error:string=null){ 
        if(status){
            $(`#task-${index} td div .progress-bar`).addClass('progress-bar-striped progress-bar-animated');
            $(`#task-${index} td div .progress-bar`).removeClass('bg-warning');
            $(`#task-${index} td div .progress-bar`).addClass('bg-info');
            $(`#task-${index} td div .progress-bar`).text('Ejec...');
            $('#ejectB').text('Ejecutando...');
            Helper.RenderBtonLoading($('#ejectB'), true, 'ejectB');
        }else{
            $(`#task-${index} td div .progress-bar`).removeClass('progress-bar-striped progress-bar-animated');               
            $(`#task-${index} td div .progress-bar`).removeClass('bg-info');
            
            $(`#task-${index} td div .progress-bar`).text('');
            $(`#task-${index} td div .progress-bar`).addClass('bg-success');
            $(`#task-${index} td div .progress-bar`).text('Listo');
        }
        if(endAllTask){
            Helper.RenderBtonLoading($('#ejectB'), false, 'ejectB');
            $('#ejectB').text('Siguiente');  
        }
    }
    //resive un orden de script y los va ejecutando
    public RunTaskExectuteFileScriptOnChange(claveName:string, task:number
        , isEndofAllTask:boolean,first:boolean=false){

        var todoList = (settings.get(claveName) as Array<Tarea>);
        var fullpath = path.join(__dirname, 'sqlStuff',todoList[0].sqlfile);
        var codtext = fs.readFileSync(fullpath).toString();
        console.log(codtext);
        if(first)
            this.renderExutionProcessTask(task,true,false);
            //configuracion
        var config = this.GetSqlConfig();
       
        config.database=todoList[0].db;
        codtext = this.procesingScriptFile(codtext);
        

        SQLHelper.RunScript(config,codtext).then(result=>{            
            var todoList1 = (settings.get(claveName) as Array<string>);
            todoList1 = todoList1.slice(1);
            settings.set(claveName ,todoList1);
            if(todoList1.length>0){
                this.RunTaskExectuteFileScriptOnChange(claveName,1,true);
            }
            else{
                SQLHelper.CloseAll();
                this.renderExutionProcessTask(task,false,isEndofAllTask);
                this.StarExecution(null,task + 1)
            }           
        }).catch(reason=>{
            console.log(reason);
            this.renderExutionProcessTask(task,false,isEndofAllTask,reason);            
        });
    }
    public static RenderBtonLoading(element:any, act:boolean, id:string=null){       
        if(act)
            element.html(element.html() + `<i id="${id+ '-loading'}" class="fa fa-spinner fa-spin"></i>`);
        else
            $('#' + id + '-loading').remove();

    }
    public StarExecution(todoList:Tarea[]=null, taskorder:number = null){
        //leyendo tareas
        if(todoList == null)
            var todoList = this.parseTodoList();
        if(taskorder == null)
            taskorder = 1;

       
        if(todoList){
            var filtered =  todoList.filter(value=>{
                if(value.ordenTarea == taskorder)
                    return value;
            });
           
           
            if(filtered !=null && filtered.length>0){
                if(todoList.filter(value=>{
                    if(value.subOrden <= 0)
                        return value;
                }).length == filtered.length){
                    //aca detectamos una tarea simultanea donde todas este con suborden negativo
                    filtered.forEach(valSim=>{
                        settings.set('tarea' + (valSim.subOrden*-1 + todoList.length + taskorder).toString(), valSim);
                        this.RunTaskExectuteFileScriptOnChange((valSim.subOrden*-1 + todoList.length + taskorder).toString(),taskorder + (valSim.subOrden * -1),false,true);
                    });
                }else{
                    settings.set('tarea' + taskorder.toString(), filtered);
                    this.RunTaskExectuteFileScriptOnChange('tarea' + taskorder.toString(),taskorder,false,true);
                }
               
            }else{
                this.renderExutionProcessTask(taskorder-1,false,true);
            }
           
        }
    }
    public parseTodoList(){
        var todoArray = Array<Tarea>();
        var fullpath = path.join(__dirname, 'sqlStuff','todoList.xml');
        var xmlTodo = fs.readFileSync(fullpath, {encoding: 'utf-8'}).toString();
        var xml = $.parseXML(xmlTodo);
        var elemnts = $(xml).find('row');
        for (let index = 0; index < elemnts.length; index++) {
            const element = elemnts[index];
            var tarea = <Tarea>{
                db: $(element).find('db').text(),
                nombre : $(element).find('tname').text(),
                ordenTarea: $(element).find('orden').text(),
                subOrden: $(element).find('suborden').text(),
                sqlfile: $(element).find('sqlfile').text(),
            };
            todoArray.push(tarea);
            
        }
        return todoArray;
    }
    public procesingScriptFile(codetext:string){
        return codetext;

    }
}