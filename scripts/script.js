//TODO xArray() uses platform endianness, cant force to little
//TODO aha! but dont force it to little in fact, you should do an endianness check and use accordingly
// but for now i will assume little endian
//TODO uint32 and int32 confusions?


//for any character
//  display enchants and resists
//  enchants
//  resists
//  name
//  gold
//  damage
//  stats
//  skills
//  inventory/items
//    names
//    enchants
//    bonuses
//    grade
//    sockets

//pets
//  display pets
//  add pets
//  remove pets but not pet0
//  edit pets
//how does this interact with histories?

//quests
//  display quests
//  complete?
//  remove? but you can do that in game
//  add? how would you do that?
//  edit a quest
//    change level
//    change what else...
//    ...?
//  ...fast unretire?
//  statues?
//how does this interact with histories?

//histories
//  remove histories
//  see whats in a history
//  ascend/descend x but can you only do that for the realm youre in?
//  force go to a floor? how does it work for games that eg dont have access to grove?
//interact with pets and quests?

//misc
//  difficulty; consider hash
//  respec; can also edit stats and skills but let them, however max once respec, option to undo respec? ability in stats/skills to allocate unused points?
//  unretire; interacts with fast retire?
//  WT <-> SG transfer
//  physically obstructed
//  cannot get quest item


///////////////////////////////////////////////////////////////////////////////////////////////////

const gameSelectOG = document.getElementById("OG");
const gameSelectUR = document.getElementById("UR");
const gameSelectTS = document.getElementById("TS");

let GAME = "OG";
document.getElementById(GAME).classList.add("gameSelect-selected");

gameSelectOG.addEventListener("click", clickGame); gameSelectOG.addEventListener("mouseover", hoverGame); gameSelectOG.addEventListener("mouseout", hoverGame);
gameSelectUR.addEventListener("click", clickGame); gameSelectUR.addEventListener("mouseover", hoverGame); gameSelectUR.addEventListener("mouseout", hoverGame);
gameSelectTS.addEventListener("click", clickGame); gameSelectTS.addEventListener("mouseover", hoverGame); gameSelectTS.addEventListener("mouseout", hoverGame);
function clickGame(ev)
{
	if (ev.target.id != GAME)
	{
		document.getElementById(GAME).classList.remove("gameSelect-selected");
		document.getElementById(GAME = ev.target.id).classList.add("gameSelect-selected")
	}
}
function hoverGame(ev)
{
	const classList = document.getElementById(ev.target.id).classList;
	if (ev.type == "mouseout")
		classList.remove("gameSelect-hover");
	else if (!classList.contains("gameSelect-selected"))
		classList.add("gameSelect-hover");
}

let DISTRIBUTION = "SG"
document.getElementById("distributionSelect").addEventListener("change", changeDistribution);
function changeDistribution(ev)
{
	DISTRIBUTION = ev.target.value;
}	

MONSTERS_DATS = [];
ITEMS_DATS = [];
SPELLS_DATS = [];

const ffdSelector = document.getElementById("ffdSelector");
const monstersSelector = document.getElementById("datSelect-monsters");
const clearMonstersDats = document.getElementById("clearMonstersDats");
const itemsSelector = document.getElementById("datSelect-items");
const clearItemsDats = document.getElementById("clearItemsDats");
const spellsSelector = document.getElementById("datSelect-spells");
const clearSpellsDats = document.getElementById("clearSpellsDats");

monstersSelector.addEventListener("input", accumulateFiles);
itemsSelector.addEventListener("input", accumulateFiles);
spellsSelector.addEventListener("input", accumulateFiles);
function accumulateFiles(ev)
{
	const pushTo = ev.target.id == "datSelect-monsters" ? MONSTERS_DATS :
		(ev.target.id == "datSelect-items" ? ITEMS_DATS : SPELLS_DATS);
	for (let i = 0; i < ev.target.files.length; ++i)
		pushTo.push(ev.target.files[i]);

	(ev.target.id == "datSelect-monsters" ?	clearMonstersDats :
		(ev.target.id == "datSelect-items" ? clearItemsDats : clearSpellsDats)).innerHTML = `Clear ${pushTo.length} file(s)`;
}

//TODO each runButton should clear any globals to an empty state
clearMonstersDats.addEventListener("click", clearFiles);
clearItemsDats.addEventListener("click", clearFiles);
clearSpellsDats.addEventListener("click", clearFiles);
function clearFiles(ev)
{
	if (ev.target.id == "clearMonstersDats")
	{
		MONSTERS_DATS = [];
		clearMonstersDats.innerHTML = "Clear 0 file(s)";
		monstersSelector.value = null;
	}
	else if (ev.target.id == "clearItemsDats")
	{
		ITEMS_DATS = [];
		clearItemsDats.innerHTML = "Clear 0 file(s)";
		itemsSelector.value = null;
	}
	else
	{
		SPELLS_DATS = [];
		clearSpellsDats.innerHTML = "Clear 0 file(s)";
		spellsSelector.value = null;
	}
}


const uploadScreen = document.getElementById("uploadScreen");

const runButton = document.getElementById("runButton");	
runButton.addEventListener("click", preRun);


MONSTERS_INFO = new Map();
ITEMS_INFO = new Map();
SPELLS_INFO = new Map();

//TODO this is og only
const EXPERIENCE_GATE =
[
	0, 847, 1424, 2379, 3946, 6498, 10623, 17241, 27779, 44432, 70546, 111183, 173930, 251775, 263013,
	294761, 337798, 380835, 423872, 466909, 509946, 552984, 596021, 659538, 725587, 791636, 857685,
	923734, 989782, 1055831, 1121880, 1208774, 1300717, 1392659, 1484602, 1576545, 1668488, 1760431,
	1871890, 1999642, 2127395, 2255147, 2382899, 2510652, 2638404, 2766156, 2893909, 3027737, 3198893,
	3370048, 3541204, 3712359, 3883514, 4054670, 4225825, 4396980, 4602433, 4834834, 5067234, 5299635,
	5532035, 5764436, 5996836, 6229237, 6487487, 6752000, 7016513, 7281026, 7545538, 7810051, 8074564,
	8339077, 8637166, 9050909, 9464652, 9878396, 10292139, 10705882, 11119625, 11533368, 11972685, 12412931,
	12853176, 13293421, 13733666, 14210761, 14754810, 15298858, 15842906, 16386955, 16966785, 17573608,
	18180431,18787255, 19462627, 20181825, 20901024, 21693940, 22528322, 24137891
];
const FAME_GATE = 
[
	0, 500, 1000, 2000, 4000, 8000, 12000, 20000, 36000, 68000, 100000, 164000,
	292000, 548000, 1188000, 3236000,7332000, 15524000, 23716000, 40100000, 40100000
];

//TODO all thisi is og only
const EFFECT_STRENGTH = 0;
const EFFECT_DEXTERITY = 1;
const EFFECT_VITALITY = 2;
const EFFECT_MAGIC = 3;
const EFFECT_MAX_MANA = 4;
const EFFECT_MAX_HP = 5;
const EFFECT_MAX_STAMINA = 6;
const EFFECT_MANA = 7;
const EFFECT_HP = 8;
const EFFECT_STAMINA = 9;
const EFFECT_ARMOR_BONUS = 10;
const EFFECT_TO_HIT_BONUS = 11;
const EFFECT_DAMAGE_BONUS = 12;
const EFFECT_DAMAGE_TAKEN = 13;
const EFFECT_KNOCKBACK = 14;
const EFFECT_SKILL_SWORD = 15;
const EFFECT_SKILL_CLUB = 16;
const EFFECT_SKILL_HAMMER = 17;
const EFFECT_SKILL_AXE = 18;
const EFFECT_SKILL_SPEAR = 19;
const EFFECT_SKILL_STAFF = 20;
const EFFECT_SKILL_POLEARM = 21;
const EFFECT_SKILL_BOW = 22;
const EFFECT_SKILL_CROSSBOW = 23;
const EFFECT_SKILL_THROWN = 24;
const EFFECT_SKILL_DUAL_WIELD = 25;
const EFFECT_SKILL_SHIELD = 26;
const EFFECT_SKILL_ATTACK_MAGIC = 27;
const EFFECT_SKILL_DEFENSE_MAGIC = 28;
const EFFECT_SKILL_CHARM_MAGIC = 29;
const EFFECT_PERCENT_STRENGTH = 30;
const EFFECT_PERCENT_DEXTERITY = 31;
const EFFECT_PERCENT_VITALITY = 32;
const EFFECT_PERCENT_MAGIC = 33;
const EFFECT_PERCENT_MANA = 34;
const EFFECT_PERCENT_H_P = 35;
const EFFECT_PERCENT_STAMINA = 36;
const EFFECT_PERCENT_SPEED = 37;
const EFFECT_PERCENT_ATTACK_SPEED = 38;
const EFFECT_PERCENT_ARMOR_BONUS = 39;
const EFFECT_PERCENT_TO_HIT_BONUS = 40;
const EFFECT_PERCENT_DAMAGE_BONUS = 41;
const EFFECT_PERCENT_DAMAGE_TAKEN = 42;
const EFFECT_PERCENT_MAGICAL_DROP = 43;
const EFFECT_PERCENT_GOLD_DROP = 44;
const EFFECT_PERCENT_CAST_SPEED = 45;
const EFFECT_PERCENT_LIFE_STOLEN = 46;
const EFFECT_PERCENT_MANA_STOLEN = 47;
const EFFECT_PERCENT_DAMAGE_REFLECTED = 48;
const EFFECT_PERCENT_BLOCK_CHANCE = 49;
const EFFECT_PERCENT_ITEM_REQUIREMENTS = 50;
const EFFECT_PERCENT_PIERCING_RESISTANCE = 51;
const EFFECT_PERCENT_SLASHING_RESISTANCE = 52;
const EFFECT_PERCENT_CRUSHING_RESISTANCE = 53;
const EFFECT_PERCENT_MAGICAL_RESISTANCE = 54;
const EFFECT_PERCENT_FIRE_RESISTANCE = 55;
const EFFECT_PERCENT_ICE_RESISTANCE = 56;
const EFFECT_PERCENT_ELECTRIC_RESISTANCE = 57;
const EFFECT_TYPES = 58;
const EFFECT_REMOVE = 59;
const EFFECT_KNOCKBACK_EFFECT = 60;
const EFFECT_IDENTIFY = 61;
const EFFECT_WRITE_SPELL = 62;
const EFFECT_SUMMON = 63;
const EFFECT_ADD_DAMAGE_TYPE = 64;
const EFFECT_TRANSFORM = 65;
const EFFECT_REVERT_TRANSFORM = 66;
const EFFECT_OPEN_PORTAL = 67;
const EFFECT_DISCOVER = 68;
const EFFECT_FLEE = 69;
const EFFECT_TURN_ALIGNMENT = 70;
const EFFECT_DISPEL = 71;
const EFFECT_DISPEL_ENEMY = 72;
const EFFECT_ALL_TYPES = 73;

const EFFECT_FLAT = 0;
const EFFECT_PERCENT = 1;
const EFFECT_FLAT_PERCENT = [
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_FLAT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT,
	EFFECT_PERCENT
];

const EFFECT_ITEM_POSITIVE_STRINGS = [
	"Strength Bonus",
	"Dexterity Bonus",
	"Vitality Bonus",
	"Magic Bonus",
	"Mana Bonus",
	"Life Bonus",
	"Stamina",
	"Mana Recovered",
	"HP Recovered",
	"Stamina Recovered",
	"Defense Bonus",
	"Attack Bonus",
	"Damage Dealt Bonus",
	"Damage Taken Reduced",
	"Knockback",
	"Sword Skill Bonus",
	"Club & Mace Skill Bonus",
	"Hammer Skill Bonus",
	"Axe Skill Bonus",
	"Spear Skill Bonus",
	"Staff Skill Bonus",
	"Polearm Skill Bonus",
	"Bow & Crossbow Skill Bonus",
	"Critical Strike Skill Bonus",
	"Spell Casting Skill Bonus",
	"Dual-Wielding Skill Bonus",
	"Shield Battle Skill Bonus",
	"Attack Magic Skill Bonus",
	"Defense Magic Skill Bonus",
	"Charm Magic Skill Bonus",
	"% Strength Bonus",
	"% Dexterity Bonus",
	"% Vitality Bonus",
	"% Magic Bonus",
	"% Mana Bonus",
	"% Life Bonus",
	"% Stamina Bonus",
	"% Movement Speed Bonus",
	"% Attack Speed Bonus",
	"% Defense Bonus",
	"% Attack Bonus",
	"% Damage Dealt Bonus",
	"% Damage Taken Reduced",
	"% Chance of Finding Magical Items",
	"% More Gold Dropped By Enemies",
	"% Faster Casting Speed",
	"% Life Stolen Per Hit",
	"% Mana Stolen Per Hit",
	"% Damage Reflected To Enemy",
	"% Improved Chance Of Block",
	"% Reduced Item Requirements",
	"% Piercing Resistance Bonus",
	"% Slashing Resistance Bonus",
	"% Crushing Resistance Bonus",
	"% Magical Resistance Bonus",
	"% Fire Resistance Bonus",
	"% Ice Resistance Bonus",
	"% Electric Resistance Bonus",
	"N/A",
	"Remove Effect",
	"Knockback Effect",
	"Identify Item",
	"Write Spell",
	"Summon Creature",
	"Add Elemental Damage",
	"Transform Creature",
	"Revert Transformation",
	"Opens Town Portal",
	"Discover Current Level",
	"Cause Target to Flee",
	"Charm Target",
	"Dispel Summoned Monster",
	"Dispel Summoned Enemy Monster"
];

