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
}