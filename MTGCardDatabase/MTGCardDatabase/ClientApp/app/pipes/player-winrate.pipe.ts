import { Pipe, PipeTransform } from "@angular/core";
import { Player } from "../interfaces/interfaces";

@Pipe({
    name: "playersort"
})
export class PlayerSortPipe implements PipeTransform {
    transform(array: Player[]): Player[] {
        array.sort((a: Player, b: Player) => {
            if (a.bo3WinRate > b.bo3WinRate ) {
                return -1;
            } else if (a.bo3WinRate < b.bo3WinRate) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}