const EFFECT_ITEM_NEGATIVE_STRINGS = [
	"Strength Penalty",
	"Dexterity Penalty",
	"Vitality Penalty",
	"Magic Penalty",
	"Mana Penalty",
	"Life Penalty",
	"Stamina Penalty",
	"Mana Drained",
	"HP Damage",
	"Stamina Drained",
	"Defense Penalty",
	"Attack Penalty",
	"Damage Dealt Penalty",
	"Damage Taken Increased",
	"Knockback",
	"Sword Skill Penalty",
	"Club & Mace Skill Penalty",
	"Hammer Skill Penalty",
	"Axe Skill Penalty",
	"Spear Skill Penalty",
	"Staff Skill Penalty",
	"Polearm Skill Penalty",
	"Bow & Crossbow Skill Penalty",
	"Critical Strike Skill Penalty",
	"Spell Casting Skill Penalty",
	"Dual-Wielding Skill Penalty",
	"Shield Battle Skill Penalty",
	"Attack Magic Skill Penalty",
	"Defense Magic Skill Penalty",
	"Charm Magic Skill Penalty",
	"% Strength Penalty",
	"% Dexterity Penalty",
	"% Vitality Penalty",
	"% Magic Penalty",
	"% Mana Penalty",
	"% Life Penalty",
	"% Stamina Penalty",
	"% Movement Speed Penalty",
	"% Attack Speed Penalty",
	"% Defense Penalty",
	"% Attack Penalty",
	"% Damage Dealt Penalty",
	"% Damage Taken Increased",
	"% Reduced Chance of Finding Magical Items",
	"% Less Gold Dropped By Enemies",
	"% Slower Casting Speed",
	"% Life Drained Per Hit",
	"% Mana Drained Per Hit",
	"% Damage Reflected To Enemy",
	"% Reduced Chance Of Block",
	"% Increased Item Requirements",
	"% Piercing Resistance Penalty",
	"% Slashing Resistance Penalty",
	"% Crushing Resistance Penalty",
	"% Magical Resistance Penalty",
	"% Fire Resistance Penalty",
	"% Ice Resistance Penalty",
	"% Electric Resistance Penalty",
	"N/A",
	"Remove Effect",
	"Knockback Effect",
	"Identify Item",
	"Write Spell",
	"Summon Creature",
	"Add Elemental Damage",
	"Transform Creature",
	"Revert Transformation",
	"Opens Town Portal",
	"Discover Current Level",
	"Cause Target to Flee",
	"Charm Target",
	"Dispel Summoned Monster",
	"Dispel Summoned Enemy Monster"
];

const IS_MAGIC = 
[
	true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false,
	false, false, false, false, false, false, false, false, false, false, false, false, false, false,
	true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, true, 
	false, false, false, true, false, false, false, false, false, false, false, false, false, false,
	false, false, false, false, false, false, false, false, false, false, false, false, false
];

const EFFECT_MAXIMUM =
[
	30, 30, 30, 30, 30, 30, 10, 10, 10, 30, 30, 30, 30, -10, 10, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
	20, 50, 50, 50, 50, 50, 50, 50, 30, 30, 50, 50, 50, -30, 30, 100, 20, 8, 10, 10, 10, 10, 30, 30, 30, 30, 30, 30, 30
];

const DAMAGE_PIERCING = 0;
const DAMAGE_SLASHING = 1;
const DAMAGE_CRUSHING = 2;
const DAMAGE_MAGICAL = 3;
const DAMAGE_FIRE = 4;
const DAMAGE_ICE = 5;
const DAMAGE_ELECTRIC = 6;
const DAMAGE_UNDEAD = 7;
const DAMAGE_TYPES = 8;

//TODO undead maps to fire; is this ever an issue?
const DAMAGE_TO_EFFECT = 
[
	EFFECT_PERCENT_PIERCING_RESISTANCE, EFFECT_PERCENT_SLASHING_RESISTANCE, EFFECT_PERCENT_CRUSHING_RESISTANCE, EFFECT_PERCENT_MAGICAL_RESISTANCE,
	EFFECT_PERCENT_FIRE_RESISTANCE, EFFECT_PERCENT_ICE_RESISTANCE, EFFECT_PERCENT_ELECTRIC_RESISTANCE, EFFECT_PERCENT_FIRE_RESISTANCE
];

const SKILLS_INT_STR = 
[
	"Sword", "Club & Mace", "Hammer", "Axe",
	"Spear", "Staff", "Polearm", "Bow & Crossbow",
	"Critical Strike", "Spell Casting", "Dual-Wielding", "Shield Battle",
	"Attack Magic", "Defense Magic", "Charm Magic"
];

const FAME_NAMES = [
	"Unknown",
	"Unknown",
	"Tolerated",
	"Unremarkable",
	"Respected",
	"Local Hero",
	"Local Legend",
	"Well Known",
	"Folk Hero",
	"Rising Star",
	"Distinguished",
	"Prestigious",
	"Famous",
	"Renowned",
	"Glorious",
	"Legendary",
	"Fabled",
	"Mythic",
	"Immortal",
	"Demigod",
	"Unattainable"
];

// const OG_EQUIP_SLOTS = 10;
//TODO OG only
const SLOT_HEAD = 0;
const SLOT_CHEST = 1;
const SLOT_LEFTHAND = 2;
const SLOT_RIGHTHAND = 3;
const SLOT_LEFTARM = 4;
const SLOT_GLOVES = 5;
const SLOT_NECK = 6;
const SLOT_FEET = 7;
const SLOT_LEFTFINGER = 8;
const SLOT_RIGHTFINGER = 9;
const SLOT_BELT = 10;
const SLOT_EQUIPMENT = 11;
const SLOT_QUICK1 = 12;
const SLOT_QUICK2 = 13;
const SLOT_QUICK3 = 14;
const SLOT_QUICK4 = 15;
const SLOT_QUICK5 = 16;
const SLOT_ALL = 17; //TODO is this even right

//TODO og only
const INV_SLOT_SIZE = 48;

//TODO OG only
const CATEGORY_BLANK      = 0;
const CATEGORY_GOLD       = 1;
const CATEGORY_ITEM       = 2;
const CATEGORY_CONTAINER  = 3;
const CATEGORY_WEAPON     = 4;
const CATEGORY_ARMOR      = 5;
const CATEGORY_JEWELRY    = 6;
const CATEGORY_EVENT      = 7;
const CATEGORY_ALL        = 8;

//TODO OG only
const TYPE_TO_CATEGORY = 
[
	CATEGORY_BLANK,
	CATEGORY_BLANK,
	CATEGORY_BLANK,
	CATEGORY_BLANK,
	CATEGORY_BLANK,
	CATEGORY_BLANK,
	CATEGORY_GOLD,
	CATEGORY_ITEM,
	CATEGORY_ITEM,
	CATEGORY_CONTAINER,
	CATEGORY_CONTAINER,
	CATEGORY_CONTAINER,
	CATEGORY_CONTAINER,
	CATEGORY_CONTAINER,
	CATEGORY_WEAPON,
	CATEGORY_WEAPON,
	CATEGORY_ARMOR,
	CATEGORY_ARMOR,
	CATEGORY_WEAPON,
	CATEGORY_WEAPON,
	CATEGORY_ARMOR,
	CATEGORY_JEWELRY,
	CATEGORY_JEWELRY,
	CATEGORY_ARMOR,
	CATEGORY_ARMOR,
	CATEGORY_ARMOR,
	CATEGORY_WEAPON,
	CATEGORY_ITEM,
	CATEGORY_ITEM,
	CATEGORY_ITEM,
	CATEGORY_WEAPON,
	CATEGORY_WEAPON,
	CATEGORY_WEAPON,
	CATEGORY_WEAPON,
	CATEGORY_ITEM,
	CATEGORY_ITEM,
	CATEGORY_ITEM,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT,
	CATEGORY_EVENT	
];

//TODO OG only
const TYPE_NONE               = 0;
const TYPE_STAIRS_UP          = 1;
const TYPE_STAIRS_DOWN        = 2;
const TYPE_TOWN_PORTAL        = 3;
const TYPE_DUNGEON_PORTAL     = 4;
const TYPE_FISHING_HOLE       = 5;
const TYPE_GOLD               = 6;
const TYPE_GENERIC            = 7;
const TYPE_POTION             = 8;
const TYPE_WEAPON_RACK        = 9;
const TYPE_CONTAINER          = 10;
const TYPE_CHEST_SMALL        = 11;
const TYPE_CHEST_MEDIUM       = 12;
const TYPE_CHEST_LARGE        = 13;
const TYPE_SWORD              = 14;
const TYPE_CLUB               = 15;
const TYPE_HELMET             = 16;
const TYPE_SHIELD             = 17;
const TYPE_SPEAR              = 18;
const TYPE_BOW                = 19;
const TYPE_BELT               = 20;
const TYPE_NECKLACE           = 21;
const TYPE_RING               = 22;
const TYPE_GLOVES             = 23;
const TYPE_BOOTS              = 24;
const TYPE_SHIRT              = 25;
const TYPE_POLEARM            = 26;
const TYPE_SCROLL             = 27;
const TYPE_BOOK               = 28;
const TYPE_SPELL              = 29;
const TYPE_AXE                = 30;
const TYPE_HAMMER             = 31;
const TYPE_STAFF              = 32;
const TYPE_CROSSBOW           = 33;
const TYPE_GEM                = 34;
const TYPE_PET_FOOD           = 35;
const TYPE_FISHING_POLE       = 36;
const TYPE_MAGIC_ANVIL        = 37;
const TYPE_SHRINE             = 38;
const TYPE_FOUNTAIN           = 39;
const TYPE_THRONE             = 40;
const TYPE_STATUE             = 41;
const TYPE_HEAL_FOUNTAIN      = 42;
const TYPE_MANA_FOUNTAIN      = 43;
const TYPE_STAMINA_FOUNTAIN   = 44;
const TYPE_WELLNESS_FOUNTAIN  = 45;
const TYPE_ALL                = 46;

//TODO OG only
const SKILL_SWORD            = 0;
const SKILL_CLUB             = 1;
const SKILL_HAMMER           = 2;
const SKILL_AXE              = 3;
const SKILL_SPEAR            = 4;
const SKILL_STAFF            = 5;
const SKILL_POLEARM          = 6;
const SKILL_BOW              = 7;
const SKILL_CRITICAL_STRIKE  = 8;
const SKILL_SPELLCASTING     = 9;
const SKILL_DUAL_WIELD       = 10;
const SKILL_SHIELD           = 11;
const SKILL_ATTACK_MAGIC     = 12;
const SKILL_DEFENSE_MAGIC    = 13;
const SKILL_CHARM_MAGIC      = 14;
const SKILL_ALL              = 15;

//TODO OG only
const TYPE_TO_SKILL = [
	SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD,
	SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_CLUB,
	SKILL_SWORD, SKILL_SWORD, SKILL_SPEAR, SKILL_BOW, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD,
	SKILL_SWORD, SKILL_SWORD, SKILL_POLEARM, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_AXE, SKILL_HAMMER, 
	SKILL_STAFF, SKILL_BOW, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD,
	SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD, SKILL_SWORD
];


const GRADE_NORMAL       = 0;
const GRADE_SUPERIOR     = 1;
const GRADE_EXCEPTIONAL  = 2;
const GRADE_FLAWLESS     = 3;
const GRADE_ALL          = 4;

const GRADE_BONUS = [0, 20, 40, 60];


const ACTIVATION_PASSIVE = 0;
const ACTIVATION_USAGE = 1;

const OG_SKILLS = 15;

//left top right bottom
const STATS_BOUNDS = new Map([["NAME", [94, 56, 414, 92]], ["LEVEL", [55, 123, 139, 158]], ["EXPERIENCE", [158, 123, 298, 158]],
	["NEXT_LEVEL", [317, 123, 455, 158]], ["RENOWN", [55, 189, 139, 224]], ["FAME", [158, 189, 298, 224]], ["NEXT_RENOWN", [317, 189, 455, 224]],
	["STRENGTH_STR", [39, 255, 136, 286]], ["STRENGTH", [140, 255, 228, 286]], ["DAMAGE_STR", [291, 255, 382, 286]], ["DAMAGE", [387, 255, 472, 286]],
	["DEXTERITY_STR", [39, 334, 136, 366]], ["DEXTERITY", [140, 334, 228, 366]], ["ATTACK_STR", [291, 334, 382, 366]], ["ATTACK", [387, 334, 472, 366]],
	["DEFENSE_STR", [291, 370, 382, 401]], ["DEFENSE", [387, 370, 474, 401]], ["VITALITY_STR", [39, 415, 136, 447]], ["VITALITY", [140, 415, 228, 447]],
	["STAMINA_STR", [291, 415, 382, 447]], ["STAMINA", [387, 415, 472, 447]], ["LIFE_STR", [291, 452, 382, 483]], ["LIFE", [387, 452, 474, 483]],
	["MAGIC_STR", [39, 494, 136, 525]], ["MAGIC", [140, 494, 228, 525]], ["MANA_STR", [291, 494, 382, 525]], ["MANA", [387, 494, 472, 525]],
	["POINTS_STR", [151, 546, 264, 583]], ["POINTS", [267, 547, 352, 582]]]);

//TODO OG only
//  SLOT_LEFTHAND = 2;
//  SLOT_LEFTARM = 4;
//  TODO EVERYWHERE for inv divs, i will only have one for SLOT_LEFTHAND (not SLOT_LEFTARM)
//TODO WHERE LEFT OFF i think i swapped the rings
const INV_BOUNDS = new Map([[SLOT_RIGHTHAND, [552, 54, 641, 239]], [SLOT_HEAD, [727, 54, 816, 144]], [SLOT_NECK, [835, 54, 882, 100]],
	[SLOT_LEFTHAND, [903, 54, 992, 239]], [SLOT_CHEST, [727, 156, 816, 289]], [SLOT_GLOVES, [552, 252, 641, 342]], [SLOT_RIGHTFINGER, [661, 300, 708, 346]],
	[SLOT_BELT, [727, 300, 816, 346]], [SLOT_LEFTFINGER, [835, 300, 882, 346]], [SLOT_FEET, [903, 252, 992, 342]],
	[17, [532, 383, 573, 423]], [27, [532, 427, 573, 470]], [37, [532, 475, 573, 519]], [47, [532, 523, 573, 564]],
	[18, [577, 383, 621, 423]], [28, [577, 427, 621, 470]], [38, [577, 475, 621, 519]], [48, [577, 523, 621, 564]],
	[19, [625, 383, 669, 423]], [29, [625, 427, 669, 470]], [39, [625, 475, 669, 519]], [49, [625, 523, 669, 564]],
	[20, [673, 383, 717, 423]], [30, [673, 427, 717, 470]], [40, [673, 475, 717, 519]], [50, [673, 523, 717, 564]],
	[21, [721, 383, 765, 423]], [31, [721, 427, 765, 470]], [41, [721, 475, 765, 519]], [51, [721, 523, 765, 564]],
	[22, [769, 383, 813, 423]], [32, [769, 427, 813, 470]], [42, [769, 475, 813, 519]], [52, [769, 523, 813, 564]],
	[23, [817, 383, 861, 423]], [33, [817, 427, 861, 470]], [43, [817, 475, 861, 519]], [53, [817, 523, 861, 564]],
	[24, [865, 383, 909, 423]], [34, [865, 427, 909, 470]], [44, [865, 475, 909, 519]], [54, [865, 523, 909, 564]],
	[25, [913, 383, 957, 423]], [35, [913, 427, 957, 470]], [45, [913, 475, 957, 519]], [55, [913, 523, 957, 564]],
	[26, [961, 383, 1002, 423]], [36, [961, 427, 1002, 470]], [46, [961, 475, 1002, 519]], [56, [961, 523, 1002, 564]]]);

