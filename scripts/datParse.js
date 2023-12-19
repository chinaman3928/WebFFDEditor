//TODO you can try to optimize within tokenizeNextLine() where if the first token cannot get you anything
// ie is not [SPELL], <NAME>, <SPHERE>, [something], [/.*]
// then you know not to continue tokenizing, just go to next line
// similarly, if you found [SPELL] or [something] or [/.*] then you can also go til next line

//also can optimize by ignoring everything until back in depth 0
//also can optimize by beelining til end of a nested subgroup
//also can optimize by ignoring line if the first token.size() < 3

function tokenizeNextLine(dv, i, tokens)
{
    let delim0_token1 = false;
    let tokenStart = i;
    while (true)
    {
        if (dv[i] == '#' || i == dv.byteLength() || dv[i] == '\n')
        {
            if (delim0_token1)  tokens.push(String.fromCharCode.apply(null, new Uint8Array(dv.buffer, tokenStart, tokenStart - i)));
            if (dv[i] == '#')   for (; i < dv.byteLength() && dv[i] != '\n'; ++i);
            return i + 1;   
        }

        const isDelim = (dv[i] == ':' || dv[i] == '\t' || dv[i] == '\r'); 
        i += (isDelim ^ delim0_token1);
        if      (isDelim && delim0_token1)      tokens.push(String.fromCharCode.apply(null, new Uint8Array(dv.buffer, tokenStart, tokenStart - i)));
        else if (!isDelim && !delim0_token1)    tokenStart = i;
        if      (isDelim == delim0_token1)      delim0_token1 = !delim0_token1;
    }
}

//TODO error if empty NAME?
// also for sphere, stays default charm if the value doesnt match anything
function parseSpellDat(dv, i, m)
{
    let hasSpell = false;
    let depth = 0, inSpell = false;
    let theName = "", lookingForName = true;
    let theSphere = K_MAGIC_CHARM, lookingForSphere = true;

    while (true)
    {
        let tokens = [];
        if ((i = tokenizeNextLine(dv, i, tokens)) >= dv.byteLength)
            break;
        if (!tokens.length || tokens[0].length < 3)
            continue;
        
        if (inSpell && depth == 1 && tokens[0][0] == '<' && tokens[0].at(-1) == '>')
        {
            if (tokens.size() == 1)
                return `The line up to but not including ${i} has too few tokens.`;
            if (lookingForName && tokens[0].slice(1, -1) == "NAME")
                theName = tokens[0].slice(1, -1), lookingForName = false;
            else if (lookingForSphere && tokens[0].slice(1, -1) == "SPHERE")
                theSphere = tokens[0].slice(1, -1), lookingForSphere = false;
        }
        else if (tokens[0][0] == '[' && tokens[0][1] == '/' && tokens[0].at(-1) == ']')
        {
            if (depth == 0)
                return `The line up to but not including ${i} has an end tag which closes nothing.`;
            if (depth == 1 && inSpell)
            {
                m.set(theName, theSphere); //TODO validation etc
                inSpell = false;
                theName = "", lookingForName = true;
                theSphere = K_MAGIC_CHARM, lookingForSphere = true;
            }
            --depth;
        }
        else if (tokens[0][0] == '[' && tokens[0].at(-1) == ']')
        {
            if (depth == 0 && tokens[0].slice(1, -1) == "SPELL")
                hasSpell = inSpell = true;
            ++depth;
        }
    }

    if (hasSpell)
        m.set(theName, theSphere);
    return "";
}