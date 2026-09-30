# Character references

One folder per recurring character. Each has a PNG of the character in every
emotion plus `sheet.png` with all of them on one page:

| Folder | Character | Code |
|---|---|---|
| `main/` | the main character (spiky hair) | `Hero.main` |
| `speed/` | IShowSpeed | `Cameos.speed` |
| `ludwig/` | Ludwig | `Cameos.ludwig` |
| `beast/` | MrBeast | `Cameos.beast` |
| `nick/` | Nick | `Cameos.nick` |
| `slime/` | Slime | `Cameos.slime` |

These are renders of the code, not separate drawings, so they always match
what a skit draws. Use an emotion in a skit by name:

    Hero.main(ctx, { x, y, s, ...Emotions.shocked })

The emotions are defined once in `web/emotions.js`: neutral, happy, laughing,
excited, smirk, sad, sobbing, angry, yelling, scared, shocked,
stunned, hurt, dizzy, nervous, dread, confused, thinking, unimpressed, sleepy. After changing an emotion or a character, re-render
the folders:

    python3 scripts/emotion_sheets.py            # everyone
    python3 scripts/emotion_sheets.py main       # one character

To add a character, add it to `CAST` in `web/skits/emotions.js` and
`scripts/emotion_sheets.py`.

## Animals

`animals/sheet.png` is the approved look sheet for the house animal style
(`Animals2` in `web/animals2.js`): neutral, happy and snarl. Re-render it
from `?skit=animals2_sheet` after changing an animal. The rules are in the
Animals section of `STYLE.md`.
