import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";
import { Card, ScryfallCard } from '../interfaces/interfaces'

@Injectable()
export class ScryfallService {

    private _baseUrl = 'https://api.scryfall.com/cards/';

    public returnCards: Card[] = [];

    constructor(private http: Http) { }

    getCards(set: string) {
        return this.http.get(this._baseUrl + 'search?q=set:' + set);
    }

    getCard(name: string) {
        name = name.replace(' ', '+');
        this.http.get(this._baseUrl + "named?fuzzy=" + name).subscribe(result => {
            var card = result.json() as ScryfallCard;

            let cardData: Card = {
                set_Short: card.set,
                name: card.name,
                color1: card.colors[0] ? card.colors[0] : '',
                color2: card.colors[1] ? card.colors[1] : '',
                color3: card.colors[2] ? card.colors[2] : '',
                color4: card.colors[3] ? card.colors[3] : '',
                color5: card.colors[4] ? card.colors[4] : '',
                rarity: card.rarity,
                power: card.power,
                toughness: card.toughness,
                mana_Cost: card.mana_cost,
                loyalty: card.loyalty,
                cmc: card.cmc,
                image_Small: (card.image_uris).small,
                image_Normal: (card.image_uris).normal,
                image_Large: (card.image_uris).large,
                card_Text: card.oracle_text,
                flavor_Text: card.flavor_text,
                type_Line: card.type_line,
                set_Name: card.set_name,
                full_Cost: [],
                numberInCollection: 1
            };

            if (cardData.name.includes("//")) {
                cardData.card_Text = card.card_faces[0].oracle_text + " // " + card.card_faces[1].oracle_text
            }

            cardData.mana_Cost = cardData.mana_Cost.substr(1, (cardData.mana_Cost.length - 2));
            cardData.full_Cost = cardData.mana_Cost.split("}{");

            this.returnCards[0] = cardData;
        },
        error => {
            return (error.json()).details;
        });
    }

    getNewPage(url: string) {
        return this.http.get(url);
    }

    addCard(_name: string, _set: string, _color1: string, _color2: string, _rarity: string, _convertedCost: string, _numberInCollection: number) {

        var cardData = {
            PartitionKey: _set,
            RowKey: _name,
            cardName: _name,
            color1: _color1,
            color2: _color1,
            rarity: _rarity,
            convertedCost: _convertedCost,
            numberInCollection: _numberInCollection
        };

        return this.http.post(this._baseUrl + 'api/cards/addCard', cardData)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }
}