import { Component, Input } from '@angular/core';

@Component({
    selector: 'mana-cost',
    templateUrl: './manacost.component.html',
    styleUrls: ['./manacost.component.css']
})
export class ManaCostComponent {

    public cost: string = " ";

    @Input()
    mana: string = " ";

    public full_Cost: string[] = []

    ngOnInit() {
        if (this.mana) {
            if (this.mana[0] == "{") {
                this.mana = this.mana.substr(1, (this.mana.length - 2));
            }
            this.full_Cost = this.mana.split("}{");
        }
    }

    getPath(mana: string) {
        if (mana == null) {
            return 'grey'
        }
        if (mana == ' ') {
            return 'white'
        }
        else if (mana == 'R') {
            return this.redPath
        }
        else if (mana == 'U') {
            return this.bluePath
        }
        else if (mana == 'G') {
            return this.greenPath
        }
        else if (mana == 'W') {
            return this.whitePath
        }
        else if (mana == 'B') {
            return this.blackPath
        }
        else if (mana == 'B/R') {
            return this.rakdosPath
        }
        else if (mana == 'G/U') {
            return this.simicPath
        }
        else if (mana == 'U/B') {
            return this.dimirPath
        }
        else if (mana == 'W/U') {
            return this.azoriusPath
        }
        else if (mana == 'G/W') {
            return this.selesniyaPath
        }
        else if (mana == 'W/B') {
            return this.orhzovPath
        }
        else if (mana == 'R/W') {
            return this.borosPath
        }
        else if (mana == 'U/R') {
            return this.izzetPath
        }
        else if (mana == 'R/G') {
            return this.gruulPath
        }
        else if (mana == 'B/G') {
            return this.golgariPath
        }
        else {
            return this.circlePath
        }
    }

    isDigit(mana: string) {
        if (mana == "X") {
            return true;
        }
        return Number(mana);
    }

    public greenPath: string = require("../../assets/magic-mana-small/mana_g.png");
    public redPath: string = require("../../assets/magic-mana-small/mana_r.png");
    public bluePath: string = require("../../assets/magic-mana-small/mana_u.png");
    public blackPath: string = require("../../assets/magic-mana-small/mana_b.png");
    public whitePath: string = require("../../assets/magic-mana-small/mana_w.png");
    public circlePath: string = require("../../assets/magic-mana-small/mana_circle.png");
    public gruulPath: string = require("../../assets/magic-mana-small/mana_rg.png");
    public simicPath: string = require("../../assets/magic-mana-small/mana_gu.png");
    public golgariPath: string = require("../../assets/magic-mana-small/mana_bg.png");
    public selesniyaPath: string = require("../../assets/magic-mana-small/mana_gw.png");
    public izzetPath: string = require("../../assets/magic-mana-small/mana_ur.png");
    public rakdosPath: string = require("../../assets/magic-mana-small/mana_br.png");
    public borosPath: string = require("../../assets/magic-mana-small/mana_rw.png");
    public dimirPath: string = require("../../assets/magic-mana-small/mana_ub.png");
    public azoriusPath: string = require("../../assets/magic-mana-small/mana_wu.png");
    public orhzovPath: string = require("../../assets/magic-mana-small/mana_wb.png");
}