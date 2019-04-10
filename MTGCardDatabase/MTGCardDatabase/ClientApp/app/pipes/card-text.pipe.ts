import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'cardTextFilter' })
@Injectable()

export class CardTextPipe implements PipeTransform {

    transform(value: any, input: string) {
        if (input) {
            input = input.toLowerCase();
            return value.filter(function (el: any) {
                return el.card_Text.toLowerCase().indexOf(input) > -1 || el.name.toLowerCase().indexOf(input) > -1 || el.type_Line.toLowerCase().indexOf(input) > -1;
            })
        }
        //if (input) {
        //    input = input.toLowerCase();
        //    return value.filter(function (el: any) {
        //        return el.name.toLowerCase().indexOf(input) > -1;
        //    })
        //}
        return value;
    }
}