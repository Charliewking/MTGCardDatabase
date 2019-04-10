import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'cardNameFilter' })
@Injectable()

export class CardNamePipe implements PipeTransform {

    transform(value: any, input: string) {
        if (input) {
            input = input.toLowerCase();
            return value.filter(function (el: any) {
                return el.name.toLowerCase().indexOf(input) > -1;
            })
        }
        return value;
    }
}