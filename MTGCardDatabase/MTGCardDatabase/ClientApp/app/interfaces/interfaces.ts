export { Card, ScryfallCard, Deck, DeckTrackerRow, Player };

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
    colors: string[];
    mainDeck: Card[];
    sideBoard: Card[];
}

interface Player {
    name: string;
}

// Other versions 
//    From Counter.ts
//interface Card {
//    PartitionKey: string;
//    RowKey: string;
//    name: string;
//    set: string;
//    colors: string[];
//    rarity: string;
//    mana_cost: string;
//    added: boolean;
//    power: string;
//    type_line: string;
//    color_identity: string;
//    toughness: string;
//    image_small: string;
//    card_text: string;
//    flavor_text: string;
//    numberInCollection: number;
//    cmc: string;
//    image_uris: any;
//    set_name: string;
//    oracle_text: string;
//    full_cost: string[];
//}

/// FetchData
//interface Card {
//    PartitionKey: string;
//    RowKey: string;
//    name: string;
//    set: string;
//    colors: string[];
//    color1: string;
//    color2: string;
//    rarity: string;
//    mana_cost: string;
//    added: boolean;
//    power: string;
//    type_line: string;
//    color_identity: string;
//    toughness: string;
//    image_small: string;
//    card_text: string;
//    flavor_text: string;
//    numberInCollection: number;
//    cmc: string;
//    image_uris: any;
//    set_name: string;
//    oracle_text: string;
//}

///  From collection
//interface Card {
//    partitionKey: string;
//    rowKey: string;
//    name: string;
//    set: string;
//    colors: string[];
//    rarity: string;
//    mana_Cost: string;
//    power: string;
//    type_Line: string;
//    color_Identity: string;
//    toughness: string;
//    image_Small: string;
//    card_Text: string;
//    flavor_Text: string;
//    numberInCollection: number;
//    cmc: string;
//    image_uris: any;
//    set_Name: string;
//    full_Cost: string[];
//}