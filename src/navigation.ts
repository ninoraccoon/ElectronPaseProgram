//importando la clase de validaciones...
import Validations from "./validations";
import  Helper from "./helper";
var $ = require("jquery");

const settings = require('electron-settings');


export namespace Navigation{
    export function init(){      
        var activeStep = settings.get('activeStep');
        //primer uso
        if(activeStep == null){
            activeStep = 1;
            settings.set('activeStep',1); 
        }
        manageSideLinks(activeStep);
        //botones click
        document.querySelectorAll('.control-btn').forEach(val=>{
            val.addEventListener('click',(event)=>{
                buttonTratament(event);
            });
        });
        initiacilateControls();
    }
    function initiacilateControls(){
        var helper = new Helper();
        var config = helper.GetSqlConfig();
        console.log(config);
        $('.input-server').val(config.server + (config.options.instanceName && config.options.instanceName.trim()!=''?'/'+config.options.instanceName:''));
        $('.input-user').val(config.user);
        $('.input-password').val(config.password);
        helper.loadandRenderCombosDB($('.ccosto-db'),$('.ccont-db'));
        $('#bd-label').text(config.server);
        $('#ccost-label').text(helper.getCCostDb());
        $('#ccont-label').text(helper.getCContdb());
    }

    function buttonTratament(event:Event){
       
        var activestep = (event.target as any).dataset.step;        
        switch (activestep) {
            case "1":               
                    handleSectionTrigger(document.getElementById('button-conf_sql'));  
                    manageSideLinks(activestep);
                    settings.set('activeStep',activestep);         
            break;
            case "2":
                new Validations().ValidateSteps(1,document.getElementById('button-conf_ccs_ccn'));            
                break;
            case "3":
                new Validations().ValidateSteps(2,document.getElementById('button-menus'));
                break;   
            case "4":
                new Validations().ValidateSteps(3,document.getElementById('button-shortcuts'));
                break;  
            case "5":
                new Validations().ValidateSteps(4,document.getElementById('button-resultado')); 
                break;   
            case "-1":
                const remote = require('electron').remote;
                const app = remote.app;   
                app.quit();          
            break;        
            default:
                break;
        }        
    }

    export function manageSideLinks(step:number){
        document.querySelectorAll('.step-nav').forEach(val=>{           
            if((val as any).dataset.step > step)
                val.setAttribute('style','pointer-events:none;');
            else
                val.setAttribute('style','pointer-events:all;');
        });
    }
    export function SetActiveStep(valor:any){
        settings.set('activeStep',valor);
    }

    export function handleSectionTrigger (target:Element) {
        hideAllSectionsAndDeselectButtons();
      
        // Highlight clicked button and show view
        (target as any).classList.add('is-selected');
      
        // Display the current section
        const sectionId = `${  (target as any).dataset.section}-section`;
      
        document.getElementById(sectionId).classList.add('is-shown');
      
        // Save currently active button in localStorage
        const buttonId =   (target as any).getAttribute('id');
        const step = (target as any).step;
        settings.set('activeSectionButtonId', buttonId);
        settings.set('activeStep', step);
      }

      function hideAllSectionsAndDeselectButtons () {
        var sections = document.querySelectorAll('.js-section.is-shown');

        sections.forEach(section=>{
            (section as any).classList.remove('is-shown')
        });    
     
        const buttons = document.querySelectorAll('.nav-button.is-selected');
        buttons.forEach(button=>{
            button.classList.remove('is-selected')
        });
        
      }
      init();
}
