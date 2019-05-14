import { Pipe, PipeTransform } from "@angular/core";
import { DeckTrackerRow } from "../interfaces/interfaces";

@Pipe({
    name: "trackerRowSort"
})
export class TrackerRowSortPipe implements PipeTransform {
    transform(array: DeckTrackerRow[]): DeckTrackerRow[] {
        array.sort((a: DeckTrackerRow, b: DeckTrackerRow) => {
            if (a.rowKey > b.rowKey) {
                return -1;
            } else if (a.rowKey < b.rowKey) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}