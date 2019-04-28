import { Pipe, PipeTransform } from "@angular/core";
import { DeckCard } from "../interfaces/interfaces";

@Pipe({
    name: "cmcsort"
})
export class CMCSortPipe implements PipeTransform {
    transform(array: DeckCard[]): DeckCard[] {
        array.sort((a: DeckCard, b: DeckCard) => {
            if (a.cmc == '0') {
                return 1;
            } else if (a.cmc < b.cmc || b.cmc == '0') {
                return -1;
            } else if (a.cmc > b.cmc) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}