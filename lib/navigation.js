"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//importando la clase de validaciones...
const validations_1 = require("./validations");
const helper_1 = require("./helper");
var $ = require("jquery");
const settings = require('electron-settings');
var Navigation;
(function (Navigation) {
    function init() {
        var activeStep = settings.get('activeStep');
        //primer uso
        if (activeStep == null) {
            activeStep = 1;
            settings.set('activeStep', 1);
        }
        manageSideLinks(activeStep);
        //botones click
        document.querySelectorAll('.control-btn').forEach(val => {
            val.addEventListener('click', (event) => {
                buttonTratament(event);
            });
        });
        initiacilateControls();
    }
    Navigation.init = init;
    function initiacilateControls() {
        var helper = new helper_1.default();
        var config = helper.GetSqlConfig();
        console.log(config);
        $('.input-server').val(config.server + (config.options.instanceName && config.options.instanceName.trim() != '' ? '/' + config.options.instanceName : ''));
        $('.input-user').val(config.user);
        $('.input-password').val(config.password);
        helper.loadandRenderCombosDB($('.ccosto-db'), $('.ccont-db'));
        $('#bd-label').text(config.server);
        $('#ccost-label').text(helper.getCCostDb());
        $('#ccont-label').text(helper.getCContdb());
    }
    function buttonTratament(event) {
        var activestep = event.target.dataset.step;
        switch (activestep) {
            case "1":
                handleSectionTrigger(document.getElementById('button-conf_sql'));
                manageSideLinks(activestep);
                settings.set('activeStep', activestep);
                break;
            case "2":
                new validations_1.default().ValidateSteps(1, document.getElementById('button-conf_ccs_ccn'));
                break;
            case "3":
                new validations_1.default().ValidateSteps(2, document.getElementById('button-menus'));
                break;
            case "4":
                new validations_1.default().ValidateSteps(3, document.getElementById('button-shortcuts'));
                break;
            case "5":
                new validations_1.default().ValidateSteps(4, document.getElementById('button-resultado'));
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
    function manageSideLinks(step) {
        document.querySelectorAll('.step-nav').forEach(val => {
            if (val.dataset.step > step)
                val.setAttribute('style', 'pointer-events:none;');
            else
                val.setAttribute('style', 'pointer-events:all;');
        });
    }
    Navigation.manageSideLinks = manageSideLinks;
    function SetActiveStep(valor) {
        settings.set('activeStep', valor);
    }
    Navigation.SetActiveStep = SetActiveStep;
    function handleSectionTrigger(target) {
        hideAllSectionsAndDeselectButtons();
        // Highlight clicked button and show view
        target.classList.add('is-selected');
        // Display the current section
        const sectionId = `${target.dataset.section}-section`;
        document.getElementById(sectionId).classList.add('is-shown');
        // Save currently active button in localStorage
        const buttonId = target.getAttribute('id');
        const step = target.step;
        settings.set('activeSectionButtonId', buttonId);
        settings.set('activeStep', step);
    }
    Navigation.handleSectionTrigger = handleSectionTrigger;
    function hideAllSectionsAndDeselectButtons() {
        var sections = document.querySelectorAll('.js-section.is-shown');
        sections.forEach(section => {
            section.classList.remove('is-shown');
        });
        const buttons = document.querySelectorAll('.nav-button.is-selected');
        buttons.forEach(button => {
            button.classList.remove('is-selected');
        });
    }
    init();
})(Navigation = exports.Navigation || (exports.Navigation = {}));
//# sourceMappingURL=navigation.js.map