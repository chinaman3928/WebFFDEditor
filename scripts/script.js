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
//  items
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


const runButton = document.getElementById("runButton");	
runButton.addEventListener("click", preRun);


MONSTERS_INFO = new Map();
ITEMS_INFO = new Map();
SPELLS_INFO = new Map();

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

	if (ERR_MSGS.length)
	{
		alert(["Failed to run for these reasons (no changes made):", ...ERR_MSGS].join('\n - '));
		//reset the relevant globals;
	}
	else
	{
		//run();
	}
}

const PLAYER_TAB =
{
	opened: false,
	elem: document.getElementById("playerTab"),
	stack: []
};

// function run()
// {
// 	for (each of the tab links)
// 	{
// 		make it interactable;
// 	}

// 	hide the uploadScreen;

// 	switchPlayerTab();
// 	//eventually need to reset relevant globals too...
// 	// and unhide the uploadScreen...
// }

// function switchPlayerTab()
// {
// 	make PLAYER_TAB the active tab;



// 	unhide the player tab;


// }


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
//TODO would you want to warn about name collisions?

//also can optimize by ignoring everything until back in depth 0
//also can optimize by beelining til end of a nested subgroup
//also can optimize by ignoring line if the first token.size() < 3

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

async function promiseParseSpellsDat(datFile)
{
	return new Promise((res, rej) => {
		res(parseSpellsDat(datFile));
	});
}

//TODO error if empty NAME?
// also for sphere, stays default charm if the value doesnt match anything
//TODO uploads reset whats there, so you cant upload A/spells.dat and then cd into B then B/spells.dat
// or at least not easily, so override that behavior. but then that means you will need to have a clear button
//TODO also if there are multiple occurrences of same name, then what does game do?
//TODO still have to test nesting
//TODO are attack defense charm values in dat case insensitive? for that matter, anything else?
const K_MAGIC_CHARM = 2;
async function parseSpellsDat(datFile)
{
	let dat = null;
	try {
		dat = await promiseReadDat(datFile, "spells.dat");
	} catch (e) {
		return;
	}

	let i = 0;
    let depth = 0, inSpell = false;
    let theName = "", lookingForName = true;
    let theSphere = K_MAGIC_CHARM, lookingForSphere = true;

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
            if (lookingForName && tokens[0].slice(1, -1) == "NAME")
                theName = tokens[1], lookingForName = false;
            else if (lookingForSphere && tokens[0].slice(1, -1) == "SPHERE")
                theSphere = tokens[1], lookingForSphere = false;
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
            SPELLS_INFO.set(theName, theSphere); //TODO validation etc
                inSpell = false;
                theName = "", lookingForName = true;
                theSphere = K_MAGIC_CHARM, lookingForSphere = true;
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

    if (inSpell) SPELLS_INFO.set(theName, theSphere);
}

//ITEMS

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