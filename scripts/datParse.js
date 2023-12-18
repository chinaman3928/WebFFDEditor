const SPELL_TAG = "[SPELL]";
const NAME_ATTR = "<NAME>:";
const SPHERE_ATTR = "<SPHERE>:";

//TODO a global stack for tags

function nextNameOrSphere(dv, i)
{
    //TODO if you come across a [] then there is something up
    // if a subtag then add to stackTag adnd ignore those
    // if an end SPELL which would empty the stackTag, then thats the end so stop looking
    let j = 0, k = 0;
    while (i < dv.byteLength && j < NAME_ATTR.length && k < SPHERE_ATTR.length)
    {
        let inc = false;
        j += (inc = dv[i] == NAME_ATTR[j]);
        k += (inc = dv[i++] == SPHERE_ATTR[k]);
        if (!inc) j = k = 0;
    }
    
    let ret = {i: i, which: (j == NAME_ATTR.length) ? "N" : (k == SPHERE_ATTR.length ? "S" : null), val: ""};
    while (ret.i < dv.byteLength && !dv[ret.i].isWhitespace())
        ret.val += dv[ret.i++];
    return ret;
}

function nextSpell(dv, i)
{
    //TODO but only if the [SPELL] you find is at a time when the tagStack is empty
    for (let j = 0; i < dv.byteLength && j < SPELL_TAG.length;)
        j = (dv[i++] == SPELL_TAG[j]) ? j + 1 : 0;
    return i;
}

//TODO casing and making more robust
//TODO TODO TODO lmao you can have nested tags which you need to skip stack-like
//ASSUMES no superfluous whitespace in and between tag/attribute : value pairs
//ASSUMES each SPELL has exactly one NAME and exactly one SPHERE
function parseSpellDat(dv, m)
{
    //TDDO default values for attributes you dont find
    for (let i = nextSpell(dv, 0); i < dv.byteLength; i = nextSpell(dv, i))
    {
        const firstAttr = nextNameOrSphere(dv, i);
        const secondAttr = nextNameOrSphere(dv, firstAttr.i);
        if (firstAttr.which == "N") m.set(firstAttr.val, secondAttr.val);
        else                        m.set(secondAttr.val, firstAttr.val);
        i = secondAttr.i;
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////



function parseLine(dv, i)
{
    while (dv[i] == "\t" || dv[i] == ":" || dv[i] == "\r")
        ++i;

    if (dv[i] == "\n")
        newLine;

    if (dv[i] == "[")
    {
        let nextDelim = getNextDelimOrComment(dv, i + 1);
        if ()
    }
    else if (dv[i] == "<")
        soethingElse;
    else
        nothing for us here;
}