const SKILLS_GOLD_BOUNDS = new Map([[SKILL_SWORD, [1165, 83, 1251, 107]], ["SWORD_STR", [1256, 83, 1454, 107]], [SKILL_CLUB, [1165, 115, 1251, 139]], ["CLUB_STR", [1256, 115, 1454, 139]],
	[SKILL_HAMMER, [1165, 148, 1251, 172]], ["HAMMER_STR", [1256, 148, 1454, 172]], [SKILL_AXE, [1165, 182, 1251, 206]], ["AXE_STR", [1256, 182, 1454, 206]],
	[SKILL_SPEAR, [1165, 213, 1251, 237]], ["SPEAR_STR", [1256, 213, 1454, 237]], [SKILL_STAFF, [1165, 244, 1251, 268]], ["STAFF_STR", [1256, 244, 1454, 268]],
	[SKILL_POLEARM, [1165, 276, 1251, 300]], ["POLEARM_STR", [1256, 276, 1454, 300]], [SKILL_BOW, [1165, 308, 1251, 332]], ["BOW_STR", [1256, 308, 1454, 332]],
	[SKILL_CRITICAL_STRIKE, [1165, 340, 1251, 364]], ["CRIT_STR", [1256, 340, 1454, 364]], [SKILL_SPELLCASTING, [1165, 371, 1251, 395]], ["SPELL_STR", [1256, 371, 1454, 395]],
	[SKILL_DUAL_WIELD, [1165, 403, 1251, 427]], ["DUAL_STR", [1256, 403, 1454, 427]], [SKILL_SHIELD, [1165, 435, 1251, 459]], ["SHIELD_STR", [1256, 435, 1454, 459]],
	[SKILL_ATTACK_MAGIC, [1165, 466, 1251, 490]], ["ATTMAG_STR", [1256, 466, 1454, 490]], [SKILL_DEFENSE_MAGIC, [1165, 499, 1251, 523]], ["DEFMAG_STR", [1256, 499, 1454, 523]],
	[SKILL_CHARM_MAGIC, [1165, 532, 1251, 556]], ["CHAMAG_STR", [1256, 532, 1454, 556]], ["POINTS_STR", [1186, 570, 1299, 598]], ["POINTS", [1302, 570, 1387, 598]],
	["GOLD_ICON", [1446, 537, 1509, 600]], ["GOLD", [1446, 601, 1509, 626]]]);
	

const ROMAN_VALUE =  [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const ROMAN_SYMBOL = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
function romanNumeral(n)
{
	let roman = "";
	for (let i = 0; i < ROMAN_VALUE.length; i++)
	{
		while (n >= ROMAN_VALUE[i])
		{
			roman += ROMAN_SYMBOL[i];
			n -= ROMAN_VALUE[i];
		}
	}
	return roman;
}


//OG
// MONSTERS	./MONSTERS/en-US/monsters.dat
// ITEMS	./ITEMS/en-US/items.dat
// SPELLS	./SPELLS/en-US/spells.dat

//UR
// MONSTERS	./MONSTERS/en-US/monsters.dat	./REALMS/Goldshare/MONSTERS/en-US/		..Druantia.. ..Typhon.. ..Temple..
// ITEMS	./ITEMS/en-US/items.dat			./REALMSGoldshareITEMS/en-us/items.dat
// SPELLS	./SPELLS/en-US/spells.dat		./REALMS/Goldshare/SPELLS/en-US/spells.dat

//TS
// MONSTERS	./	./REALMS/Goldshare/MONSTERS	./REALMS/Druantia/	./REALMS/Chamber/	./REALMS/Typhon/	./REALMS/Temple/
// ITEMS	./	./REALMS/URGold/ITEMS		./REALMS/Goldshare/ 
// SPELLS	./	./REALMS/URGold/SPELLS		./REALMS/Goldshare/ 

//TODO warn if the number of files doesnt match what i think is the default?
//TODO help hint hover
//TODO mark the wrong things?
//TODO futher validation like if not a text file?

let ERR_MSGS = [];
async function preRun(ev)
{
	//TODO in the correct places you need to redefault relevant globals
	if (ffdSelector.files.length)	await promiseParseFFD(ffdSelector.files[0]);
	else						  	ERR_MSGS.push("No FFD file selected.");

	if (MONSTERS_DATS.length)		for (let i = 0; i < MONSTERS_DATS.length; await promiseParseMonstersDat(MONSTERS_DATS[i++]));
	else					   		ERR_MSGS.push("No monsters.dat selected.");

	if (ITEMS_DATS.length)	 		for (let i = 0; i < ITEMS_DATS.length; await promiseParseItemsDat(ITEMS_DATS[i++]));
	else                    		ERR_MSGS.push("No items.dat selected.");

	if (SPELLS_DATS.length) 		for (let i = 0; i < SPELLS_DATS.length; await promiseParseSpellsDat(SPELLS_DATS[i++]));
	else					 		ERR_MSGS.push("No spells.dat selected.");

	if (false && ERR_MSGS.length) //TODO TODO TODO while developing player, forcing false
	{
		alert(["Failed to run for these reasons (no changes made):", ...ERR_MSGS].join('\n - '));
		//TODO TODO TODO reset the relevant globals; there are a lot
	}
	else
	{
		run();
	}
}

//TODO like all glboals, reset when applicable
const PLAYER_TAB =
{
	opened: false,
	elem: document.getElementById("playerTab"),
	stack: [],
	statsDivs: new Map(),
	invDivs: new Map(),
	skillsGoldDivs: new Map(),
	equippedEffects: new Array(EFFECT_ALL_TYPES),
	characterEffects: new Array(EFFECT_ALL_TYPES)
};

//TODO resists may not appear here ... so when you consider resists, consider the resists attribute

//TODO can do something if slotindex or type are out of expected range
//TODO what if non equipped but in such a slot? vice versa?
//TODO right now hard coded for player, but you must generalize
//TODO <= SLOT_EQUIPMENT is sus
function computeEquippedEffects()
//also computes equippedItems and inventory icons
{
	robj.player.equippedItems = new Array(SLOT_QUICK5)
	PLAYER_TAB.equippedEffects.fill(0);

	const l = 0, t = 1, r = 2, b = 3;
	for (it of robj.player.itemInstances)
	{
		if (it.slotIndex <= SLOT_ALL)
		{
			robj.player.equippedItems[it.slotIndex] = it;
		}
		if (it.equipped && 0 <= it.slotIndex && it.slotIndex <= SLOT_EQUIPMENT)
		{
			for (ef of it.effects[ACTIVATION_PASSIVE])
			{
				if (0 <= ef.type && ef.type <= EFFECT_ALL_TYPES)
				{
					PLAYER_TAB.equippedEffects[ef.type] += ef.value;
				}
			}
		//inventory icons
			const icon = document.createElement("img");
			icon.src = `img/${ITEMS_INFO.get(it.baseName.toUpperCase()).icon}`; //TODO TODO TODO hardcoding, but should be smarter...
			icon.classList.add("center-contained");
			PLAYER_TAB.invDivs.get(it.slotIndex == SLOT_LEFTARM ? SLOT_LEFTHAND : it.slotIndex).appendChild(icon);


			//TODO WHERE LEFT OFF grade star
			const star = document.createElement("img");
			star.src = "img/goldstar.png";
			star.classList.add("grade-rank-icon");
			const rank = document.createElement("img");
			rank.src = "img/elite.png";
			rank.classList.add("grade-rank-icon");
			PLAYER_TAB.invDivs.get(it.slotIndex == SLOT_LEFTARM ? SLOT_LEFTHAND : it.slotIndex).appendChild(star);
			PLAYER_TAB.invDivs.get(it.slotIndex == SLOT_LEFTARM ? SLOT_LEFTHAND : it.slotIndex).appendChild(rank);

			addHoverboxToItem(PLAYER_TAB.invDivs.get(it.slotIndex == SLOT_LEFTARM ? SLOT_LEFTHAND : it.slotIndex), it);
		}
		else if (it.slotIndex > SLOT_QUICK5) //TODO hardcoding for now, because i dont have the quickslots on the screen
		{
			const iconDiv = document.createElement("div");
			const slotsWide = Math.floor(ITEMS_INFO.get(it.baseName.toUpperCase()).iconWidth / INV_SLOT_SIZE);
			const slotsTall = Math.floor(ITEMS_INFO.get(it.baseName.toUpperCase()).iconHeight / INV_SLOT_SIZE);

			iconDiv.style.position = "absolute";
			iconDiv.style.left = `calc(${INV_BOUNDS.get(it.slotIndex)[l]}% * 100 / 1536)`;
			iconDiv.style.top = `calc(${INV_BOUNDS.get(it.slotIndex)[t]}% * 100 / 640)`;
			iconDiv.style.width = `calc((${INV_BOUNDS.get(it.slotIndex + slotsWide - 1)[r]}% - ${INV_BOUNDS.get(it.slotIndex)[l]}% + 1%) * 100 / 1536)`;
			iconDiv.style.height = `calc((${INV_BOUNDS.get(it.slotIndex + 10*slotsTall - 10)[b]}% - ${INV_BOUNDS.get(it.slotIndex)[t]}% + 1%) * 100 / 640)`;
			iconDiv.classList.add("center-container");

			const icon = document.createElement("img");
			icon.src = `img/${ITEMS_INFO.get(it.baseName.toUpperCase()).icon}`;
			icon.classList.add("center-contained");
			iconDiv.appendChild(icon);
			document.getElementById("player-statsInvSkillGold-div").appendChild(iconDiv);
			PLAYER_TAB.invDivs.set(it.slotIndex, iconDiv);

			addHoverboxToItem(iconDiv, it);
		}
	}
}

//TODO right now hard coded for player, but you must generalize
//TODO equippedeffect + charactereffect might be float, but in case of skills: baseskill + trunc(equippedeffect + charactereffect)
function computeCharacterEffects()
{
	PLAYER_TAB.characterEffects.fill(0);

	for (effects of robj.player.effects)
		for (ef of effects)
			if (0 <= ef.type && ef.type <= EFFECT_ALL_TYPES)
				PLAYER_TAB.characterEffects[ef.type] += ef.value;

	//TODO TODO TODO same for natural effects
	//i think this might be the dat effects. are these not included in ffd effects? gasp
}

function charNetResistance(c, d)
{
	// there are no modifiers for undead 'resistance'
	if (d == DAMAGE_UNDEAD)
	{
		return c.damageResistance[d];
	}
	resist = c.damageResistance[d] + charNetEffect(c, DAMAGE_TO_EFFECT[d])
	return Math.max(-100, Math.min(resist, 100));
}

//TODO and everywhere, need to not hardcode PLAYER_TAB 
//TODO and everywhere, need to update if any effects are updated
function charNetEffect(c, e)
{
	ret = PLAYER_TAB.characterEffects[e] + PLAYER_TAB.equippedEffects[e];
	if (ret && IS_MAGIC[e] && Math.sign(ret) != Math.sign(EFFECT_MAXIMUM[e]))
	{
		ret -= Math.trunc(charNetResistance(c, DAMAGE_MAGICAL) * 0.01 * ret);
	}
	return ret;
}

function charNetSkill(c, s)
{
	return c.skills[s] + charNetEffect(c, EFFECT_SKILL_SWORD + s);
}

function charStrength(c)
{
	return c.strength + Math.ceil(charNetEffect(c, EFFECT_PERCENT_STRENGTH) * 0.01 * c.strength) + Math.trunc(charNetEffect(c, EFFECT_STRENGTH));
}

function charDexterity(c)
{
	return c.dexterity + Math.ceil(charNetEffect(c, EFFECT_PERCENT_DEXTERITY ) * 0.01 * c.dexterity) + Math.trunc(charNetEffect(c, EFFECT_DEXTERITY));
}

function charVitality(c)
{
	return c.vitality + Math.ceil(charNetEffect(c, EFFECT_PERCENT_VITALITY) * 0.01 * c.vitality) + Math.trunc(charNetEffect(c, EFFECT_VITALITY));
}

function charMagic(c)
{
	return c.magic + Math.ceil(charNetEffect(c, EFFECT_PERCENT_MAGIC) * 0.01 * c.magic) + Math.trunc(charNetEffect(c, EFFECT_MAGIC));
}

function charExperienceGate(c)
{
	if (c.level)
		return EXPERIENCE_GATE[c.level > 99 ? 99 : c.level]
	return 0;
}

function charFameGate(c)
{
	return FAME_GATE[c.fameRank];
}

function charDamageStr(c)
{

}

//TODO TODO TODO WHERE LEFT OFF. also: damage.
function charAttack(c)
{
	//AttackDescriptions have tohitbonus
	//  unarmed: 0 unless <- monsters.dat "UNARMED_ATTACK"
	//  armed:   <- items have tohitbonus, 0 unless <- ItemDescription.toHitBonus <- TOHITBONUS in items.dat
	let attack = 50 + Math.trunc(charDexterity(c) / 2) + c.level +
		c.toHitBonus + (__activeWeapon ? charNetSkill(c, TYPE_TO_SKILL[__activeWeapon.type]) : 0) + (__currentAttack ? __currentAttack.toHitBonus : 0);
	return attack + Math.ceil(charNetEffect(c, EFFECT_PERCENT_TO_HIT_BONUS) * 0.01 * attack) + Math.trunc(charNetEffect(c, EFFECT_TO_HIT_BONUS));
}

function charDefense(c)
{
	let armor = 0;
	//inventory armor
	for (let i = 0; i < SLOT_EQUIPMENT; ++i)
	{
		const it = c.equippedItems[i];
		if (it !== undefined && TYPE_TO_CATEGORY[ITEMS_INFO.get(it.baseName.toUpperCase()).type] == CATEGORY_ARMOR)
		{
			const add = it.grade > GRADE_NORMAL ? ITEMS_INFO.get(it.baseName.toUpperCase()).armor[1] : it.armorBonus;
			const gradeBonus = Math.ceil(add * GRADE_BONUS[it.grade] * 0.01);
			armor += add + (it.grade > GRADE_NORMAL ? Math.max(1, gradeBonus) : gradeBonus);
		}
	}
	//natural armor TODO WHERE LEFT OFF hardcoding no, probably find an easier way to determine what the pet is
	armor += c.naturalArmor + c.level * 3 * (false && HasMaster() && Master().isPlayer() && !IsSummoned());
	return armor + Math.ceil(charNetEffect(c,  EFFECT_PERCENT_ARMOR_BONUS) * 0.01 * armor) + Math.trunc(charNetEffect(c, EFFECT_ARMOR_BONUS))
		+ Math.trunc(charDexterity(c) / 5); //dexterity bonus
}

function charMaxHP(c)
{
	return c.maxHp + Math.ceil(charNetEffect(c, EFFECT_PERCENT_H_P) * 0.01 * c.maxHp) + Math.trunc(charNetEffect(c, EFFECT_MAX_HP));
}

function charMaxStamina(c)
{
	return c.maxStamina + Math.ceil(charNetEffect(c, EFFECT_PERCENT_STAMINA) * 0.01 * c.maxStamina) + Math.trunc(charNetEffect(c, EFFECT_MAX_STAMINA));
}

function charMaxMana(c)
{
	return c.maxMana + Math.ceil(charNetEffect(c, EFFECT_PERCENT_MANA) * 0.01 * c.maxMana) + Math.trunc(charNetEffect(c, EFFECT_MAX_MANA));
}


function run()
{
	// for (each of the tab links)
	// {
	// 	make it interactable;
	// }

	uploadScreen.hidden = true;

	switchPlayerTab();

	// //eventually need to reset relevant globals too...
	// // and unhide the uploadScreen...
}


function addHoverboxToItem(div, it)
{
	const hoverbox = document.createElement("div");
	hoverbox.classList.add("hoverbox");

	for (const act of [ACTIVATION_PASSIVE, ACTIVATION_USAGE])
	{
		const actStr = act ? "USAGE" : "PASSIVE";
		for (const e of it.effects[act])
		{
			const div = document.createElement("div");
			if (Math.sign(e.value) === Math.sign(EFFECT_MAXIMUM[e.type]))
				div.innerHTML = `${actStr} ${EFFECT_FLAT_PERCENT[e.type] ? '' : (e.value > 0 ? '+' : '')}<span></span>${EFFECT_FLAT_PERCENT[e.type] ? '' : ' '}${EFFECT_ITEM_POSITIVE_STRINGS[e.type]}`;
			else
				div.innerHTML = `${actStr} ${EFFECT_FLAT_PERCENT[e.type] ? '' : (e.value < 0 ? '-' : '')}<span></span>${EFFECT_FLAT_PERCENT[e.type] ? '' : ' '}${EFFECT_ITEM_NEGATIVE_STRINGS[e.type]}`;


			const valStr = `${Math.abs(Math.trunc(e.value))}`;
			const span = div.querySelector("span");
			span.style.position = "relative";
			addEditableFieldAndHoverboxTo(div.querySelector("span"), valStr,	(_text, _input) => {
																					_input.style.width = `${_text.offsetWidth}px`;
																					_input.value = e.value;
																				},
																				(_text, _input) => {
																					const newVal = _input.value.trim();
																					e.value = parseFloat(newVal);
																					_text.innerText = `${Math.abs(Math.trunc(e.value))}`;
																					//TODO WHERE LEFT OFF need to change the entire line, not just the span								
																				},
																				() => {
																					return "hoverbox text";
																				});


			hoverbox.appendChild(div);
		}
	}

	div.appendChild(hoverbox);
}


//TODO WHERE LEFT OFF integrating this, working on making editable strength dexterity vitality magic
//  enterFunc and exitFunc each take exactly: _text and _input
//  hoverboxFunc takes no arguments
//  enterFunc and exitFunc should not modify .hidden or .focus() or hoverbox as those are done here
//TODO WHERE LEFT OFF right now, no validation. perhaps do a confirmation too. 

//ANGELA TODO work on clamping the typeable values
//	if typed value exceeds 32 bit limit (+/- ok), fix it to the min/max value
function addEditableFieldAndHoverboxTo(div, initText, enterFunc, exitFunc, hoverboxFunc)
{
	const text = document.createElement("span"); //TODO WHERE LEFT OFF  it was div before span
	text.innerText = initText;
	text.style.border = "none" || "1px solid red"; //TODO WHERE LEFT OFF 
	text.style.cursor = "pointer";

	const input = document.createElement("input");
	input.style.border = "none" || "1px solid blue"; //TODO WHERE LEFT OFF 
	input.style.maxWidth = "100%";
	input.style.background = "transparent";
	input.style.margin = "0";
	input.style.padding = "0";
	input.style.font = "inherit";
	input.style.color = "inherit";
	input.style.outline = "none";
	input.style.boxShadow = "none";
	input.style.textAlign = "center";
	input.hidden = true;

	const hoverbox = document.createElement("div");
	hoverbox.classList.add("hoverbox");
	hoverbox.innerText = hoverboxFunc();

	function enterFuncGenerator(enterFunc) {
		return () => {
			enterFunc(text, input);
			text.hidden = true;
			input.hidden = false;
			input.focus();
			hoverbox.classList.add("hoverbox-enter");
		};
	}
	function exitFuncGenerator(exitFunc) {
		return () => {
			exitFunc(text, input);
			input.hidden = true;
			text.hidden = false;
			hoverbox.classList.remove("hoverbox-enter");
			hoverbox.innerText = hoverboxFunc();
		};
	}

	text.addEventListener("click", enterFuncGenerator(enterFunc));
	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === "Escape") { //TODO escape should exit
			exitFuncGenerator(exitFunc)();
		}
	});
	input.addEventListener("blur", exitFuncGenerator(exitFunc));

	div.appendChild(text);
	div.appendChild(input);
	div.appendChild(hoverbox);
}

