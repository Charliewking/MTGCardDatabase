import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'cardRarityFilter' })
@Injectable()

export class CardRarityPipe implements PipeTransform {

    transform(value: any, input: string) {
        if (input) {
            return value.filter(function(el: any) {
                return (el.rarity == input);
            })
        }
        return value;
    }
}