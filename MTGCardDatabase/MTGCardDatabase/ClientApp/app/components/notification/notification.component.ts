import { Component, Input } from '@angular/core';

@Component({
    selector: 'notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent {

    @Input()
    public alert: string = "";

    close() {
        this.alert = "";
    }
}