//TODO text might be too large
//TODO TODO TODO attack descriptions have effects and things too...
//TODO TODO TODO also unarmed attacks
function initStatsInvSkillsGold()
{
	//TODO WHERE LEFT OFF dont create some inv divs
	const player_statsInvSkillGold_div = document.getElementById("player-statsInvSkillGold-div");
	for ([playerTabMap, map] of [[PLAYER_TAB.statsDivs, STATS_BOUNDS], [PLAYER_TAB.invDivs, INV_BOUNDS], [PLAYER_TAB.skillsGoldDivs, SKILLS_GOLD_BOUNDS]])
	{
		for ([what, [l, t, r, b]] of map)
		{
			if (map === INV_BOUNDS && what > SLOT_QUICK5) continue;

			const div = document.createElement("div");
			div.style.position = "absolute";
			div.style.left = `calc(${l}% * 100 / 1536)`;
			div.style.top = `calc(${t}% * 100 / 640)`;
			div.style.width = `calc((${r}% - ${l}% + 1%) * 100 / 1536)`;
			div.style.height = `calc((${b}% - ${t}% + 1%) * 100 / 640)`;
			div.classList.add("center-container");
			//TODO any special behavior here...

			//div.style.backgroundColor = "white";
			div.style.color = "white";
			player_statsInvSkillGold_div.appendChild(div);
			playerTabMap.set(what, div);
		}
	}

	//TODO but consider that the displayed number might not be whats used in game

	computeEquippedEffects();
	computeCharacterEffects();
	
	//TODO but consider that the displayed number might not be whats used in game
	//TODO there is a petstatsmenu.cpp, how is that different? how about other monsters?
	//TODO TODO TODO Invenctory::EffectValue is probably different from Character::EffectValue?
	const p = robj.player;
	PLAYER_TAB.statsDivs.get("NAME").innerText = robj.player.lineage > 0 ?	`${p.name} the ${FAME_NAMES[p.fameRank]} (${romanNumeral(p.lineage)})` :
																			`${p.name} the ${FAME_NAMES[p.fameRank]}`;
	PLAYER_TAB.statsDivs.get("LEVEL").innerText = p.level;
	PLAYER_TAB.statsDivs.get("EXPERIENCE").innerText = p.experience;
	PLAYER_TAB.statsDivs.get("NEXT_LEVEL").innerText = charExperienceGate(p);
	PLAYER_TAB.statsDivs.get("RENOWN").innerText = p.fameRank;
	PLAYER_TAB.statsDivs.get("FAME").innerText = p.fame;
	PLAYER_TAB.statsDivs.get("NEXT_RENOWN").innerText = charFameGate(p);
	PLAYER_TAB.statsDivs.get("STRENGTH_STR").innerText = "Strength";
	PLAYER_TAB.statsDivs.get("DEXTERITY_STR").innerText = "Dexterity";
	PLAYER_TAB.statsDivs.get("VITALITY_STR").innerText = "Vitality";
	PLAYER_TAB.statsDivs.get("MAGIC_STR").innerText = "Magic";
	PLAYER_TAB.statsDivs.get("DAMAGE_STR").innerText = "Damage";
	PLAYER_TAB.statsDivs.get("DAMAGE").innerText = charDamageStr(p);
	PLAYER_TAB.statsDivs.get("ATTACK_STR").innerText = "Attack";
	PLAYER_TAB.statsDivs.get("ATTACK").innerText = "charAttack(p)";
	PLAYER_TAB.statsDivs.get("DEFENSE_STR").innerText = "Defense";
	PLAYER_TAB.statsDivs.get("DEFENSE").innerText = charDefense(p);
	PLAYER_TAB.statsDivs.get("LIFE_STR").innerText = "Life";
	PLAYER_TAB.statsDivs.get("STAMINA_STR").innerText = "Stamina";
	PLAYER_TAB.statsDivs.get("MANA_STR").innerText = "Mana";

	for (const [div, func, attr, perc, flat] of [	["STRENGTH",	charStrength,	"strength",		EFFECT_PERCENT_STRENGTH,	EFFECT_STRENGTH],
													["DEXTERITY",	charDexterity,	"dexterity",	EFFECT_PERCENT_DEXTERITY,	EFFECT_DEXTERITY],
													["VITALITY",	charVitality,	"vitality",		EFFECT_PERCENT_VITALITY, 	EFFECT_VITALITY],
													["MAGIC",		charMagic,		"magic",		EFFECT_PERCENT_MAGIC, 		EFFECT_MAGIC],
													["LIFE",		charMaxHP,		"maxHp", 		EFFECT_PERCENT_H_P,			EFFECT_MAX_HP],
													["STAMINA",		charMaxStamina, "maxStamina",	EFFECT_PERCENT_STAMINA, 	EFFECT_MAX_STAMINA],
													["MANA",		charMaxMana,	"maxMana",		EFFECT_PERCENT_MANA,		EFFECT_MAX_MANA]])
	{
		addEditableFieldAndHoverboxTo(PLAYER_TAB.statsDivs.get(div),	func(p),
																		(_text, _input) => {
																			_input.value = p[attr];
																		},
																		(_text, _input) => {
																			const newVal = _input.value.trim();
																			p[attr] = parseInt(newVal);
																			_text.innerText = func(p);
																		},
																		() => {
																			return `${p[attr]} + ${charNetEffect(p, perc)}% [${Math.ceil(charNetEffect(p, perc) * 0.01 * p[attr])}] + ${Math.trunc(charNetEffect(p, flat))}`;
																		});
	}

	PLAYER_TAB.statsDivs.get("POINTS_STR").innerText = "Points Remaining";
	PLAYER_TAB.statsDivs.get("POINTS").innerText = p.unusedStatPoints;

	//inv


	//skills
	let i = 0;
	for (div of PLAYER_TAB.skillsGoldDivs.values())
	{
		if (i == 2 * OG_SKILLS)
			break;
		
		const skill = i >> 1;
		if (i++ % 2 == 0)
		{
			addEditableFieldAndHoverboxTo(div,	charNetSkill(p, skill),
												(_text, _input) => {
													_input.value = p.skills[skill];
												},
												(_text, _input) => {
													const newSkill = _input.value.trim();
													p.skills[skill] = parseInt(newSkill);
													_text.innerText = charNetSkill(p, skill);
												},
												() => {
													return `${p.skills[skill]} + ${charNetEffect(p, EFFECT_SKILL_SWORD + skill)}`;
												});
		}
		else 
			div.innerText = `${SKILLS_INT_STR[skill]} Skill`;
	}
	PLAYER_TAB.skillsGoldDivs.get("POINTS_STR").innerText = "Points Remaining";
	PLAYER_TAB.skillsGoldDivs.get("POINTS").innerText = robj.player.unusedSkillPoints;

	//gold
	//TODO WHERE LEFT OFF probably allow passing in False into slots where N/A, like hoverbox here or text/input for inventory icons
	addEditableFieldAndHoverboxTo(PLAYER_TAB.skillsGoldDivs.get("GOLD"), p.gold,
																(_text, _input) => {
																	_input.value = p.gold;
																}, 
																(_text, _input) => {
																	const newGold = _input.value.trim();
																	p.gold = parseInt(newGold);
																	_text.innerText = p.gold;	
																});
}

function switchPlayerTab()
{
	PLAYER_TAB.elem.hidden = false;
	initStatsInvSkillsGold();
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// PARSING

const robj =
{
	i: 0,
	view: null,
	sentinel: undefined,         //UR
	version: undefined,          //UR
	gemsCollected: undefined,    //OG steam
	fishCaught: undefined,       //OG steam
	wardDescriptions: undefined, //UR versioning
	hash: undefined,             //UR versioning
	fishList: undefined,         //UR steam
	cardList: undefined          //UR steam
};

// ffdSelector.addEventListener("input", parseFile);

function promiseParseFFD(ffdFile)
{
	return new Promise((res, rej) => { res(parseFFD(ffdFile)); });
}

function promiseReadFFD(ffdFile)
{
	return new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onload = () => { res(reader.result); };
		reader.onerror = (ev) => { rej(ev); };
		reader.readAsArrayBuffer(ffdFile);
	});
}

