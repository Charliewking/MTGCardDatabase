import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'cardNameFilter' })
@Injectable()

export class CardNamePipe implements PipeTransform {
    //transform(cards: any[], args: any[]): any {
    //    return cards.filter(card => card.rowkey.toLowerCase().indexOf(args[0].toLowerCase()) !== -1);
    //}


    //public transform(value: string, keys: string, term: string) {

    //    if (!term) return value;
    //    return (value || []).filter(item => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));

    //}

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