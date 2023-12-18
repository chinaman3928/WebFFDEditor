

//TODO you can try to optimize within tokenizeNextLine() where if the first token cannot get you anything
// ie is not [SPELL], <NAME>, <SPHERE>, [something], [/.*]
// then you know not to continue tokenizing, just go to next line
// similarly, if you found [SPELL] or [something] or [/.*] then you can also go til next line

//also can optimize by ignoring everything until back in depth 0
//also can optimize by beelining til end of a nested subgroup
//also can optimize by ignoring line if the first token.size() < 3
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
        if (tokens.empty() || tokens[0].size() < 3)
            continue;
        
        if (inSpell && depth == 1 && tokens[0].front() == '<' && tokens[0].back() == '>')
        {
            if (tokens.size() == 1)
                return `The line up to but not including ${i} has too few tokens.`;

            if (lookingForName && tokens[0].insideSubstringEquals("NAME"))
            {
                theName = tokens[0].insideSubstring();
                lookingForName = false;
            }
            else if (lookingForSphere && tokens[0].insideSubstringEquals("SPHERE"))
            {
                theSphere = tokens[0].insideSubstring();
                lookingForSphere = false;
            }
        }
        else if (tokens[0][0] == '[' && tokens[0][1] == '/' && tokens[0].back() == ']')
        {
            if (depth == 0)
                return `The line up to but not including ${i} has an end tag which closes nothing.`;
            if (depth == 1 && inSpell)
            {
                m.set(theName, theSphere);
                inSpell = false;
                theName = "", lookingForName = true;
                theSphere = K_MAGIC_CHARM, lookingForSphere = true;
            }
            --depth;
        }
        else if (tokens[0].front() == '[' && tokens[0].back() == ']')
        {
            if (depth == 0 && tokens[0].insideSubstringEquals("SPELL"))
            {
                hasSpell = inSpell = true;
            }
            ++depth;
        }
    }
    if (hasSpell)
        m.set(theName, theSphere);
    return "";
}