async function parseFFD(ffdFile)
{
	let ab = null;
	try {
		ab = await promiseReadFFD(ffdFile);
	} catch (e) {
		ERR_MSGS.push(`Could not open FFD (${ffdFile.name}; for your security I don't know full path).`);
		return;
	}
	robj.i = 0;
	robj.view = new DataView(ab);

	if (GAME == "UR") {
		robj.sentinel = parseInt32();
		if (robj.sentinel != -1)
			parsingError(`UR main sentinel not -1, instead ${sentinel} (int32 @ ${robj.i - 4})`);

		robj.version = parseUint32();
		if (robj.version != 2)
			console.log(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR file version not 2, instead ${version} (uint32 @ ${robj.i - 4})`);
	}

	robj.mapVisible = parseBool();
	robj.mapDolly = parseInt32();
	robj.running = parseBool();
	robj.showingItems = parseBool();

	robj.hotkeySpellAssignment = [];
	for (let i = 0; i < 12; ++i)
		robj.hotkeySpellAssignment.push(parseString(16));

	//NOTE stand-in
	robj.tipSeen = [];
	for (let i = 0; i < 19; ++i) //TODO og steam 19 kcontexttips
		robj.tipSeen.push(parseBool());

	robj.player = parseCharacter();

	let n = parseUint32();
	robj.petList = [];
	for (let i = 0; i < n; ++i)
		robj.petList.push(parseCharacter());

	n = parseUint32();
	robj.discoveryHistory = [];
	for (let i = 0; i < n; ++i)
		robj.discoveryHistory.push(parseHistory());

	if (DISTRIBUTION == "SG" && GAME == "OG") {
		robj.gemsCollected = parseString(16);
		robj.fishCaught = parseString(16);
		//robj.disabledAchievements = parseBool(); //TODO however it seems nothing has this?
	}

	if (GAME == "UR") {
		if (robj.version >= 0) {
			//TODO is all this code covered?
			const n = parseUint32();
			robj.wardDescriptions = [];
			for (let i = 0; i < n; ++i)
				robj.wardDescriptions.push(parseCharacter());
		}
		if (robj.version >= 1) {
			const n = parseUint32();
			robj.tipSeen = [];
			for (let i = 0; i < n; ++i)
				robj.tipSeen.push(parseBool());
		}
		if (robj.version >= 2)
			robj.hash = parseString(16);

		//TODO TODO TODO angela hardcore check. what to do?

		if (DISTRIBUTION == "SG") {
			robj.fishList = parseString(16);
			robj.cardList = parseString(16);
			//robj.disabledAchievements = parseBool(); //TODO however it seems nothing has this?
		}
	}

	//TODO add button for download once has finished
	const downloadButton = document.createElement("button");
	downloadButton.innerHTML = "Download";
	downloadButton.addEventListener("click", downloadFile);
	document.body.appendChild(downloadButton);
}



function parseString(bits) {
	const n = (bits == 16) ? parseUint16() : parseUint32();
	robj.i += n;
	return String.fromCharCode.apply(null, new Uint8Array(robj.view.buffer, robj.i - n, n));
}

function parseFloat32() {
	robj.i += 4;
	return robj.view.getFloat32(robj.i - 4, true);
}

function parseBool() {
	robj.i += 1;
	return robj.view.getUint8(robj.i - 1, true);
}

function parseInt16() {
	robj.i += 2;
	return robj.view.getInt16(robj.i - 2, true);
}

function parseUint16() {
	robj.i += 2;
	return robj.view.getUint16(robj.i - 2, true);
}

function parseInt32() {
	robj.i += 4;
	return robj.view.getInt32(robj.i - 4, true);
}

function parseUint32() {
	robj.i += 4;
	return robj.view.getUint32(robj.i - 4, true);
}

function parseUint8Array(n) {
	robj.i += n;
	return new Uint8Array(robj.view.buffer, robj.i - n, n);
}

function parseEffect() {
	let ret = {};
	ret.name = parseString(16);
	ret.message = parseString(16);
	ret.exclusive = parseBool();
	ret.type = parseInt32();
	ret.damageType = parseInt32();
	ret.positive = parseBool();
	ret.activation = parseInt32();
	ret.chanceOfSuccess = parseInt32();
	ret.chanceOfSuccessBonus = parseInt32();
	ret.chanceOfSuccessBonusPercent = parseInt32();
	ret.duration = parseInt32();
	ret.durationBonus = parseInt32();
	ret.durationBonusPercent = parseInt32();
	ret.value = parseFloat32();
	ret.valueBonus = parseFloat32();
	ret.valueBonusPercent = parseFloat32();
	ret.value2 = parseFloat32();
	ret.value2Bonus = parseFloat32();
	ret.value2BonusPercent = parseFloat32();
	ret.value3 = parseFloat32();
	ret.value3Bonus = parseFloat32();
	ret.value3BonusPercent = parseFloat32();
	ret.priceMultiplier = parseFloat32();

	return ret;
}

//TODO do not console log, instead log into webpage directly
function parseItem() {
	let ret = {
		sentinel: undefined, //UR
		version: undefined,  //UR
		heroID: undefined    //UR versioning
	};

	if (GAME == "UR") {
		ret.sentinel = parseInt16();
		if (ret.sentinel != -1)
			parsingError(`UR item sentinel not -1, instead ${ret.sentinel} (int16 @ ${robj.i - 2})`);
		//TODO parsingError() ... @ this point probably just abort

		ret.version = parseUint16();
		if (ret.version != 1)
			console.log(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR item version not 1, instead ${ret.version} (uint16 @ ${robj.i - 2})`);
	}

	ret.baseName = parseString(16);
	ret.name = parseString(16);
	ret.slotIndex = parseInt32();
	ret.equipped = parseBool();
	ret.value = parseInt32();
	ret.open = parseBool();

	ret.position = parseUint8Array(12);
	ret.orientation = parseUint8Array(64);

	ret.uses = parseInt32();
	ret.grade = parseInt32();
	ret.unique = parseBool();
	ret.artifact = parseBool();
	ret.identified = parseBool();
	ret.armorBonus = parseUint32();
	ret.sockets = parseUint32();
	ret.canInteract = parseBool();
	ret.operateable = parseBool();
	ret.destructible = parseBool();
	ret.trapType = parseInt32();

	let n = parseUint32();
	ret.damageBonus = [];
	ret.damageBonusValue = [];
	for (let i = 0; i < n; ++i) {
		ret.damageBonus.push(parseInt32());
		ret.damageBonusValue.push(parseInt32());
	}

	ret.effects = [[], []];
	for (let i = 0; i < 2; ++i) //TODO steam og ur kactivationtypes
	{
		const n = parseInt32();
		for (let j = 0; j < n; ++j)
			ret.effects[i].push(parseEffect());
	}

	n = parseUint32();
	ret.items = [];
	for (let i = 0; i < n; ++i)
		ret.items.push(parseItem());

	if (GAME == "UR") {
		if (ret.version == 0)
			parseInt32();
		else //if ret.version >= 1
			ret.heroID = parseString(32);
	}

	return ret;
}

function parseQuest() {
	let ret = {
		sentinel: undefined,    //UR
		version: undefined,     //UR
		questItem: undefined,   //conditional
		questReward: undefined, //conditional
		realm: undefined,       //UR versioning
		initialized: undefined, //UR versioning
		hidden: undefined,      //UR versioning
		state: undefined        //UR versioning
	};

	if (GAME == "UR") {
		ret.sentinel = parseInt16();
		if (ret.sentinel != -1)
			parsingError(`UR quest sentinel not -1, instead ${ret.sentinel} (int16 @ ${robj.i - 2})`);
		ret.version = parseUint16();
		if (ret.version != 4)
			console.log(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR quest version not 4, instead ${ret.version} (uint16 @ ${robj.i - 2})`);
	}

	ret.level = parseInt32();
	ret.type = parseInt32();
	ret.spawned = parseBool();
	ret.completed = parseBool();
	ret.completionNotified = parseBool();
	ret.questMonsterCount = parseInt32();
	ret.questMonstersCompleted = parseInt32();
	ret.questMinionCount = parseInt32();
	ret.questMinionsCompleted = parseInt32();
	ret.questItemCount = parseInt32();
	ret.questItemsCompleted = parseInt32();
	ret.goldReward = parseUint32();
	ret.experienceReward = parseUint32();
	ret.fameReward = parseUint32();
	ret.questName = parseString(16);
	ret.questMonsterName = parseString(16);
	ret.questMonsterBaseName = parseString(16);
	ret.questMinionMonsterBaseName = parseString(16);
	ret.giverName = parseString(16);
	ret.questDescription = parseString(16);
	ret.questMiniDescription = parseString(16);
	ret.completionDescription = parseString(16);
	ret.incompleteDescription = parseString(16);

	if (parseBool())
		ret.questItem = parseItem();
	if (parseBool())
		ret.itemReward = parseItem();

	if (GAME == "UR") {
		if (ret.version >= 0)
			ret.realm = parseUint32();
		if (ret.version >= 2)
			ret.initialized = parseBool();
		if (ret.version >= 3)
			ret.hidden = parseBool();
		if (ret.version >= 4)
			ret.state = parseInt32();
	}

	return ret;
}

function parseCharacter() {
	let ret = {
		sentinel: undefined,           //UR
		version: undefined,            //UR
		existenceTime: undefined,      //OG
		wholeExistenceTime: undefined, //UR
		partExistenceTime: undefined,  //UR
		journalStats: undefined,       //conditional
		hasOpenPortal: undefined,      //OG TODO ANGELA
		portalDepth: undefined,        //OG TODO ANGELA
		portalPosition: undefined,     //OG TODO ANGELA
		portals: undefined,            //UR
		masterQuest: undefined,        //conditional
		lastRealm: undefined,          //UR versioning
		heroes: undefined,             //UR versioning
		realmsComplete: undefined,     //UR versioning
		postCount: undefined,          //UR versioning
		deathCount: undefined          //UR versioning
	};

	if (GAME == "UR") {
		ret.sentinel = parseInt16();
		if (ret.sentinel != -1)
			parsingError(`UR character sentinel not -1, instead ${ret.sentinel} (int16 @ ${robj.i - 2})`);

		ret.version = parseUint16();
		const expectVersion = DISTRIBUTION == "SG" ? 9 : 8;
		if (ret.version != expectVersion)
			console.log(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR character version not ${expectVersion}, instead ${ret.version} (uint16 @ ${robj.i - 2})`);
	}

	ret.templateName = parseString(16);
	ret.originalTemplateName = parseString(16);

	const existenceTime = parseFloat32();
	if (GAME == "OG")
		ret.existenceTime = existenceTime;
	else {
		ret.wholeExistenceTime = Math.floor(existenceTime);
		ret.partExistenceTime = existenceTime - ret.wholeExistenceTime;
	}
	ret.isPlayer = parseBool();

	if (ret.isPlayer) {
		ret.journalStats = [];
		const nStats = DISTRIBUTION == "SG" ? (GAME == "OG" ? 17 : 19) : 16;
		for (let i = 0; i < nStats; ++i)
			ret.journalStats.push(parseInt32());
	}

	ret.transformationDuration = parseFloat32();
	ret.lifeDuration = parseFloat32();
	ret.townTimer = parseFloat32();

	ret.difficulty = parseInt32();
	ret.scale = parseFloat32();
	ret.bravery = parseFloat32();
	ret.masterIndex = parseInt32();
	ret.dungeonSeed = parseInt32();
	ret.name = parseString(16);
	ret.ancestorName = parseString(16);
	ret.lineage = parseInt32();
	ret.isMerchant = parseBool();
	ret.merchantType = parseInt32();
	ret.gender = parseInt32();
	ret.headIndex = parseInt32();
	ret.hairIndex = parseInt32();
	ret.lastDungeonLevel = parseInt32();

	if (GAME == "OG") {
		ret.hasOpenPortal = parseBool();
		ret.portalDepth = parseUint32();
		ret.portalPosition = parseUint8Array(12);
	}
	if (GAME == "UR") {
		ret.portals = new Map();
		//NOTE lmao this member is uint32, but DEFAULT_REALM=0, the typedef key, and AddPortal() are all int32
		ret.lastRealm = 0;


		//TODO TODO TODO ANGELA
		ret.hasOpenPortal = parseBool();
		ret.portalDepth = parseUint32();
		ret.portalPosition = parseUint8Array(12);

		//const hasOpenPortal = parseBool();
		//const portalDepth = parseInt32();
		//const portalPosition = parseUint8Array(12);


		if (ret.hasOpenPortal /*TODO TODO TODO angela hasOpenPortal, the line below too*/)
			ret.portals.set(0, { portalDepth: ret.portalDepth, portalPosition: ret.portalPosition });
	}

	ret.position = parseUint8Array(12);
	ret.orientation = parseUint8Array(64);

	ret.level = parseInt32();
	ret.experience = parseInt32();
	ret.hp = parseFloat32();
	ret.maxHp = parseInt32();
	ret.fame = parseInt32();
	ret.fameRank = parseInt32();
	ret.stamina = parseFloat32();
	ret.maxStamina = parseInt32();
	ret.mana = parseFloat32();
	ret.maxMana = parseInt32();
	ret.toHitBonus = parseInt32();
	ret.originalToHitBonus = parseInt32();
	ret.naturalArmor = parseInt32();
	ret.originalNaturalArmor = parseInt32();
	ret.experienceAward = parseInt32();
	ret.fameAward = parseInt32();
	ret.unusedStatPoints = parseInt32();
	ret.unusedSkillPoints = parseInt32();
	ret.unique = parseBool();

	//NOTE stand-in
	ret.damageResistance = [];
	for (let i = 0; i < 8; ++i)
		ret.damageResistance.push(parseInt32());

	ret.skills = [];
	for (let i = 0; i < 15; ++i)
		ret.skills.push(parseInt32());

	ret.knownSpells = [[], [], []];
	for (let i = 0; i < 3; ++i)
		for (let j = 0; j < 6; ++j)
			ret.knownSpells[i].push(parseString(16));

	ret.activeSpellName = parseString(16);
	ret.strength = parseInt32();
	ret.originalStrength = parseInt32();
	ret.dexterity = parseInt32();
	ret.originalDexterity = parseInt32();
	ret.vitality = parseInt32();
	ret.originalVitality = parseInt32();
	ret.magic = parseInt32();
	ret.originalMagic = parseInt32();
	ret.walkingSpeed = parseFloat32();
	ret.runningSpeed = parseFloat32();
	ret.gold = parseInt32();

	//TODO is this code covered?
	//TODO leaving here for TS-isnt this all fucked?
	ret.effects = [[], []];
	for (let i = 0; i < 2; ++i) {
		const n = parseInt32();
		for (let j = 0; j < n; ++j)
			ret.effects[i].push(parseEffect());
	}

	let n = parseUint32();
	ret.itemInstances = [];
	for (let i = 0; i < n; ++i)
		ret.itemInstances.push(parseItem());

	n = parseUint32()
	ret.quests = [];
	for (let i = 0; i < n; ++i)
		ret.quests.push(parseQuest());

	if (parseUint32())
		ret.masterQuest = parseQuest();

	//NOTE wt seems to have only 8, steam 9
	if (GAME == "UR") {
		if (ret.version >= 0)
			ret.lastRealm = parseUint32();
		if (ret.version >= 1) {
			ret.wholeExistenceTime = parseUint32();
			ret.partExistenceTime = parseFloat32();
		}
		//TODO dubious ... apparently writing writes -1, so does that appear in saves? then does -1 cannabalize 0?
		if (ret.version >= 2) {
			//DEFAULT_REALM = 0
			const portalRealm = parseInt32();
			if (portalRealm != 0 && ret.portals.has(0)) {
				ret.portals.set(portalRealm, ret.portals.get(0));
				ret.portals.delete(0);
			}
		}
		if (ret.version >= 4) {
			//TODO believe this is all covered, ARGONAUT and BURNING SWATHE
			let n = parseInt16();
			ret.heroes = [];
			for (let i = 0; i < n; ++i)
				ret.heroes.push(parseString(16));
		}
		if (ret.version >= 5) {
			//TODO is all this code covered?
			n = parseInt16();
			ret.realmsComplete = [];
			for (let i = 0; i < n; ++i)
				ret.realmsComplete.push(parseUint32());
		}
		if (ret.version >= 6) {
			n = parseInt16();
			ret.damageResistance = [];
			for (let i = 0; i < n; ++i)
				ret.damageResistance.push(parseInt32());
		}

		//TODO try to make sense of this
		ret.postCount = 0;
		if (ret.version >= 7)
			ret.postCount = parseInt32();
		ret.deathCount = ret.postCount;

		if (ret.version >= 8) {
			//NOTE lmao reading into uint32, but when writing a signed is written
			const nPortals = parseUint32();
			//should be safe; portals = new Map() above in a GAME == UR block 
			for (let i = 0; i < nPortals; ++i)
				ret.portals.set(parseInt32(), { portalDepth: parseInt32(), portalPosition: parseUint8Array(12) });
		}

		if (ret.version >= 9)
			ret.deathCount = parseUint32();
	}

	return ret;
}

