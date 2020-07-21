module.exports = function(RED) {

    "use strict";
    var mapeamentoNode;

    function getVoltageDiffNode(config) {
        RED.nodes.createNode(this, config);
        this.mapeamento = config.mapeamento
        this.channel_number = config.channel_number
        this.AC_mode = config.AC_mode === "true" ? true : false,
        this.scale = config.scale
        this.compare_select = config.compare_select;
        // this.equalTo = config.equalTo;
        this.maxValue = config.maxValue;
        this.minValue = config.minValue;
        mapeamentoNode = RED.nodes.getNode(this.mapeamento);
        var node = this
        
        node.on('input', function(msg, send, done) {
            var _compare = {};
            // if (node.compare_select == "equalTo") {
            //     _compare = {
            //         voltage_value: {"==": (!isNaN(parseFloat(node.equalTo)))? parseFloat(node.equalTo):node.equalTo }
            //     }
            // }
            if (node.compare_select == "interval") {
                _compare = {
                    voltage: {">=": parseFloat(node.minValue), "<=": parseFloat(node.maxValue)}
                }
            }
            if (node.compare_select == "maxValue") {
                _compare = {
                    voltage: {">=": null, "<=": parseFloat(node.maxValue)}
                }
            }
            if (node.compare_select == "minValue") {
                _compare = {
                    voltage: {">=": parseFloat(node.minValue), "<=": null}
                }
            }

            var globalContext = node.context().global;
            var currentMode = globalContext.get("currentMode");
            var command = {
                type: "multimeter_modular_V1_0",
                slot: parseInt(mapeamentoNode.slot),
                method: "get_voltage_diff",
                couple_channel: parseInt(node.channel_number),
                AC_mode: node.AC_mode ,
                scale: parseFloat(node.scale),
                compare: _compare,
                get_output: {},
            }
            var file = globalContext.get("exportFile")
            var slot = globalContext.get("slot");
            if(!(slot === "begin" || slot === "end")){
                if(currentMode == "test"){
                    file.slots[slot].jig_test.push(command);
                }
                else{
                    file.slots[slot].jig_error.push(command);
                }
            }
            else{
                if(slot === "begin"){
                    file.slots[0].jig_test.push(command);
                    // file.begin.push(command);
                }
                else{
                    file.slots[3].jig_test.push(command);
                    // file.end.push(command);
                }
            }
            globalContext.set("exportFile", file);
            console.log(command)
            send(msg)
        });
    }
    RED.nodes.registerType("get-voltage-diff", getVoltageDiffNode);

    // RED.httpAdmin.get("/getVoltageDiff",function(req,res) {
    //     console.log(mapeamentoNode)
    //     if(mapeamentoNode){
    //         res.json([
    //             {value:mapeamentoNode.valuePort1, label: "A1 | B1 - " + mapeamentoNode.labelPort1, hasValue:false},
    //             {value:mapeamentoNode.valuePort2, label: "A2 | B2 - " + mapeamentoNode.labelPort2, hasValue:false},
    //             {value:mapeamentoNode.valuePort3, label: "A3 | B3 - " + mapeamentoNode.labelPort3, hasValue:false},
    //             {value:mapeamentoNode.valuePort4, label: "A4 | B4 - " + mapeamentoNode.labelPort4, hasValue:false},
    //             {value:mapeamentoNode.valuePort5, label: "A5 | B5 - " + mapeamentoNode.labelPort5, hasValue:false},
    //             {value:mapeamentoNode.valuePort6, label: "A6 | B6 - " + mapeamentoNode.labelPort6, hasValue:false},
    //             {value:mapeamentoNode.valuePort7, label: "A7 | B7 - " + mapeamentoNode.labelPort7, hasValue:false},
    //             {value:mapeamentoNode.valuePort8, label: "A8 | B8 - " + mapeamentoNode.labelPort8, hasValue:false},
    //             {value:mapeamentoNode.valuePort9, label: "A9 | B9 - " + mapeamentoNode.labelPort9, hasValue:false},
    //             {value:mapeamentoNode.valuePort10, label: "A10 | B10 - " + mapeamentoNode.labelPort10, hasValue:false},
    //             {value:mapeamentoNode.valuePort11, label: "A11 | B11 - " + mapeamentoNode.labelPort11, hasValue:false},
    //             {value:mapeamentoNode.valuePort12, label: "APW | BPW - " + mapeamentoNode.labelPort12, hasValue:false},
    //             {value:mapeamentoNode.valuePort13, label: "AMX | BMX - " + mapeamentoNode.labelPort13, hasValue:false},
    //         ])
    //     }
    //     else{
    //         res.json([
    //             {label:"A1 | B1 - ", value: "0", hasValue:false},
    //             {label:"A2 | B2 - ", value: "1", hasValue:false},
    //             {label:"A3 | B3 - ", value: "2", hasValue:false},
    //             {label:"A4 | B4 - ", value: "3", hasValue:false},
    //             {label:"A5 | B5 - ", value: "4", hasValue:false},
    //             {label:"A6 | B6 - ", value: "5", hasValue:false},
    //             {label:"A7 | B7 - ", value: "6", hasValue:false},
    //             {label:"A8 | B8 - ", value: "7", hasValue:false},
    //             {label:"A9 | B9 - ", value: "8", hasValue:false},
    //             {label:"A10 | B10 - ", value: "9", hasValue:false},
    //             {label:"A11 | B11 - ", value: "10", hasValue:false},
    //             {label:"APW | BPW - ", value: "11", hasValue:false},
    //             {label:"AMX | BMX - ", value: "12", hasValue:false},
    //         ])
    //     }
    // });
}