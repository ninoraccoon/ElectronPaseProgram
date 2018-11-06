"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
const sqlherper_1 = require("./sqlherper");
const helper_1 = require("./helper");
const navigation_1 = require("./navigation");
class Validations {
    ValidateSteps(step, elment) {
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
    ValidateStep1(elment) {
        var sqlHelp = new sqlherper_1.default();
        var res = true;
        var instance = '';
        var svr = $('.input-server').val();
        if (svr.search('/') > 0)
            instance = svr.substr(svr.search('/') + 1);
        var db = 'master';
        var user = $('.input-user').val();
        var pass = $('.input-password').val();
        var config = {
            database: db,
            password: pass,
            user: user,
            server: svr,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options: {
                instanceName: instance
            }
        };
        helper_1.default.RenderBtonLoading($('#next-step1'), true, 'next-step1');
        sqlHelp.CheckConnection(config).then((result) => {
            helper_1.default.RenderBtonLoading($('#next-step1'), false, 'next-step1');
            if (result) {
                new helper_1.default().SetSqlConfig(config);
                new helper_1.default().loadandRenderCombosDB($('.ccosto-db'), $('.ccont-db'), elment);
            }
        }).catch(reason => {
            helper_1.default.RenderBtonLoading($('#next-step1'), false, 'next-step1');
            res = false;
        });
        return res;
    }
    ValidateStep2(elment) {
        var dbccost = $('.ccosto-db').val();
        var dbcont = $('.ccont-db').val();
        if (dbccost && dbcont && (dbccost != dbcont)) {
            var helper = new helper_1.default();
            helper.setCContdb(dbcont);
            helper.setCCostDb(dbccost);
            $('#bd-label').text(helper.GetSqlConfig().server);
            $('#ccost-label').text(helper.getCCostDb());
            $('#ccont-label').text(helper.getCContdb());
            navigation_1.Navigation.handleSectionTrigger(elment);
            navigation_1.Navigation.manageSideLinks(3);
            navigation_1.Navigation.SetActiveStep(3);
            return true;
        }
        else {
            helper_1.default.ErrorMessage("Seleccion CCost/CCont", "Selecione la Bd CCost y CCont, estan deben se diferentes");
            return false;
        }
    }
    ValidateStep3(elment) {
        navigation_1.Navigation.handleSectionTrigger(elment);
        navigation_1.Navigation.manageSideLinks(4);
        navigation_1.Navigation.SetActiveStep(4);
        return true;
    }
    ValidateStep4(elment) {
        var helper = new helper_1.default();
        if ("Ejecutar" == $('#ejectB').text()) {
            helper.StarExecution();
        }
        if ("Siguiente" == $('#ejectB').text()) {
            navigation_1.Navigation.handleSectionTrigger(elment);
            navigation_1.Navigation.manageSideLinks(5);
            navigation_1.Navigation.SetActiveStep(5);
        }
        return true;
    }
    constructor() { ; }
}
exports.default = Validations;
//# sourceMappingURL=validations.js.map