function parseHistory() {
	let ret = {
		sentinel: undefined, //UR
		version: undefined,  //UR
		realm: undefined     //UR versioning
	};

	if (GAME == "UR") {
		ret.sentinel = parseInt16();
		if (ret.sentinel != -1)
			parsingError(`UR history sentinel not -1, instead ${ret.sentinel} (int16 @ ${robj.i - 2})`);
		ret.version = parseUint16();
		if (ret.version != 1)
			console.log(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR history version not 1, instead ${ret.version} (uint16 @ ${robj.i - 2})`);
	}

	ret.level = parseUint32();
	ret.width = parseUint32();
	ret.height = parseUint32();
	if (GAME == "OG")
		ret.lastPopulationTime = parseFloat32();
	else //if (GAME == "UR")
		//TODO its actually (uint32) parseFloat32() so maybe if the thing returns negative, log an error? 
		ret.lastPopulationTime = Math.floor(parseFloat32());

	ret.visibilityData = new Uint8Array(ret.width * ret.height);
	for (let i = 0; i < ret.width; ++i)
		for (let j = 0; j < ret.height; ++j)
			ret.visibilityData[i * ret.height + j] = parseBool();

	let n = parseUint32();
	ret.characterHistory = [];
	for (let i = 0; i < n; ++i)
		ret.characterHistory.push(parseCharacter());

	n = parseUint32();
	ret.itemHistory = [];
	for (let i = 0; i < n; ++i)
		ret.itemHistory.push(parseItem());

	if (GAME == "UR") {
		if (ret.version >= 0)
			ret.realm = parseInt32();
		if (ret.version >= 1)
			ret.lastPopulationTime = parseUint32();
	}

	return ret;
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// WRITING

function downloadFile(clickEv) {
	wobj.i = 0;
	write();

	const bURL = URL.createObjectURL(new Blob([wobj.ab.slice(0, wobj.i)], { type: "application/octet-stream" }));

	const clickThis = document.createElement("a");
	clickThis.setAttribute("target", "_blank");
	clickThis.setAttribute("href", bURL);
	clickThis.setAttribute("download", "FFDEditorGenerated.FFD");
	document.body.appendChild(clickThis);
	clickThis.click();
	clickThis.remove();
}

//TODO ANGELA going through download steamUR
//TODO eventually might you want to wrap every function within an object?
const wobj =
{
	ab: new ArrayBuffer(4096),
	dv: undefined,
	i: 0,
	resize: function(atLeast) {
		if (atLeast <= wobj.ab.byteLength)
			return;
		let newSize = wobj.ab.byteLength * 2;
		for (; newSize < atLeast; newSize *= 2);

		wobj.ab = new ArrayBuffer(newSize);
		const olddv = wobj.dv;
		wobj.dv = new DataView(wobj.ab);
		for (let j = 0; j < wobj.i; ++j)
			wobj.dv.setUint8(j, olddv.getUint8(j));
	}
};
wobj.dv = new DataView(wobj.ab);

function writeBool(b) {
	wobj.resize(wobj.i + 1);
	wobj.dv.setUint8(wobj.i, b);
	wobj.i += 1;
}

function writeInt32(n) {
	wobj.resize(wobj.i + 4);
	wobj.dv.setInt32(wobj.i, n, true);
	wobj.i += 4;
}

function writeUint32(n) {
	wobj.resize(wobj.i + 4);
	wobj.dv.setUint32(wobj.i, n, true);
	wobj.i += 4;
}

function writeInt16(n) {
	wobj.resize(wobj.i + 2);
	wobj.dv.setInt16(wobj.i, n, true);
	wobj.i += 2;
}

function writeUint16(n) {
	wobj.resize(wobj.i + 2);
	wobj.dv.setUint16(wobj.i, n, true);
	wobj.i += 2;
}

function writeFloat32(f) {
	wobj.resize(wobj.i + 4);
	wobj.dv.setFloat32(wobj.i, f, true);
	wobj.i += 4;
}

function writeUint8Array(a) {
	wobj.resize(wobj.i + a.byteLength);
	for (let i = 0; i < a.byteLength; ++i)
		wobj.dv.setUint8(wobj.i++, a[i]);
}

function writeString(s, bits) {
	wobj.resize(wobj.i + (bits == 16 ? 2 : 4) + s.length);
	(bits == 16 ? writeUint16 : writeUint32)(s.length);
	for (let i = 0; i < s.length; ++i)
		wobj.dv.setUint8(wobj.i++, s.charCodeAt(i));
}

function writeEffect(e) {
	writeString(e.name, 16);
	writeString(e.message, 16);
	writeBool(e.exclusive);
	writeInt32(e.type);
	writeInt32(e.damageType);
	writeBool(e.positive);
	writeInt32(e.activation);
	writeInt32(e.chanceOfSuccess);
	writeInt32(e.chanceOfSuccessBonus);
	writeInt32(e.chanceOfSuccessBonusPercent);
	writeInt32(e.duration);
	writeInt32(e.durationBonus);
	writeInt32(e.durationBonusPercent);
	writeFloat32(e.value);
	writeFloat32(e.valueBonus);
	writeFloat32(e.valueBonusPercent);
	writeFloat32(e.value2);
	writeFloat32(e.value2Bonus);
	writeFloat32(e.value2BonusPercent);
	writeFloat32(e.value3);
	writeFloat32(e.value3Bonus);
	writeFloat32(e.value3BonusPercent);
	writeFloat32(e.priceMultiplier);
}

function writeItem(it) {
	if (GAME == "UR") {
		if (it.sentinel != -1)
			logError(`UR item sentinel not -1, instead ${it.sentinel} (int16 @ ${wobj.i})`);
		writeInt16(it.sentinel);
		if (it.version != 1)
			logWarning(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR item version not 1, instead ${it.version} (uint16 @ ${wobj.i})`);
		writeUint16(it.version);
	}

	writeString(it.baseName, 16);
	writeString(it.name, 16);
	writeInt32(it.slotIndex);
	writeBool(it.equipped);
	writeInt32(it.value);
	writeBool(it.open);

	writeUint8Array(it.position);
	writeUint8Array(it.orientation);

	writeInt32(it.uses);
	writeInt32(it.grade);
	writeBool(it.unique);
	writeBool(it.artifact);
	writeBool(it.identified);
	writeUint32(it.armorBonus);
	writeUint32(it.sockets);
	writeBool(it.canInteract);
	writeBool(it.operateable);
	writeBool(it.destructible);
	writeInt32(it.trapType);

	writeUint32(it.damageBonus.length);
	for (let i = 0; i < it.damageBonus.length; ++i) {
		writeInt32(it.damageBonus[i]);
		writeInt32(it.damageBonusValue[i]);
	}

	for (let i = 0; i < 2; ++i) {
		writeInt32(it.effects[i].length);
		for (let j = 0; j < it.effects[i].length; ++j)
			writeEffect(it.effects[i][j]);
	}

	writeUint32(it.items.length);
	for (let i = 0; i < it.items.length; ++i)
		writeItem(it.items[i]);

	if (GAME == "UR") {
		//VERSIONS
		if (it.version == 0)
			//NOTE version 0 reading reads into a throwaway and so heroID would be undefined-writing garbage here
			writeInt32(0xDEADBEEF);
		else //if version >= 1
			//NOTE source's reading is done into and writing is done from int32, but read/writeString() uses uint
			writeString(it.heroID, 32);
	}
}

function writeQuest(q) {
	if (GAME == "UR") {
		if (q.sentinel != -1)
			logError(`UR quest sentinel not -1, instead ${q.sentinel} (int16 @ ${wobj.i})`);
		writeInt16(q.sentinel);
		if (q.version != 4)
			logWarning(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR quest version not 4, instead ${q.version} (uint16 @ ${wobj.i})`);
		writeUint16(q.version);
	}

	writeInt32(q.level);
	writeInt32(q.type);
	writeBool(q.spawned);
	writeBool(q.completed);
	writeBool(q.completionNotified);
	writeInt32(q.questMonsterCount);
	writeInt32(q.questMonstersCompleted);
	writeInt32(q.questMinionCount);
	writeInt32(q.questMinionsCompleted);
	writeInt32(q.questItemCount);
	writeInt32(q.questItemsCompleted);
	writeUint32(q.goldReward);
	writeUint32(q.experienceReward);
	writeUint32(q.fameReward);
	writeString(q.questName, 16);
	writeString(q.questMonsterName, 16);
	writeString(q.questMonsterBaseName, 16);
	writeString(q.questMinionMonsterBaseName, 16);
	writeString(q.giverName, 16);
	writeString(q.questDescription, 16);
	writeString(q.questMiniDescription, 16);
	writeString(q.completionDescription, 16);
	writeString(q.incompleteDescription, 16);

	writeBool(q.questItem != undefined);
	if (q.questItem != undefined)
		writeItem(q.questItem);

	writeBool(q.itemReward != undefined);
	if (q.itemReward != undefined)
		writeItem(q.itemReward);

	if (GAME == "UR") {
		if (q.version >= 0)
			writeInt32(q.realm);
		if (q.version >= 2)
			writeBool(q.initialized);
		if (q.version >= 3)
			writeBool(q.hidden);
		if (q.version >= 4)
			writeInt32(q.state);
	}
}

function writeCharacter(c) {
	if (GAME == "UR") {
		if (c.sentinel != -1)
			logError(`UR character sentinel not -1, instead ${c.sentinel} (int16 @ ${wobj.i})`);
		writeInt16(c.sentinel);
		const expectVersion = DISTRIBUTION == "SG" ? 9 : 8;
		if (c.version != expectVersion)
			logWarning(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR character version not ${expectVersion}, instead ${version} (uint16 @ ${wobj.i})`);
		writeUint16(c.version);
	}

	writeString(c.templateName, 16);
	writeString(c.originalTemplateName, 16);

	//TODO c.existenceTime is undefined for UR
	writeFloat32(GAME == "UR" ? 0 : c.existenceTime);
	writeBool(c.isPlayer);

	if (c.isPlayer)
		for (let i = 0; i < c.journalStats.length; ++i)
			writeInt32(c.journalStats[i]);

	writeFloat32(c.transformationDuration);
	writeFloat32(c.lifeDuration);
	writeFloat32(c.townTimer);

	writeInt32(c.difficulty);
	writeFloat32(c.scale);
	writeFloat32(c.bravery);
	writeInt32(c.masterIndex);
	writeInt32(c.dungeonSeed);
	writeString(c.name, 16);
	writeString(c.ancestorName, 16);
	writeInt32(c.lineage);
	writeBool(c.isMerchant);
	writeInt32(c.merchantType);
	writeInt32(c.gender);
	writeInt32(c.headIndex);
	writeInt32(c.hairIndex);
	writeInt32(c.lastDungeonLevel);

	if (GAME == "OG") {
		writeBool(c.hasOpenPortal);
		writeUint32(c.portalDepth);
		writeUint8Array(c.portalPosition);
	}
	//TODO ANGELA my wtUR seems to write non-zeroed but according to source zeroed is written
	// so i'll just assume wtUR writes non-zeroes for now but see steam_gog and other wtURs
	if (GAME == "UR") {
		//TODO TODO TODO ANGELA 
		writeBool(c.hasOpenPortal);
		writeUint32(c.portalDepth);
		writeUint8Array(c.portalPosition);


		//writeBool(false); //hasOpenPortal
		//writeInt32(0); //portalDepth
		//writeUint8Array(new Uint8Array(12)); //portalPosition
	}

	writeUint8Array(c.position);
	writeUint8Array(c.orientation);

	writeInt32(c.level);
	writeInt32(c.experience);
	writeFloat32(c.hp);
	writeInt32(c.maxHp);
	writeInt32(c.fame);
	writeInt32(c.fameRank);
	writeFloat32(c.stamina);
	writeInt32(c.maxStamina);
	writeFloat32(c.mana);
	writeInt32(c.maxMana);
	writeInt32(c.toHitBonus);
	writeInt32(c.originalToHitBonus);
	writeInt32(c.naturalArmor);
	writeInt32(c.originalNaturalArmor);
	writeInt32(c.experienceAward);
	writeInt32(c.fameAward);
	writeInt32(c.unusedStatPoints);
	writeInt32(c.unusedSkillPoints);
	writeBool(c.unique);

	//NOTE stand in
	for (let i = 0; i < 8; ++i)
		writeInt32(c.damageResistance[i]);

	for (let i = 0; i < 15; ++i)
		writeInt32(c.skills[i]);

	for (let i = 0; i < 3; ++i)
		for (let j = 0; j < 6; ++j)
			writeString(c.knownSpells[i][j], 16);

	writeString(c.activeSpellName, 16);
	writeInt32(c.strength);
	writeInt32(c.originalStrength);
	writeInt32(c.dexterity);
	writeInt32(c.originalDexterity);
	writeInt32(c.vitality);
	writeInt32(c.originalVitality);
	writeInt32(c.magic);
	writeInt32(c.originalMagic);
	writeFloat32(c.walkingSpeed);
	writeFloat32(c.runningSpeed);
	//TODO just leaving this here i think traitor soul uses uint
	writeInt32(c.gold);

	for (let i = 0; i < 2; ++i) {
		writeInt32(c.effects[i].length);
		for (let j = 0; j < c.effects[i].length; ++j)
			writeEffect(c.effects[i][j]);
	}

	writeUint32(c.itemInstances.length);
	for (let i = 0; i < c.itemInstances.length; ++i)
		writeItem(c.itemInstances[i]);

	writeUint32(c.quests.length);
	for (let i = 0; i < c.quests.length; ++i)
		writeQuest(c.quests[i]);

	writeUint32(c.masterQuest == undefined ? 0 : 1);
	if (c.masterQuest != undefined)
		writeQuest(c.masterQuest);

	if (GAME == "UR") {
		if (c.version >= 0)
			writeUint32(c.lastRealm);
		if (c.version >= 1) {
			writeUint32(c.wholeExistenceTime);
			writeFloat32(c.partExistenceTime);
		}
		if (c.version >= 2)
			//TODO this seems dubious...check it out
			writeInt32(-1); //ANY_REALM
		if (c.version >= 4) {
			writeInt16(c.heroes.length);
			for (let i = 0; i < c.heroes.length; ++i)
				writeString(c.heroes[i], 16);
		}
		if (c.version >= 5) {
			writeInt16(c.realmsComplete.length);
			for (let i = 0; i < c.realmsComplete.length; ++i)
				writeInt32(c.realmsComplete[i]);
		}
		if (c.version >= 6) {
			writeInt16(c.damageResistance.length);
			for (let i = 0; i < c.damageResistance.length; ++i)
				writeInt32(c.damageResistance[i]);
		}
		if (c.version >= 7)
			writeInt32(c.postCount);

		if (c.version >= 8) {
			//NOTE lmao reading into uint32, but when writing a signed is written
			writeInt32(c.portals.size);
			for (const realm_depthPosition of c.portals) {
				writeInt32(realm_depthPosition[0]);
				writeInt32(realm_depthPosition[1].portalDepth);
				writeUint8Array(realm_depthPosition[1].portalPosition);
			}
		}

		if (c.version >= 9)
			writeInt32(c.deathCount);
	}
}

