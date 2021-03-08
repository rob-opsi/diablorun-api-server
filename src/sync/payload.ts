import { CharacterSnapshot } from '../collections/characters';

export interface AddedItem {
    GUID: number;
    Class: number;
    BaseItem: string;
    ItemName: string;
    Quality: string;
    Properties: string[];
    Location: {
        X: number;
        Y: number;
        Width: number;
        Height: number;
        BodyLocation: number;
        Container: number;
    };
}

export interface Payload {
    Headers: string;

    DIApplicationInfo: {
        Version: string;
    };

    Seed: number;
    SeedIsArg: boolean;
    IsExpansion?: boolean;
    IsHardcore?: boolean;
    NewCharacter?: boolean;

    Name: string;
    Guid: string;
    CharClass?: number;

    Area?: number;
    Difficulty?: number;
    PlayersX?: number;

    IsDead?: boolean;
    Deaths?: number;

    Level?: number;
    Experience?: number;
    Strength?: number;
    Dexterity?: number;
    Vitality?: number;
    Energy?: number;

    FireResist?: number;
    ColdResist?: number;
    LightningResist?: number;
    PoisonResist?: number;

    Gold?: number;
    GoldStash?: number;

    Life?: number;
    LifeMax?: number;
    Mana?: number;
    ManaMax?: number;

    FasterCastRate?: number;
    FasterHitRecovery?: number;
    FasterRunWalk?: number;
    IncreasedAttackSpeed?: number;
    MagicFind?: number;

    CompletedQuests?: {
        Normal: number[];
        Nightmare: number[];
        Hell: number[];
    }

    InventoryTab?: number;
    AddedItems?: AddedItem[];
    RemovedItems?: number[];

    Hireling?: {
        Name?: string;
        Class?: number;
        Level?: number;
        Experience?: number;
        Strength?: number;
        Dexterity?: number;
        FireResist?: number;
        ColdResist?: number;
        LightningResist?: number;
        PoisonResist?: number;
        SkillIds?: number[];

        Items?: AddedItem[];
        AddedItems?: AddedItem[];
        RemovedItems?: number[];
    }

    KilledMonsters?: {
        Class: number;
        TypeFlags: number;
        Type: number;
    }[];
}
