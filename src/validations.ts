var $ = require("jquery");
import SQLHelper from './sqlherper'
import SQlConfig from './sqlherper'
import Helper from './helper'
import {Navigation} from './navigation'
export default class Validations{    
    public ValidateSteps(step:number, elment:Element):boolean{
        switch (step) {
            case 1:
                return this.ValidateStep1(elment); 
            case 2:
                return this.ValidateStep2(elment);     
                case 3:
                 return this.ValidateStep3(elment); 
            case 4: 
                return this.ValidateStep4(elment);           
        
            default:
                break;
        }
    }
    //$('.ccosto-db').options[$('.ccosto-db').selectedIndex].text
    private ValidateStep1(elment:Element):boolean{
        var sqlHelp = new SQLHelper();
        var res = true;
        var instance = '';
        var svr = $('.input-server').val();
        if((svr as string).search('/') > 0)
            instance = (svr as string).substr((svr as string).search('/')+1);
        var db = 'master';
        var user = $('.input-user').val();
        var pass = $('.input-password').val();
        var config = <SQlConfig>{
            database:db,
            password:pass,
            user:user,  
            server:svr,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options:{
                instanceName:instance
            }          
        };
      
        Helper.RenderBtonLoading($('#next-step1'),true,'next-step1');
        sqlHelp.CheckConnection(config).then((result)=>{
            Helper.RenderBtonLoading($('#next-step1'),false,'next-step1');
           if(result){
               new Helper().SetSqlConfig(config);
               new Helper().loadandRenderCombosDB($('.ccosto-db'),$('.ccont-db'),elment);                    
           }
        }).catch(reason=>{
            Helper.RenderBtonLoading($('#next-step1'),false,'next-step1');
            res= false;
        });
        return res;
    }
    private ValidateStep2(elment:Element):boolean{
        
        var dbccost = $('.ccosto-db').val();
        var dbcont = $('.ccont-db').val();

        if(dbccost && dbcont && (dbccost!=dbcont)){
                var helper = new Helper();
                helper.setCContdb(dbcont);
                helper.setCCostDb(dbccost);
                $('#bd-label').text(helper.GetSqlConfig().server);
                $('#ccost-label').text(helper.getCCostDb());
                $('#ccont-label').text(helper.getCContdb());
                Navigation.handleSectionTrigger(elment);
                Navigation.manageSideLinks(3);
                Navigation.SetActiveStep(3);
                return true;
        }else{
            Helper.ErrorMessage("Seleccion CCost/CCont","Selecione la Bd CCost y CCont, estan deben se diferentes");
            return false;
        }
    }
    private ValidateStep3(elment:Element):boolean{
        Navigation.handleSectionTrigger(elment);
        Navigation.manageSideLinks(4);
        Navigation.SetActiveStep(4);
       return true;
    }
    private ValidateStep4(elment:Element):boolean{
        var helper = new Helper();
        if("Ejecutar" == $('#ejectB').text()){
           helper.StarExecution();
        }
        if("Siguiente" == $('#ejectB').text()){
            Navigation.handleSectionTrigger(elment);
            Navigation.manageSideLinks(5);
            Navigation.SetActiveStep(5);
        }
        return true;
    }
    
    constructor(){;}

}