function writeHistory(h) {
	if (GAME == "UR") {
		if (h.sentinel != -1)
			logError(`UR history sentinel not -1, instead ${h.sentinel} (int16 @ ${wobj.i})`);
		writeInt16(h.sentinel);
		if (h.version != 1)
			logWarning(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR history version not 1, instead ${h.version} (uint16 @ ${wobj.i})`);
		writeUint16(h.version);
	}

	writeUint32(h.level);
	writeUint32(h.width);
	writeUint32(h.height);
	writeFloat32(GAME == "OG" ? h.lastPopulationTime : 0.0);

	writeUint8Array(h.visibilityData);

	writeUint32(h.characterHistory.length);
	for (let i = 0; i < h.characterHistory.length; ++i)
		writeCharacter(h.characterHistory[i]);

	writeUint32(h.itemHistory.length);
	for (let i = 0; i < h.itemHistory.length; ++i)
		writeItem(h.itemHistory[i]);

	if (GAME == "UR") {
		if (h.version >= 0)
			writeInt32(h.realm);
		if (h.version >= 1)
			writeUint32(h.lastPopulationTime);
	}
}

//assumes has been parsed, returns url
function write() {
	if (GAME == "UR") {
		if (robj.sentinel != -1)
			logError(`UR sentinel not -1, instead ${robj.sentinel} (int32 @ ${wobj.i})`);
		writeInt32(robj.sentinel);
		if (robj.version != 2)
			logWarning(`${DISTRIBUTION == "SG" ? 'steam_gog' : 'wt'}UR version not 2, instead ${robj.version} (uint32 @ ${wobj.i})`);
		writeUint32(robj.version);
	}

	writeBool(robj.mapVisible);
	writeInt32(robj.mapDolly);
	writeBool(robj.running);
	writeBool(robj.showingItems);

	for (let i = 0; i < 12; ++i)
		writeString(robj.hotkeySpellAssignment[i], 16);

	//NOTE stand-in
	//TODO ts may have even more than ur
	for (let i = 0; i < 19; ++i)
		writeBool(robj.tipSeen[i]);

	//TODO preoprocessor if block concerning FATEGOLD and realm arguments...i dont know :(
	writeCharacter(robj.player);

	writeUint32(robj.petList.length);
	for (let i = 0; i < robj.petList.length; ++i)
		writeCharacter(robj.petList[i]);

	writeUint32(robj.discoveryHistory.length);
	for (let i = 0; i < robj.discoveryHistory.length; ++i)
		writeHistory(robj.discoveryHistory[i]);

	if (DISTRIBUTION == "SG" && GAME == "OG") {
		writeString(robj.gemsCollected, 16);
		writeString(robj.fishCaught, 16);
		//writeBool(robj.disabledAchievements); //TODO however it seems nothing has this?
	}

	if (GAME == "UR") {
		if (robj.version >= 0) {
			writeUint32(robj.wardDescriptions.length);
			for (let i = 0; i < robj.wardDescriptions.length; ++i)
				writeCharacter(robj.wardDescriptions[i]);
		}
		if (robj.version >= 1) {
			writeUint32(robj.tipSeen.length);
			for (let i = 0; i < robj.tipSeen.length; ++i)
				writeBool(robj.tipSeen[i]);
		}
		//TODO angela does hash do its job-if i edit the file and keep the old hash, then the next load will trigger cheat?! try HC
		// but for now i just regurgitate the hash as read-what disadvantage is there to recomputing? 
		// test, with others too, hardcore
		if (robj.version >= 2) {
			writeString(robj.hash, 16);
			/*
			CCharacterSaveInstance * pInstance = new CCharacterSaveInstance();
			pPlayer -> FillInstance( * pInstance, pActiveLevel -> LevelDepth(), pActiveLevel -> LevelRealm());
			std::string hash = pInstance -> CalculateCharacterHash();
			DELETE_SAFELY(pInstance);

			uint16 Size = hash.length();
			fwrite( & Size, sizeof(uint16), 1, pFile);
			fwrite(hash.c_str(), sizeof(char) * Size, 1, pFile);
			*/
		}

		//Dream Pet Achivement
		if (DISTRIBUTION == "SG") {
			writeString(robj.fishList, 16);
			writeString(robj.cardList, 16);
		}

		//writeBool(robj.disabledAchievements); //TODO however it seems nothing has this?
	}
}


function promiseReadDat(datFile, datType)
{
	return new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onload = () => {
			res(reader.result);
		}
		reader.onerror = () => {
			ERR_MSGS.push(`Could not open a ${datType} (${datFile.name}; for your security I don't know full path).`);
			rej(); //TODO code cover this onerror part
		}
		reader.readAsText(datFile);
	});
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// dat Parsing

//TODO you can try to optimize within tokenizeNextLine() where if the first token cannot get you anything
// ie is not [SPELL], <NAME>, <SPHERE>, [something], [/.*]
// then you know not to continue tokenizing, just go to next line
// similarly, if you found [SPELL] or [something] or [/.*] then you can also go til next line
//TODO name collisions; sometimes there are intentional rewrites, then what? how do they do it?
//TODO does casing for MONSTER/ITEM/SPELL matter? or anywhere?
//TODO if fail, then reset the relevant globals eg _INFO's (there are a lot of globals to reset, good luck)
//TODO constructors ie CItemDescription, CItem, CItemSaveInstance, CItemInstance, CItemTemplate, etc

//also can optimize by ignoring everything until back in depth 0
//also can optimize by beelining til end of a nested subgroup
//also can optimize by ignoring line if the first token.size() < 3
//TODO easy: token[0].slice(1, -1) once and reuse!

//TODO how are you reading the data? force int invert? what does the game do? what if theres a float?

function tokenizeNextLine(dat, i, tokens)
{
    let delim0_token1 = false;
    let tokenStart = i;
    while (true)
    {
        if (dat[i] == '#' || i == dat.length || dat[i] == '\n')
        {
            if (delim0_token1) tokens.push(dat.slice(tokenStart, i));
            if (dat[i] == '#') for (; i < dat.length && dat[i] != '\n'; ++i);
            return i + 1;   
        }

        const isDelim = (dat[i] == ':' || dat[i] == '\t' || dat[i] == '\r'); 
        i += (isDelim ^ delim0_token1);
        if      (isDelim && delim0_token1)      tokens.push(dat.slice(tokenStart, i));
        else if (!isDelim && !delim0_token1)	tokenStart = i;
        if      (isDelim == delim0_token1)      delim0_token1 = !delim0_token1;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TODO monsters

async function promiseParseMonstersDat(datFile)
{
	return new Promise((res, rej) => {
		res(parseMonstersDat(datFile));
	});
}

function defaultizeMonsterTemplate(mo)
{
}
function undefineMonsterTemplate(mo)
{
}


//dont forget the eliting
async function parseMonstersDat(datFile)
{
	let dat = null;
	try {
		dat = await promiseReadDat(datFile, "monsters.dat"); //TODO for all three: might be useful to also do "monsters.dat (n)"
	} catch (e) { //TODO OUTPUT ERROR
		return;
	}

	let i = 0;
    let depth = 0, inMonster = false;

	//TODO how many do you need?
	const mo = {
	};

    while (true)
    {
        let tokens = [];
        if ((i = tokenizeNextLine(dat, i, tokens)) >= dat.length)
            break;
        if (!tokens.length || tokens[0].length < 3)
            continue;
        
        if (inMonster && depth == 1 && tokens[0][0] == '<' && tokens[0].at(-1) == '>')
        {
            if (tokens.length == 1)
			{
				//TODO error for any type of tag, if that tag needs many attributes
				ERR_MSGS.push(`monsters.dat: The line before ${i} has too few tokens (Which? For your security I can't know).`);
				return;
			}

			//TODO
			// if (it.merchantMaximum === undefined && tokens[0].slice(1, -1) == "MERCHANT_MAXIMUM")
			// 	it.merchantMaximum = RANK == KRankNormal ? parseInt(tokens[1], 10) + KRANKLEVELOFFSET : 32000;
        }
        else if (tokens[0][0] == '[' && tokens[0][1] == '/' && tokens[0].at(-1) == ']')
        {
            if (depth == 0)
			{
                ERR_MSGS.push(`monsters.dat: The line before ${i} has a bad end tag (Which? For your security I can't know).`);
				return;
			}
            if (depth == 1 && inMonster)
            {
				defaultizeMonsterTemplate(mo);
				if (false /*validation*/)
				{
					ERR_MSGS.push(`monsters.dat: The monster before ${i} BRUHBRUHBRUH`);
					return;
				}
            	MONSTERS_INFO.set(mo.name, mo); //TODO what to do with duplicate names?
				undefineMonsterTemplate(mo);
				//TODO in CCharacterDescription() there is some stuff
				inMonster = false;
            }
            --depth;
        }
        else if (tokens[0][0] == '[' && tokens[0].at(-1) == ']')
        {
            if (depth == 0 && tokens[0].slice(1, -1) == "MONSTER")
                inMonster = true;
            ++depth;
        }
    }

    if (inMonster)
	{
		defaultizeMonsterTemplate(mo);
		if (false /*validation*/)
		{
			ERR_MSGS.push(`monsters.dat: The monster before ${i} BRUHBRUHBRUH`);
			return;
		}
		MONSTERS_INFO.set(mo.name, mo); //TODO what to do with duplicate names?
		//TODO in CCharacterDescription() there is some stuff
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ITEMTYPE_STR_INT = new Map([["NONE", 0], ["STAIRSUP", 1], ["STAIRSDOWN", 2], ["TOWNPORTAL", 3], ["DUNGEONPORTAL", 4],
	["FISHINGHOLE", 5], ["GOLD", 6], ["GENERIC", 7], ["POTION", 8], ["WEAPONRACK", 9], ["CONTAINER", 10], ["CHESTSMALL", 11], ["CHESTMEDIUM", 12],
	["CHESTLARGE", 13], ["SWORD", 14], ["CLUB", 15], ["HELMET", 16], ["SHIELD", 17], ["SPEAR", 18], ["BOW", 19], ["BELT", 20], ["NECKLACE", 21], ["RING", 22],
	["GLOVES", 23], ["BOOTS", 24], ["SHIRT", 25], ["POLEARM", 26], ["SCROLL", 27], ["BOOK", 28], ["SPELL", 29], ["AXE", 30], ["HAMMER", 31], ["STAFF", 32],
	["CROSSBOW", 33], ["GEM", 34], ["PETFOOD", 35], ["FISHINGPOLE", 36], ["MAGICANVIL", 37], ["SHRINE", 38], ["FOUNTAIN", 39], ["THRONE", 40], ["STATUE", 41],
	["HEALFOUNTAIN", 42], ["MANAFOUNTAIN", 43], ["STAMINAFOUNTAIN", 44], ["WELLNESSFOUNTAIN", 45]]);

const ITEMTYPES_ARMS = new Set([14, 15, 16, 17, 18, 19, 20, 23, 24, 25, 26, 30, 31, 32, 33]);

const ATTACKSPEED_STR_INT = new Map([["SLOWEST", 0], ["SLOW", 1], ["NORMAL", 2], ["FAST", 3], ["FASTEST", 4]]);

const GRADE_STR_INT = new Map([["", 0], ["SUPERIOR", 1], ["EXCEPTIONAL", 2], ["FLAWLESS", 3]]);

const RANK_ITEM_RARITY_MULTIPLIER = [1.0, 5.0, 10.0];
const RANK_POWER_MULTIPLIER = [1.0, 2.0, 4.0];
const RANK_LEVEL_OFFSET = [0, 12, 30];
const RANK_INT_STR = ["", "Elite", "Legendary"]

async function promiseParseItemsDat(datFile)

{
	return new Promise((res, rej) => {
		res(parseItemsDat(datFile));
	});
}

function defaultizeItemTemplate(it)
{
	if (it.type === undefined)				it.type = ITEMTYPE_STR_INT.get("GENERIC");
	if (it.name === undefined)				it.name = "";
	if (it.effects === undefined)			it.effects = [];
	if (it.bonuses === undefined)			it.bonuses = [];
	if (it.armor === undefined)				it.armor = [0, 0];
	if (it.damage === undefined)			it.damage = [0, 0];
	if (it.toHitBonus === undefined)		it.toHitBonus = 0;
	if (it.sockets === undefined)			it.sockets = 0;
	if (it.speed === undefined)				it.speed = ATTACKSPEED_STR_INT.get("NORMAL");
	if (it.requires === undefined)			it.requires = [];
	if (it.grade === undefined)				it.grade = GRADE_STR_INT.get("");
	if (it.icon === undefined)				it.icon = "";
	if (it.iconWidth === undefined)			it.iconWidth = INV_SLOT_SIZE;
	if (it.iconHeight === undefined)		it.iconHeight = INV_SLOT_SIZE;
	if (it.unique === undefined)			it.unique = false;
	if (it.identified === undefined)		it.identified = false;
	if (it.rarity === undefined)			it.rarity = 1;
	if (it.fishingRarity === undefined)		it.fishingRarity = 1000;
	if (it.minimumDepth === undefined)		it.minimumDepth = 1;
	if (it.maximumDepth === undefined)		it.maximumDepth = 32000;
	if (it.minimumFishingDepth === undefined) it.minimumFishingDepth = 1
	if (it.maximumFishingDepth === undefined) it.maximumFishingDepth = 32000
	if (it.merchantMinimum === undefined)	it.merchantMinimum = 0;
	if (it.merchantMaximum === undefined)	it.merchantMaximum = 100;
}
function undefineItemTemplate(it)
{
	it.type = undefined;				
	it.name = undefined;				
	it.effects = undefined;
	it.bonuses = undefined;
	it.armor = undefined;				
	it.damage = undefined;				
	it.toHitBonus = undefined;			
	it.sockets = undefined;				
	it.speed = undefined;				
	it.requires = undefined;
	it.grade = undefined;				
	it.icon = undefined;		
	it.iconWidth = undefined;
	it.iconHeight = undefined;		
	it.unique = undefined;				
	it.identified = undefined;			
	it.rarity = undefined;				
	it.fishingRarity = undefined;		
	it.minimumDepth = undefined;		
	it.maximumDepth = undefined;		
	it.minimumFishingDepth = undefined;	
	it.maximumFishingDepth = undefined;	
	it.merchantMinimum = undefined;		
	it.merchantMaximum = undefined;		
}

//TODO everywhere, considerf case sensitivity particularly for input values and equality in-code eg Map
function addTemplateItem(it)
{
	for (rank in [0, 1, 2])
	{
		if (rank == 1 && (it.type === undefined || !ITEMTYPES_ARMS.has(it.type) ||
			it.maximumDepth !== undefined && it.maximumDepth < 12))
			break;

		const it2 = structuredClone(it);
		if (rank >= 1)
			it2.name = `${RANK_INT_STR[rank]} ${it2.name}`;

		//TODO bonuses...

		if (it2.armor !== undefined)
		{
			it2.armor[0] = it2.armor[0] * RANK_POWER_MULTIPLIER[rank];
			it2.armor[1] = it2.armor[1] * RANK_POWER_MULTIPLIER[rank];
		}
		if (it2.damage !== undefined)
		{
			it2.damage[0] = it2.damage[0] * RANK_POWER_MULTIPLIER[rank];
			it2.damage[1] = it2.damage[1] * RANK_POWER_MULTIPLIER[rank];
		}

		if (it2.rarity !== undefined)
			it2.rarity = it2.rarity < 1000 ? Math.min(999, it2.rarity * RANK_ITEM_RARITY_MULTIPLIER[rank]) : it2.rarity;
		if (it2.fishingRarity !== undefined)
			it2.fishingRarity = it2.fishingRarity < 1000 ? Math.min(999, Math.trunc(it2.fishingRarity * RANK_POWER_MULTIPLIER[rank] * 0.985)) : it2.fishingRarity;

		if (it2.minimumFishingDepth !== undefined)
			it2.minimumFishingDepth += RANK_LEVEL_OFFSET[rank];
		if (it2.maximumFishingDepth !== undefined)
			it2.maximumFishingDepth = rank == 0 ? it2.maximumFishingDepth + RANK_LEVEL_OFFSET[rank] : 32000;

		if (it2.minimumDepth !== undefined)
		{
			it2.minimumDepth += RANK_LEVEL_OFFSET[rank];
			if (it2.minimumFishingDepth === undefined)
				it2.minimumFishingDepth = it2.minimumDepth;

			if (rank == 2)
			{
				const renown = Math.max(0, Math.min(10, Math.trunc((it2.minimumDepth + 15) / 7))) + 9;
				//TODO add renown req
			}
			else if (rank == 1)
			{
				const renown = Math.max(0, Math.min(10, Math.trunc((it2.minimumDepth - 3) / 10)) + 4);
				//TODO add renown req
			}
		}

		if (it2.maximumDepth !== undefined)
		{
			it2.maximumDepth = (rank == 0 ? it2.maximumDepth + RANK_LEVEL_OFFSET[rank] : 32000);
			if (it2.maximumFishingDepth === undefined)
				it2.maximumFishingDepth = it2.maximumDepth;
		}

		if (it2.merchantMinimum !== undefined)
			it2.merchantMinimum += RANK_LEVEL_OFFSET[rank];
		if (it2.merchantMaximum !== undefined)
			it2.merchantMaximum = rank == 0 ? it2.merchantMaximum + RANK_LEVEL_OFFSET[rank] : 32000;

		defaultizeItemTemplate(it2);
		ITEMS_INFO.set(it2.name.toUpperCase(), it2); //TODO what to do with duplicate names?
	}
}

//TODO for force spawning, remember that Item() has stuff inside it too. what is ItemInstance?
//TODO vars, updates, sets
//dont forget the eliting
	//TODO if i index into tokens does that shit actually give me a string?
async function parseItemsDat(datFile)
{
	let dat = null;
	try {
		dat = await promiseReadDat(datFile, "items.dat");
	} catch (e) { //TODO OUTPUT ERROR
		return;
	}

	let i = 0;
    let depth = 0, inItem = false;

	//TODO if you want to be able to spawn things in then you might need everything...
	const it = {
		type: undefined,				//KItemGeneric
		name: undefined,				//""
		effects: undefined,
		bonuses: undefined,
		armor: undefined,				//[0,0]
		damage: undefined,				//[0,0]
		toHitBonus: undefined,			//0
		sockets: undefined,				//0
		speed: undefined,				//KAttackNormal
		requires: undefined,
		grade: undefined,				//KGradeNormal
		icon: undefined,				//""
		unique: undefined,				//false
		identified: undefined,			//false
		rarity: undefined,				//1
		fishingRarity: undefined,		//1000
		minimumDepth: undefined,		//1
		maximumDepth: undefined,		//32000
		minimumFishingDepth: undefined,	//1
		maximumFishingDepth: undefined,	//32000
		merchantMinimum: undefined,		//0
		merchantMaximum: undefined		//100
	};

    while (true)
    {
        let tokens = [];
        if ((i = tokenizeNextLine(dat, i, tokens)) >= dat.length)
            break;
        if (!tokens.length || tokens[0].length < 3)
            continue;
        
        if (inItem && depth == 1 && tokens[0][0] == '<' && tokens[0].at(-1) == '>')
        {
            if (tokens.length == 1)
			{
				//TODO error for any type of tag, if that tag needs many attributes
				ERR_MSGS.push(`items.dat: The line before ${i} has too few tokens (Which? For your security I can't know).`);
				return;
			}
            if (it.type === undefined && tokens[0].slice(1, -1) == "TYPE")
			{
				const upper = tokens[1].toUpperCase();
				it.type = ITEMTYPE_STR_INT.has(upper) ? ITEMTYPE_STR_INT.get(upper) : undefined;
			}
			else if (it.name === undefined && tokens[0].slice(1, -1) == "NAME")
				it.name = tokens[1];
			//TODO effects...
			//TODO bonuses...
			else if (it.armor === undefined && tokens[0].slice(1, -1) == "ARMOR")
			{
				if (tokens.length < 3)
				{
					ERR_MSGS.push(`items.dat: The line before ${i} has too few tokens (Which? For your security I can't know).`);
					return;	
				}
				it.armor = [parseInt(tokens[1], 10), parseInt(tokens[2], 10)];
			}
			else if (it.damage === undefined && tokens[0].slice(1, -1) == "DAMAGE")
			{
				if (tokens.length < 3)
				{
					ERR_MSGS.push(`items.dat: The line before ${i} has too few tokens (Which? For your security I can't know).`);
					return;	
				}
				it.damage = [parseInt(tokens[1], 10), parseInt(tokens[2], 10)];
			}
			else if (it.toHitBonus === undefined && tokens[0].slice(1, -1) == "TOHITBONUS")
				it.toHitBonus = parseInt(tokens[1], 10) //TODO eliting
			else if (it.sockets === undefined && tokens[0].slice(1, -1) == "SOCKETS")
				it.sockets = parseInt(tokens[1], 10) //TODO eliting, but also capped?
				// int32 Sockets = pItem.Sockets();
				// if( Sockets > m_SlotsTall )
				// {
				// 	Sockets = m_SlotsTall;
				// }
				// SetSockets( Sockets );
			else if (it.speed === undefined && tokens[0].slice(1, -1) == "SPEED")	
			{
				const upper = tokens[1].toUpperCase();
				it.speed = ATTACKSPEED_STR_INT.has(upper) ? ATTACKSPEED_STR_INT.get(upper) : ATTACKSPEED_STR_INT.get("NORMAL");
			}
			//TODO requires...
			else if (it.grade === undefined && tokens[0].slice(1, -1) == "GRADE")
			{
				const upper = tokens[1].toUpperCase();
				it.grade = GRADE_STR_INT.has(upper) ? GRADE_STR_INT.get(upper) : GRADE_STR_INT.get("");
			}
			else if (it.icon === undefined && tokens[0].slice(1, -1) == "ICON")
			{
				it.icon = tokens[1];
				if (tokens.length > 4) {it.iconWidth = parseInt(tokens[3]); it.iconHeight = parseInt(tokens[4]);}
			}
			else if (it.unique === undefined && tokens[0].slice(1, -1) == "UNIQUE")
				it.unique = (tokens[1] == "1")
			else if (it.identified === undefined && tokens[0].slice(1, -1) == "IDENTIFIED")
				it.identified = (tokens[1] == "1")
			//TODO TODO TODO ANGELA artifact
				// if( !IsArtifact() &&
				// 	!IsUnique() )
				// {
				// 	SetIdentified( kTrue );
				// } TODO
			else if (it.rarity === undefined && tokens[0].slice(1, -1) == "RARITY")
				it.rarity = parseInt(tokens[1], 10);
			else if (it.fishingRarity === undefined && tokens[0].slice(1, -1) == "FISHING_RARITY")
				it.fishingRarity = parseInt(tokens[1], 10);
			else if (it.minimumDepth === undefined && tokens[0].slice(1, -1) == "MINIMUM_DEPTH")
				it.minimumDepth = parseInt(tokens[1], 10);
			else if (it.maximumDepth === undefined && tokens[0].slice(1, -1) == "MAXIMUM_DEPTH")
				it.maximumDepth = parseInt(tokens[1], 10);
			else if (it.minimumFishingDepth === undefined && tokens[0].slice(1, -1) == "MINIMUM_FISHING_DEPTH")
				it.minimumFishingDepth = parseInt(tokens[1], 10);
			else if (it.maximumFishingDepth === undefined && tokens[0].slice(1, -1) == "MAXIMUM_FISHING_DEPTH")
				it.maximumFishingDepth = parseInt(tokens[1], 10);
			else if (it.merchantMinimum === undefined && tokens[0].slice(1, -1) == "MERCHANT_MINIMUM")
				it.merchantMinimum = parseInt(tokens[1], 10);
			else if (it.merchantMaximum === undefined && tokens[0].slice(1, -1) == "MERCHANT_MAXIMUM")
				it.merchantMaximum = parseInt(tokens[1], 10);
        }
        else if (tokens[0][0] == '[' && tokens[0][1] == '/' && tokens[0].at(-1) == ']')
        {
            if (depth == 0)
			{
                ERR_MSGS.push(`items.dat: The line before ${i} has a bad end tag (Which? For your security I can't know).`);
				return;
			}
            if (depth == 1 && inItem)
            {
				if (it.name === undefined/* || it.icon === undefined*/) //TODO items like barrels; what can[t] you force spawn/inventory?
				{
					ERR_MSGS.push(`items.dat: The item before ${i} has no name or no icon`);
					return;
				}

				addTemplateItem(it);				
				undefineItemTemplate(it);
				//TODO in CItemDescription() there is some name stuff...from whence was the sockets stuff?
				inItem = false;
            }
            --depth;
        }
        else if (tokens[0][0] == '[' && tokens[0].at(-1) == ']')
        {
            if (depth == 0 && tokens[0].slice(1, -1) == "ITEM")
                inItem = true;
            ++depth;
        }
    }

    if (inItem)
	{
		if (it.name === undefined/* || it.icon === undefined*/)
		{
			ERR_MSGS.push(`items.dat: The item before ${i} has no name or no icon`);
			return;
		}
		addTemplateItem(it);
		//TODO in CItemDescription() there is some name stuff	
	}
}


async function promiseParseSpellsDat(datFile)
{
	return new Promise((res, rej) => {
		res(parseSpellsDat(datFile));
	});
}

//TODO uploads reset whats there, so you cant upload A/spells.dat and then cd into B then B/spells.dat
// or at least not easily, so override that behavior. but then that means you will need to have a clear button
//TODO name collisions; sometimes there are intentional rewrites, then what? how do they do it?
//TODO are attack defense charm values in dat case insensitive? for that matter, anything else?
const K_MAGIC_CHARM = 2;
async function parseSpellsDat(datFile)
{
	let dat = null;
	try {
		dat = await promiseReadDat(datFile, "spells.dat");
	} catch (e) { //TODO OUTPUT ERROR
		return;
	}

	let i = 0;
    let depth = 0, inSpell = false;
    let name = undefined, sphere = undefined;

    while (true)
    {
        let tokens = [];
        if ((i = tokenizeNextLine(dat, i, tokens)) >= dat.length)
            break;
        if (!tokens.length || tokens[0].length < 3)
            continue;
        
        if (inSpell && depth == 1 && tokens[0][0] == '<' && tokens[0].at(-1) == '>')
        {
            if (tokens.length == 1)
			{
				ERR_MSGS.push(`spells.dat: The line before ${i} has too few tokens (Which? For your security I can't know).`);
				return;
			}
            if (name === undefined && tokens[0].slice(1, -1) == "NAME")
                name = tokens[1];
            else if (sphere === undefined && tokens[0].slice(1, -1) == "SPHERE")
                sphere = tokens[1];
        }
        else if (tokens[0][0] == '[' && tokens[0][1] == '/' && tokens[0].at(-1) == ']')
        {
            if (depth == 0)
			{
                ERR_MSGS.push(`spells.dat: The line before ${i} has a bad end tag (Which? For your security I can't know).`);
				return;
			}
            if (depth == 1 && inSpell)
            {
				if (name === undefined)
				{
					ERR_MSGS.push(`spells.dat: The spell before ${i} has no name.`);
					return;
				}
            	SPELLS_INFO.set(name, sphere);
                inSpell = false;
                name = undefined, sphere = undefined;
            }
            --depth;
        }
        else if (tokens[0][0] == '[' && tokens[0].at(-1) == ']')
        {
            if (depth == 0 && tokens[0].slice(1, -1) == "SPELL")
                inSpell = true;
            ++depth;
        }
    }

    if (inSpell)
	{
		if (name === undefined)
		{
			ERR_MSGS.push(`spells.dat: The spell before ${i} has no name.`);
			return;
		}
		SPELLS_INFO.set(name, sphere);
	}
}

//ITEMS-not sure if this is exhaustive

// EGrade				m_Grade;
// std::string			m_Name;
// std::string			m_EnterableName;
// std::string			m_UseDescription;
// bool				m_IsUnique;
// bool				m_IsArtifact;
// bool				m_Collideable;
// bool				m_Useable;
// bool				m_Purchaseable;
// float32				m_ScaleVariation;
// EItemType			m_Type;
// EItemCategory		m_Category;
// int32				m_ToHitBonus;
// int32				m_Value;
// int32				m_Uses;
// uint32				m_MinimumArmorBonus;
// uint32				m_MaximumArmorBonus;
// uint32				m_MinimumDamage;
// uint32				m_MaximumDamage;
// int32				m_MerchantMinimum;
// int32				m_MerchantMaximum;
// bool				m_Takeable;
// bool				m_Destructible;
// bool				m_Identified;
// ETarget				m_Target;
// EAttackSpeed		m_Speed;
// std::vector< CEffect* >			m_pEffects;
// std::vector< EStatistic >		m_RequirementStatistic;
// std::vector< uint32 >			m_RequirementValue;
// std::string			m_IconPath;
// std::string			m_IconAlphaPath;
// uint32				m_IconWidth;
// uint32				m_IconHeight;
// std::vector< EDamageType >		m_DamageBonus;
// std::vector< int32 >			m_DamageBonusValue;
// int32				m_Rarity;
// int32				m_FishingRarity;
// int32				m_MinimumDepth;
// int32				m_MaximumDepth;
// int32				m_MinimumFishingDepth;
// int32				m_MaximumFishingDepth;
// uint32				m_Sockets;