﻿import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { CardTextPipe } from '../../pipes/card-text.pipe';
import { HttpCardService } from '../../services/http-service';
import { ScryfallService } from '../../services/scryfall.service';
import { Card, PreviewCard } from '../../interfaces/interfaces';

@Component({
    selector: 'preview',
    templateUrl: './preview.component.html',
    providers: [HttpCardService, ScryfallService]
})
export class PreviewComponent {
    public queryString: string = '';
    public setQuery: string = '';
    public cards: Card[] = [];

    public strings = {
        host1: '@_Ironstream',
        host2: '@ParticleBit',
        comment1: '',
        comment2: '',
        rating1: '1',
        rating2: '2',
        totalScore: '',
        previewCardURI: '',
        previewCardName: '',
        rarityString: '',
        setName: 'eld',
        errorText: "Not enough to search on",
    }

    public previewCards: PreviewCard[] = [];
    public nextPage: string = '';

    public _httpCardService: HttpCardService;
    public _scryfallService: ScryfallService;

    constructor(private httpCardService: HttpCardService, private scryfallService: ScryfallService) {
        this._httpCardService = httpCardService;
        this._scryfallService = scryfallService;
    }

    ngOnInit() {
        // call some function that gets either a cache or new cards if no cache
        // this._scryfallService.getCard("Nicol Bolas, Dragon God");
        this._httpCardService.getPreviewCards(this.strings.setName);
    }

    getCard(name: string) {
        this._scryfallService.getCard(name);
        this.strings.previewCardName = this._scryfallService.returnCards[0].name
        this.strings.previewCardURI = this._scryfallService.returnCards[0].image_Normal
        this.strings.rating1 = '';
        this.strings.rating2 = '';
    }

    setMPScore() {

    }
    setISScore() {

    }

    setPreviewCard(previewCard: PreviewCard) {
        this.strings.previewCardName = previewCard.name;
        this.strings.rating1 = previewCard.rating1;
        this.strings.rating2 = previewCard.rating2;
        this.strings.previewCardURI = previewCard.image_Normal;
        this.strings.comment1 = previewCard.comment1;
        this.strings.comment2 = previewCard.comment2;
    }

    getSet(set: string) {
        let jsonReturnData: PreviewCard[] = [];
        let jsonReturnData2: PreviewCard[] = [];
        this._scryfallService.getSet(set).subscribe(result => {
            this.nextPage = (result.json()).next_page;
            jsonReturnData = (result.json()).data;
            if (this.nextPage) {   
                this._scryfallService.getNewPage(this.nextPage).subscribe(result => {
                    jsonReturnData2 = (result.json()).data;
                    this.previewCards = jsonReturnData.concat(jsonReturnData2);
                });
            } else {
                this.previewCards = jsonReturnData;
            }
        });
        //this._scryfallService.getNewPage(this.nextPage).subscribe(result => {
        //    jsonReturnData.concat((result.json()).data);
        //});

        //this.cards = jsonReturnData;
    }

    intialPreviewCardSet(setName: string) {
        this.getSet(setName)
        this.previewCards.forEach((previewCard: PreviewCard) => {
            previewCard.color1 = previewCard.colors[0] || '';
            previewCard.color2 = previewCard.colors[1] || '';
            if (previewCard.image_uris.normal) {
                previewCard.image_Normal = previewCard.image_uris.normal;
            } else if (previewCard.image_uris.large) {
                previewCard.image_Normal = previewCard.image_uris.large;
            } else if (previewCard.image_uris.small) {
                previewCard.image_Normal = previewCard.image_uris.small;
            }
            this._httpCardService.addPreviewCard(previewCard);
        });
    }
}
