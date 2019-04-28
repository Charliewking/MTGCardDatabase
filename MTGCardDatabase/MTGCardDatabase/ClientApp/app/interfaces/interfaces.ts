export { Card, ScryfallCard, Deck, DeckTrackerRow, Player, DeckCard };

interface Card {
    name: string;
    set_Short: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    rarity: string;
    mana_Cost: string;
    power: string;
    type_Line: string;
    toughness: string;
    loyalty: string;
    card_Text: string;
    flavor_Text: string;
    numberInCollection: number;
    cmc: string;
    set_Name: string;
    full_Cost: string[];
    image_Small: any;
    image_Normal: any;
    image_Large: any;
    price: string;
}


interface ScryfallCard {
    name: string;
    set: string;
    colors: string[];
    rarity: string;
    mana_cost: string;
    added: boolean;
    power: string;
    type_line: string;
    color_identity: string;
    toughness: string;
    loyalty: string;
    image_small: string;
    card_text: string;
    flavor_text: string;
    numberInCollection: number;
    cmc: string;
    image_uris: any;
    set_name: string;
    oracle_text: string;
    card_faces: CardFace[];
    usd: string;
}

interface CardFace {
    oracle_text: string;
}

interface DeckTrackerRow {
    owner: string;
    deckName: string;
    playedAgainst: string;
    format: string;
    result: string;
    notes: string;
}

interface Deck {
    owner: string;
    name: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    mainDeck: DeckCard[];
    sideBoard: DeckCard[];
    constructed: boolean;
    landCards: number;
    creatureCount: number;
    sorceryCount: number;
    instantCount: number;
    enchantmentCount: number;

}

interface DeckCard {
    cardName: string;
    cardSet: string;
    deckName: string;
    mana_Cost: string;
    numberInDeck: number;
    numberInSideboard: number;
    owner: string;
    countLimited: boolean;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    type_Line: string;
    power: string;
    toughness: string;
    loyalty: string;
    card_Text: string;
    flavor_Text: string;
    numberInCollection: number;
    cmc: string;
    set_Name: string;
    full_Cost: string[];
    image_Small: any;
    image_Normal: any;
    image_Large: any;
    price: string;
}

interface Player {
    name: string;
}